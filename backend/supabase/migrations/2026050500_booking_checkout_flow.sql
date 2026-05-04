BEGIN;

-- Align prepared contracts with the deposit-first booking flow.
ALTER TABLE public.hop_dong
  ALTER COLUMN trang_thai SET DEFAULT 'CHO_LAP_KHOAN_THU_DAU';

ALTER TABLE public.hop_dong
  DROP CONSTRAINT IF EXISTS chk_hop_dong_target;

ALTER TABLE public.hop_dong
  ADD CONSTRAINT chk_hop_dong_target CHECK (
    (loai_muc_tieu = 'PHONG' AND ma_phong IS NOT NULL)
    OR
    (loai_muc_tieu = 'GIUONG' AND (ma_giuong IS NOT NULL OR ma_phong IS NOT NULL))
  );

-- Repair baseline schema typo in older bootstrap scripts if the table already exists.
ALTER TABLE public.giu_cho_tam
  ADD COLUMN IF NOT EXISTS checkoutUrl text;

ALTER TABLE public.giu_cho_tam
  ADD COLUMN IF NOT EXISTS paymentLinkid text;

-- Customer deposit invoices are keyed by the rental request and invoice type.
CREATE UNIQUE INDEX IF NOT EXISTS uq_hoa_don_dat_coc_per_request
ON public.hoa_don(ma_yeu_cau_thue, loai_hoa_don)
WHERE ma_yeu_cau_thue IS NOT NULL
  AND loai_hoa_don = 'DAT_COC';

-- A finalized checkout reconciliation must have at most one generated tracking voucher of each type.
CREATE UNIQUE INDEX IF NOT EXISTS uq_phieu_hoan_coc_per_doi_soat
ON public.phieu_hoan_coc(ma_doi_soat);

CREATE UNIQUE INDEX IF NOT EXISTS uq_phieu_tt_phat_sinh_per_doi_soat
ON public.phieu_thanh_toan_phat_sinh(ma_doi_soat);

COMMIT;
