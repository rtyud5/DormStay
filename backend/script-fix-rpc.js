const { supabase } = require("./src/config/supabase");

const sql = `
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

  -- 4) Validate beds are available (trang_thai IN ('TRONG', 'CON_TRONG'))
  IF v_bed_count > 0 THEN
    FOR v_bed_record IN
      SELECT g.ma_giuong, g.ma_giuong_hien_thi, g.trang_thai
      FROM public.giuong g
      WHERE g.ma_giuong = ANY(p_selected_beds)
        AND g.trang_thai NOT IN ('TRONG', 'CON_TRONG')
    LOOP
      RAISE EXCEPTION 'Bed % (%) is not available (status: %)',
        v_bed_record.ma_giuong, v_bed_record.ma_giuong_hien_thi, v_bed_record.trang_thai;
    END LOOP;
  END IF;

  -- 5) Expire stale holds before validating active bed holds
  IF v_bed_count > 0 THEN
    UPDATE public.giu_cho_tam
    SET trang_thai = 'HET_HAN',
        updated_at = NOW()
    WHERE trang_thai = 'DANG_GIU'
      AND thoi_gian_het_han IS NOT NULL
      AND thoi_gian_het_han < NOW()
      AND ma_giuong = ANY(p_selected_beds);

    SELECT count(*) INTO v_conflict_count
    FROM public.giu_cho_tam
    WHERE ma_giuong = ANY(p_selected_beds)
      AND trang_thai IN ('DANG_GIU', 'DA_XAC_NHAN_COC')
      AND (thoi_gian_het_han IS NULL OR thoi_gian_het_han > NOW());
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
`;

async function run() {
  // We can't execute raw SQL directly through supabase-js unless we have a custom RPC or use PostgREST.
  // Wait, does supabase-js allow schema execution? No, we have to run a sql command locally using psql or something if we have the connection string.
  // But wait, what if I just execute 'pg_query' Node module or use 'postgres' via package.json? Let's check package.json of backend.
}
run();
