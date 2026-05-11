-- =========================================================
-- Normalize availability/request statuses to canonical values.
-- Canonical room: TRONG | SAP_DAY | DAY | BAO_TRI
-- Canonical bed: TRONG | DA_THUE
-- Hold state lives in giu_cho_tam, not giuong.
-- =========================================================

BEGIN;

UPDATE public.phong
SET trang_thai = 'TRONG', updated_at = NOW()
WHERE trang_thai = 'CON_TRONG';

UPDATE public.phong
SET trang_thai = 'DAY', updated_at = NOW()
WHERE trang_thai IN ('DANG_O', 'DANG_SU_DUNG', 'DA_THUE_HET');

UPDATE public.giuong
SET trang_thai = 'TRONG', updated_at = NOW()
WHERE trang_thai = 'CON_TRONG';

UPDATE public.giuong
SET trang_thai = 'DA_THUE', updated_at = NOW()
WHERE trang_thai IN ('DANG_O', 'DANG_SU_DUNG', 'DA_THUE_HET', 'DANG_GIU');

UPDATE public.yeu_cau_thue
SET trang_thai = 'DANG_XU_LY', updated_at = NOW()
WHERE trang_thai IN ('MOI_TAO', 'CHO_XU_LY');

UPDATE public.yeu_cau_thue
SET trang_thai = 'DA_XAC_NHAN', updated_at = NOW()
WHERE trang_thai = 'DA_DUYET';

UPDATE public.yeu_cau_thue
SET trang_thai = 'QUA_HAN', updated_at = NOW()
WHERE trang_thai = 'TU_CHOI';

UPDATE public.nhat_ky_yeu_cau_thue
SET trang_thai_cu = 'DANG_XU_LY'
WHERE trang_thai_cu IN ('MOI_TAO', 'CHO_XU_LY');

UPDATE public.nhat_ky_yeu_cau_thue
SET trang_thai_moi = 'DANG_XU_LY'
WHERE trang_thai_moi IN ('MOI_TAO', 'CHO_XU_LY');

UPDATE public.nhat_ky_yeu_cau_thue
SET trang_thai_cu = 'DA_XAC_NHAN'
WHERE trang_thai_cu = 'DA_DUYET';

UPDATE public.nhat_ky_yeu_cau_thue
SET trang_thai_moi = 'DA_XAC_NHAN'
WHERE trang_thai_moi = 'DA_DUYET';

UPDATE public.nhat_ky_yeu_cau_thue
SET trang_thai_cu = 'QUA_HAN'
WHERE trang_thai_cu = 'TU_CHOI';

UPDATE public.nhat_ky_yeu_cau_thue
SET trang_thai_moi = 'QUA_HAN'
WHERE trang_thai_moi = 'TU_CHOI';

UPDATE public.hop_dong
SET trang_thai = 'HIEU_LUC', updated_at = NOW()
WHERE trang_thai = 'DANG_HIEU_LUC';

UPDATE public.hoa_don
SET trang_thai = 'DA_THANH_TOAN', updated_at = NOW()
WHERE trang_thai = 'THANH_TOAN_TOAN_BO';

UPDATE public.yeu_cau_tra_phong
SET trang_thai = 'DA_THANH_LY', updated_at = NOW()
WHERE trang_thai = 'HOAN_TAT';

UPDATE public.yeu_cau_tra_phong
SET trang_thai = 'DA_KIEM_TRA', updated_at = NOW()
WHERE trang_thai = 'CHO_DOI_SOAT';

UPDATE public.nhat_ky_he_thong
SET hanh_dong = 'XAC_NHAN_YEU_CAU'
WHERE hanh_dong = 'DUYET_YEU_CAU';

ALTER TABLE public.yeu_cau_thue
  ALTER COLUMN trang_thai SET DEFAULT 'DANG_XU_LY';

DROP FUNCTION IF EXISTS public.create_rental_request_with_holds(
  bigint,
  varchar,
  bigint,
  bigint[],
  date,
  numeric,
  numeric,
  varchar,
  timestamptz
);

CREATE OR REPLACE FUNCTION public.update_room_status_by_beds(
  p_ma_phong bigint
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_record RECORD;
  v_total_beds integer;
  v_rented_beds integer;
  v_new_status varchar;
  v_result jsonb;
BEGIN
  SELECT ma_phong, loai_phong, trang_thai
  INTO v_room_record
  FROM public.phong
  WHERE ma_phong = p_ma_phong;

  IF v_room_record.ma_phong IS NULL THEN
    RAISE EXCEPTION 'Room % not found', p_ma_phong;
  END IF;

  IF v_room_record.trang_thai = 'BAO_TRI' THEN
    SELECT to_jsonb(p.*) INTO v_result
    FROM public.phong p
    WHERE p.ma_phong = p_ma_phong;
    RETURN v_result;
  END IF;

  SELECT COUNT(*) INTO v_total_beds
  FROM public.giuong
  WHERE ma_phong = p_ma_phong;

  IF v_total_beds = 0 THEN
    SELECT to_jsonb(p.*) INTO v_result
    FROM public.phong p
    WHERE p.ma_phong = p_ma_phong;
    RETURN v_result;
  END IF;

  SELECT COUNT(*) INTO v_rented_beds
  FROM public.giuong
  WHERE ma_phong = p_ma_phong
    AND trang_thai = 'DA_THUE';

  IF v_rented_beds >= v_total_beds THEN
    v_new_status := 'DAY';
  ELSIF v_rented_beds > 0 THEN
    v_new_status := 'SAP_DAY';
  ELSE
    v_new_status := 'TRONG';
  END IF;

  IF v_new_status != v_room_record.trang_thai THEN
    UPDATE public.phong
    SET trang_thai = v_new_status,
        updated_at = NOW()
    WHERE ma_phong = p_ma_phong;
  END IF;

  SELECT to_jsonb(p.*) INTO v_result
  FROM public.phong p
  WHERE p.ma_phong = p_ma_phong;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_stale_holds()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expired_hold_count integer := 0;
  v_expired_request_count integer := 0;
BEGIN
  WITH expired AS (
    UPDATE public.giu_cho_tam
    SET trang_thai = 'HET_HAN',
        updated_at = NOW()
    WHERE trang_thai = 'DANG_GIU'
      AND thoi_gian_het_han < NOW()
    RETURNING ma_yeu_cau_thue
  )
  SELECT count(*) INTO v_expired_hold_count FROM expired;

  WITH requests_to_expire AS (
    SELECT DISTINCT gct.ma_yeu_cau_thue
    FROM public.giu_cho_tam gct
    JOIN public.yeu_cau_thue yct ON yct.ma_yeu_cau_thue = gct.ma_yeu_cau_thue
    WHERE yct.trang_thai IN ('DANG_XU_LY', 'CHO_THANH_TOAN')
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
  SELECT trang_thai INTO v_current_status
  FROM public.yeu_cau_thue
  WHERE ma_yeu_cau_thue = p_ma_yeu_cau_thue;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Request % not found', p_ma_yeu_cau_thue;
  END IF;

  IF v_current_status NOT IN ('DANG_XU_LY', 'CHO_THANH_TOAN') THEN
    RAISE EXCEPTION 'Cannot confirm payment - request is in status %', v_current_status;
  END IF;

  UPDATE public.yeu_cau_thue
  SET trang_thai = 'DA_COC',
      updated_at = NOW()
  WHERE ma_yeu_cau_thue = p_ma_yeu_cau_thue;

  UPDATE public.giu_cho_tam
  SET trang_thai = 'DA_XAC_NHAN_COC',
      updated_at = NOW()
  WHERE ma_yeu_cau_thue = p_ma_yeu_cau_thue
    AND trang_thai = 'DANG_GIU';

  SELECT to_jsonb(yct.*) INTO v_result
  FROM public.yeu_cau_thue yct
  WHERE yct.ma_yeu_cau_thue = p_ma_yeu_cau_thue;

  RETURN v_result;
END;
$$;

COMMIT;
