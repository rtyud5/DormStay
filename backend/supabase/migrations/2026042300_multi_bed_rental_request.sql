-- =========================================================
-- Migration: Multi-Bed Rental Request Support
-- Date: 2026-04-23
-- Description:
--   - Add so_luong_giuong_dat to yeu_cau_thue
--   - Relax chk_yct_target for multi-bed GIUONG requests
--   - Add indexes on giu_cho_tam for hold lookup
--   - Add unique partial indexes to prevent double-hold
--   - Backfill existing data
--   - Create RPC: create_rental_request_with_holds
--   - Create RPC: expire_stale_holds
--   - Create RPC: confirm_rental_payment
-- =========================================================

BEGIN;

-- =========================================================
-- A) Add column so_luong_giuong_dat
-- =========================================================
ALTER TABLE public.yeu_cau_thue
  ADD COLUMN IF NOT EXISTS so_luong_giuong_dat integer NOT NULL DEFAULT 1;

-- =========================================================
-- B) Drop & recreate chk_yct_target
--    Old: GIUONG => ma_giuong IS NOT NULL  (breaks multi-bed)
--    New: GIUONG => ma_phong IS NOT NULL    (ma_giuong optional)
-- =========================================================
ALTER TABLE public.yeu_cau_thue
  DROP CONSTRAINT IF EXISTS chk_yct_target;

ALTER TABLE public.yeu_cau_thue
  ADD CONSTRAINT chk_yct_target CHECK (
    (loai_muc_tieu = 'PHONG' AND ma_phong IS NOT NULL)
    OR
    (loai_muc_tieu = 'GIUONG' AND (ma_giuong IS NOT NULL OR ma_phong IS NOT NULL))
  );

-- =========================================================
-- C) Indexes on giu_cho_tam for hold lookup
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_giu_cho_tam_ma_yct
  ON public.giu_cho_tam(ma_yeu_cau_thue);

CREATE INDEX IF NOT EXISTS idx_giu_cho_tam_ma_giuong_status
  ON public.giu_cho_tam(ma_giuong, trang_thai, thoi_gian_het_han);

CREATE INDEX IF NOT EXISTS idx_giu_cho_tam_ma_phong_status
  ON public.giu_cho_tam(ma_phong, trang_thai, thoi_gian_het_han);

-- =========================================================
-- D) Unique partial indexes to prevent double-hold
-- =========================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_giu_cho_tam_active_bed
  ON public.giu_cho_tam(ma_giuong)
  WHERE ma_giuong IS NOT NULL
    AND trang_thai IN ('DANG_GIU', 'DA_XAC_NHAN_COC');

CREATE UNIQUE INDEX IF NOT EXISTS uq_giu_cho_tam_active_room
  ON public.giu_cho_tam(ma_phong)
  WHERE ma_phong IS NOT NULL
    AND loai_muc_tieu = 'PHONG'
    AND trang_thai IN ('DANG_GIU', 'DA_XAC_NHAN_COC');

-- =========================================================
-- E) Backfill existing data
-- =========================================================
UPDATE public.yeu_cau_thue
SET so_luong_giuong_dat = 1
WHERE so_luong_giuong_dat IS NULL;

-- =========================================================
-- F) RPC: create_rental_request_with_holds
--    Atomically creates 1 yeu_cau_thue + N giu_cho_tam rows
-- =========================================================
CREATE OR REPLACE FUNCTION public.create_rental_request_with_holds(
  p_ma_ho_so_khach_hang  bigint,
  p_loai_muc_tieu        varchar,
  p_ma_phong             bigint,
  p_selected_beds        bigint[],
  p_ngay_du_kien_vao_o   date,
  p_gia_thue_thang       numeric,
  p_so_tien_dat_coc      numeric,
  p_trang_thai           varchar DEFAULT 'DANG_XU_LY',
  p_thoi_gian_het_han    timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_yct_id         bigint;
  v_bed_count      integer;
  v_bed_record     record;
  v_hold_expiry    timestamptz;
  v_conflict_count integer;
  v_result         jsonb;
BEGIN
  -- Default hold expiry = 24h from now
  v_hold_expiry := COALESCE(p_thoi_gian_het_han, NOW() + INTERVAL '24 hours');

  -- Determine bed count
  v_bed_count := COALESCE(array_length(p_selected_beds, 1), 0);

  -- -------------------------------------------------------
  -- Validation
  -- -------------------------------------------------------

  -- 1) For GIUONG requests, must have at least 1 bed
  IF p_loai_muc_tieu = 'GIUONG' AND v_bed_count = 0 THEN
    RAISE EXCEPTION 'GIUONG request requires at least 1 bed in p_selected_beds';
  END IF;

  -- 2) For PHONG requests, must have beds (all beds in room)
  IF p_loai_muc_tieu = 'PHONG' AND v_bed_count = 0 THEN
    RAISE EXCEPTION 'PHONG request requires beds in p_selected_beds';
  END IF;

  -- 3) Validate all beds belong to the specified room
  IF v_bed_count > 0 THEN
    PERFORM 1
    FROM unnest(p_selected_beds) AS bed_id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.giuong
      WHERE ma_giuong = bed_id AND ma_phong = p_ma_phong
    );
    IF FOUND THEN
      RAISE EXCEPTION 'One or more beds do not belong to room %', p_ma_phong;
    END IF;
  END IF;

  -- 4) Validate beds are available (trang_thai = CON_TRONG)
  IF v_bed_count > 0 THEN
    FOR v_bed_record IN
      SELECT g.ma_giuong, g.ma_giuong_hien_thi, g.trang_thai
      FROM public.giuong g
      WHERE g.ma_giuong = ANY(p_selected_beds)
        AND g.trang_thai <> 'CON_TRONG'
    LOOP
      RAISE EXCEPTION 'Bed % (%) is not available (status: %)',
        v_bed_record.ma_giuong, v_bed_record.ma_giuong_hien_thi, v_bed_record.trang_thai;
    END LOOP;
  END IF;

  -- 5) Validate no active holds exist for these beds
  IF v_bed_count > 0 THEN
    SELECT count(*) INTO v_conflict_count
    FROM public.giu_cho_tam
    WHERE ma_giuong = ANY(p_selected_beds)
      AND trang_thai IN ('DANG_GIU', 'DA_XAC_NHAN_COC')
      AND thoi_gian_het_han > NOW();
    IF v_conflict_count > 0 THEN
      RAISE EXCEPTION 'One or more beds already have active holds (% conflicts)', v_conflict_count;
    END IF;
  END IF;

  -- -------------------------------------------------------
  -- Insert yeu_cau_thue
  -- -------------------------------------------------------
  INSERT INTO public.yeu_cau_thue (
    ma_ho_so_khach_hang,
    loai_muc_tieu,
    ma_phong,
    ma_giuong,
    so_luong_giuong_dat,
    ngay_du_kien_vao_o,
    gia_thue_thang,
    so_tien_dat_coc,
    trang_thai
  ) VALUES (
    p_ma_ho_so_khach_hang,
    p_loai_muc_tieu,
    p_ma_phong,
    CASE WHEN v_bed_count = 1 AND p_loai_muc_tieu = 'GIUONG'
         THEN p_selected_beds[1]
         ELSE NULL
    END,
    v_bed_count,
    p_ngay_du_kien_vao_o,
    p_gia_thue_thang,
    p_so_tien_dat_coc,
    p_trang_thai
  )
  RETURNING ma_yeu_cau_thue INTO v_yct_id;

  -- -------------------------------------------------------
  -- Insert giu_cho_tam rows (one per bed)
  -- -------------------------------------------------------
  IF v_bed_count > 0 THEN
    INSERT INTO public.giu_cho_tam (
      ma_yeu_cau_thue,
      loai_muc_tieu,
      ma_phong,
      ma_giuong,
      trang_thai,
      thoi_gian_het_han
    )
    SELECT
      v_yct_id,
      'GIUONG',
      p_ma_phong,
      bed_id,
      'DANG_GIU',
      v_hold_expiry
    FROM unnest(p_selected_beds) AS bed_id;
  END IF;

  -- -------------------------------------------------------
  -- Return the created request as JSONB
  -- -------------------------------------------------------
  SELECT to_jsonb(yct.*) INTO v_result
  FROM public.yeu_cau_thue yct
  WHERE yct.ma_yeu_cau_thue = v_yct_id;

  RETURN v_result;
END;
$$;

-- =========================================================
-- G) RPC: expire_stale_holds
--    Expires holds past their deadline, updates parent request
-- =========================================================
CREATE OR REPLACE FUNCTION public.expire_stale_holds()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expired_hold_count integer := 0;
  v_expired_request_count integer := 0;
BEGIN
  -- 1) Update stale holds to HET_HAN
  WITH expired AS (
    UPDATE public.giu_cho_tam
    SET trang_thai = 'HET_HAN',
        updated_at = NOW()
    WHERE trang_thai = 'DANG_GIU'
      AND thoi_gian_het_han < NOW()
    RETURNING ma_yeu_cau_thue
  )
  SELECT count(*) INTO v_expired_hold_count FROM expired;

  -- 2) Update parent requests to QUA_HAN
  --    Only if ALL holds for that request are now expired/cancelled
  --    and the request hasn't been paid yet
  WITH requests_to_expire AS (
    SELECT DISTINCT gct.ma_yeu_cau_thue
    FROM public.giu_cho_tam gct
    JOIN public.yeu_cau_thue yct ON yct.ma_yeu_cau_thue = gct.ma_yeu_cau_thue
    WHERE yct.trang_thai IN ('DANG_XU_LY', 'MOI_TAO', 'CHO_THANH_TOAN')
      AND NOT EXISTS (
        SELECT 1 FROM public.giu_cho_tam gct2
        WHERE gct2.ma_yeu_cau_thue = gct.ma_yeu_cau_thue
          AND gct2.trang_thai IN ('DANG_GIU', 'DA_XAC_NHAN_COC')
      )
  ),
  updated_requests AS (
    UPDATE public.yeu_cau_thue
    SET trang_thai = 'QUA_HAN',
        updated_at = NOW()
    WHERE ma_yeu_cau_thue IN (SELECT ma_yeu_cau_thue FROM requests_to_expire)
    RETURNING ma_yeu_cau_thue
  )
  SELECT count(*) INTO v_expired_request_count FROM updated_requests;

  RETURN jsonb_build_object(
    'expired_holds', v_expired_hold_count,
    'expired_requests', v_expired_request_count
  );
END;
$$;

-- =========================================================
-- H) RPC: confirm_rental_payment
--    Updates request + holds after successful payment
-- =========================================================
CREATE OR REPLACE FUNCTION public.confirm_rental_payment(
  p_ma_yeu_cau_thue bigint
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_current_status varchar;
BEGIN
  -- Check current status
  SELECT trang_thai INTO v_current_status
  FROM public.yeu_cau_thue
  WHERE ma_yeu_cau_thue = p_ma_yeu_cau_thue;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Request % not found', p_ma_yeu_cau_thue;
  END IF;

  -- Only allow confirm from these states
  IF v_current_status NOT IN ('DANG_XU_LY', 'MOI_TAO', 'CHO_THANH_TOAN') THEN
    RAISE EXCEPTION 'Cannot confirm payment - request is in status %', v_current_status;
  END IF;

  -- Update yeu_cau_thue
  UPDATE public.yeu_cau_thue
  SET trang_thai = 'DA_COC',
      updated_at = NOW()
  WHERE ma_yeu_cau_thue = p_ma_yeu_cau_thue;

  -- Update all active holds to DA_XAC_NHAN_COC
  UPDATE public.giu_cho_tam
  SET trang_thai = 'DA_XAC_NHAN_COC',
      updated_at = NOW()
  WHERE ma_yeu_cau_thue = p_ma_yeu_cau_thue
    AND trang_thai = 'DANG_GIU';

  -- Return updated request
  SELECT to_jsonb(yct.*) INTO v_result
  FROM public.yeu_cau_thue yct
  WHERE yct.ma_yeu_cau_thue = p_ma_yeu_cau_thue;

  RETURN v_result;
END;
$$;

COMMIT;
