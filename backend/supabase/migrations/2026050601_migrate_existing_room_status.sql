-- =========================================================
-- Data Migration: Update room status based on bed availability
-- This script updates existing room statuses to match the new logic
-- =========================================================

BEGIN;

-- Step 1: Update all PHONG_CHUNG (dorm rooms) based on bed availability
UPDATE public.phong p
SET trang_thai = (
  CASE 
    -- Count rented/held beds in this room
    WHEN (
      SELECT COUNT(*) FROM public.giuong g 
      WHERE g.ma_phong = p.ma_phong 
      AND g.trang_thai IN ('DA_THUE', 'DANG_GIU')
    ) >= (
      SELECT COUNT(*) FROM public.giuong g 
      WHERE g.ma_phong = p.ma_phong
    ) AND (
      SELECT COUNT(*) FROM public.giuong g 
      WHERE g.ma_phong = p.ma_phong
    ) > 0 THEN 'DAY'
    
    WHEN (
      SELECT COUNT(*) FROM public.giuong g 
      WHERE g.ma_phong = p.ma_phong 
      AND g.trang_thai IN ('DA_THUE', 'DANG_GIU')
    ) > 0 AND (
      SELECT COUNT(*) FROM public.giuong g 
      WHERE g.ma_phong = p.ma_phong
    ) > 0 THEN 'SAP_DAY'
    
    WHEN (
      SELECT COUNT(*) FROM public.giuong g 
      WHERE g.ma_phong = p.ma_phong
    ) > 0 THEN 'TRONG'
    
    -- For rooms without beds, keep current status
    ELSE p.trang_thai
  END
),
updated_at = NOW()
WHERE p.loai_phong = 'PHONG_CHUNG'
AND p.trang_thai NOT IN ('DA_THUE_HET', 'DA_THUE');

-- Step 2: For whole room rentals (rooms without beds), ensure they are DAY if contract is active
-- Only if they have active contracts
UPDATE public.phong p
SET trang_thai = 'DAY',
    updated_at = NOW()
WHERE p.loai_phong != 'PHONG_CHUNG'
  AND (
    SELECT COUNT(*) FROM public.giuong g WHERE g.ma_phong = p.ma_phong
  ) = 0
  AND (
    SELECT COUNT(*) FROM public.hop_dong hd
    WHERE hd.ma_phong = p.ma_phong
    AND hd.loai_muc_tieu = 'PHONG'
    AND hd.trang_thai IN ('HIEU_LUC', 'DA_KY')
  ) > 0
  AND p.trang_thai NOT IN ('DAY', 'DA_THUE_HET');

-- Step 3: Mark rooms with no available beds and no contracts as available
UPDATE public.phong p
SET trang_thai = 'TRONG',
    updated_at = NOW()
WHERE (
  SELECT COUNT(*) FROM public.giuong g WHERE g.ma_phong = p.ma_phong AND g.trang_thai IN ('DA_THUE', 'DANG_GIU')
) = 0
AND (
  SELECT COUNT(*) FROM public.hop_dong hd
  WHERE hd.ma_phong = p.ma_phong
  AND hd.trang_thai IN ('HIEU_LUC', 'DA_KY')
) = 0
AND p.trang_thai IN ('DAY', 'SAP_DAY');

COMMIT;
