BEGIN;

-- Sale no longer approves rental requests. Keep the historical rows on
-- the canonical "confirmed" status used by the deposit-first flow.
UPDATE public.yeu_cau_thue
SET trang_thai = 'DA_XAC_NHAN',
    updated_at = now()
WHERE trang_thai = 'DA_DUYET';

UPDATE public.nhat_ky_yeu_cau_thue
SET trang_thai_cu = 'DA_XAC_NHAN'
WHERE trang_thai_cu = 'DA_DUYET';

UPDATE public.nhat_ky_yeu_cau_thue
SET trang_thai_moi = 'DA_XAC_NHAN'
WHERE trang_thai_moi = 'DA_DUYET';

UPDATE public.nhat_ky_he_thong
SET hanh_dong = 'XAC_NHAN_YEU_CAU'
WHERE hanh_dong = 'DUYET_YEU_CAU';

-- Manager finalizes checkout requests with DA_THANH_LY; HOAN_TAT is an old alias.
UPDATE public.yeu_cau_tra_phong
SET trang_thai = 'DA_THANH_LY',
    updated_at = now()
WHERE trang_thai = 'HOAN_TAT';

COMMIT;
