begin;

-- =========================================================
-- XOA BO DU LIEU TEST CU CUNG NHOM EMAIL / TOA TEST
-- =========================================================

delete from public.bien_lai
where ma_hoa_don in (
  select ma_hoa_don
  from public.hoa_don
  where ma_hop_dong in (
    select ma_hop_dong
    from public.hop_dong
    where ma_ho_so_khach_hang in (
      select ma_ho_so
      from public.ho_so
      where email in (
        'test.recon.customer1@dormstay.local',
        'test.recon.customer2@dormstay.local',
        'test.recon.customer3@dormstay.local',
        'test.recon.customer4@dormstay.local'
      )
    )
  )
);

delete from public.thanh_toan
where ma_hoa_don in (
  select ma_hoa_don
  from public.hoa_don
  where ma_hop_dong in (
    select ma_hop_dong
    from public.hop_dong
    where ma_ho_so_khach_hang in (
      select ma_ho_so
      from public.ho_so
      where email in (
        'test.recon.customer1@dormstay.local',
        'test.recon.customer2@dormstay.local',
        'test.recon.customer3@dormstay.local',
        'test.recon.customer4@dormstay.local'
      )
    )
  )
);

delete from public.chi_tiet_hoa_don
where ma_hoa_don in (
  select ma_hoa_don
  from public.hoa_don
  where ma_hop_dong in (
    select ma_hop_dong
    from public.hop_dong
    where ma_ho_so_khach_hang in (
      select ma_ho_so
      from public.ho_so
      where email in (
        'test.recon.customer1@dormstay.local',
        'test.recon.customer2@dormstay.local',
        'test.recon.customer3@dormstay.local',
        'test.recon.customer4@dormstay.local'
      )
    )
  )
);

delete from public.khoan_thu_hop_dong
where ma_hop_dong in (
  select ma_hop_dong
  from public.hop_dong
  where ma_ho_so_khach_hang in (
    select ma_ho_so
    from public.ho_so
    where email in (
      'test.recon.customer1@dormstay.local',
      'test.recon.customer2@dormstay.local',
      'test.recon.customer3@dormstay.local',
      'test.recon.customer4@dormstay.local'
    )
  )
);

delete from public.phieu_hoan_coc
where ma_hop_dong in (
  select ma_hop_dong
  from public.hop_dong
  where ma_ho_so_khach_hang in (
    select ma_ho_so
    from public.ho_so
    where email in (
      'test.recon.customer1@dormstay.local',
      'test.recon.customer2@dormstay.local',
      'test.recon.customer3@dormstay.local',
      'test.recon.customer4@dormstay.local'
    )
  )
);

delete from public.phieu_thanh_toan_phat_sinh
where ma_hop_dong in (
  select ma_hop_dong
  from public.hop_dong
  where ma_ho_so_khach_hang in (
    select ma_ho_so
    from public.ho_so
    where email in (
      'test.recon.customer1@dormstay.local',
      'test.recon.customer2@dormstay.local',
      'test.recon.customer3@dormstay.local',
      'test.recon.customer4@dormstay.local'
    )
  )
);

delete from public.chi_tiet_doi_soat_tai_chinh
where ma_doi_soat in (
  select ma_doi_soat
  from public.doi_soat_tai_chinh
  where ma_hop_dong in (
    select ma_hop_dong
    from public.hop_dong
    where ma_ho_so_khach_hang in (
      select ma_ho_so
      from public.ho_so
      where email in (
        'test.recon.customer1@dormstay.local',
        'test.recon.customer2@dormstay.local',
        'test.recon.customer3@dormstay.local',
        'test.recon.customer4@dormstay.local'
      )
    )
  )
);

delete from public.doi_soat_tai_chinh
where ma_hop_dong in (
  select ma_hop_dong
  from public.hop_dong
  where ma_ho_so_khach_hang in (
    select ma_ho_so
    from public.ho_so
    where email in (
      'test.recon.customer1@dormstay.local',
      'test.recon.customer2@dormstay.local',
      'test.recon.customer3@dormstay.local',
      'test.recon.customer4@dormstay.local'
    )
  )
);

delete from public.chi_tiet_kiem_tra
where ma_bien_ban_kiem_tra in (
  select bbkt.ma_bien_ban_kiem_tra
  from public.bien_ban_kiem_tra bbkt
  join public.yeu_cau_tra_phong yctp on yctp.ma_yeu_cau_tra_phong = bbkt.ma_yeu_cau_tra_phong
  join public.hop_dong hd on hd.ma_hop_dong = yctp.ma_hop_dong
  join public.ho_so hs on hs.ma_ho_so = hd.ma_ho_so_khach_hang
  where hs.email in (
    'test.recon.customer1@dormstay.local',
    'test.recon.customer2@dormstay.local',
    'test.recon.customer3@dormstay.local',
    'test.recon.customer4@dormstay.local'
  )
);

delete from public.bien_ban_kiem_tra
where ma_yeu_cau_tra_phong in (
  select yctp.ma_yeu_cau_tra_phong
  from public.yeu_cau_tra_phong yctp
  join public.hop_dong hd on hd.ma_hop_dong = yctp.ma_hop_dong
  join public.ho_so hs on hs.ma_ho_so = hd.ma_ho_so_khach_hang
  where hs.email in (
    'test.recon.customer1@dormstay.local',
    'test.recon.customer2@dormstay.local',
    'test.recon.customer3@dormstay.local',
    'test.recon.customer4@dormstay.local'
  )
);

delete from public.yeu_cau_tra_phong
where ma_hop_dong in (
  select ma_hop_dong
  from public.hop_dong
  where ma_ho_so_khach_hang in (
    select ma_ho_so
    from public.ho_so
    where email in (
      'test.recon.customer1@dormstay.local',
      'test.recon.customer2@dormstay.local',
      'test.recon.customer3@dormstay.local',
      'test.recon.customer4@dormstay.local'
    )
  )
);

delete from public.hoa_don
where ma_hop_dong in (
  select ma_hop_dong
  from public.hop_dong
  where ma_ho_so_khach_hang in (
    select ma_ho_so
    from public.ho_so
    where email in (
      'test.recon.customer1@dormstay.local',
      'test.recon.customer2@dormstay.local',
      'test.recon.customer3@dormstay.local',
      'test.recon.customer4@dormstay.local'
    )
  )
);

delete from public.hop_dong
where ma_ho_so_khach_hang in (
  select ma_ho_so
  from public.ho_so
  where email in (
    'test.recon.customer1@dormstay.local',
    'test.recon.customer2@dormstay.local',
    'test.recon.customer3@dormstay.local',
    'test.recon.customer4@dormstay.local'
  )
);

delete from public.yeu_cau_thue
where ma_ho_so_khach_hang in (
  select ma_ho_so
  from public.ho_so
  where email in (
    'test.recon.customer1@dormstay.local',
    'test.recon.customer2@dormstay.local',
    'test.recon.customer3@dormstay.local',
    'test.recon.customer4@dormstay.local'
  )
);

delete from public.giuong
where ma_phong in (
  select ma_phong
  from public.phong
  where ma_toa in (select ma_toa from public.toa where ma_dinh_danh = 'TEST-RECON')
);

delete from public.phong
where ma_toa in (select ma_toa from public.toa where ma_dinh_danh = 'TEST-RECON');

delete from public.tang
where ma_toa in (select ma_toa from public.toa where ma_dinh_danh = 'TEST-RECON');

delete from public.toa
where ma_dinh_danh = 'TEST-RECON';

delete from public.ho_so
where email in (
  'test.recon.inspector@dormstay.local',
  'test.recon.customer1@dormstay.local',
  'test.recon.customer2@dormstay.local',
  'test.recon.customer3@dormstay.local',
  'test.recon.customer4@dormstay.local'
);

-- =========================================================
-- TAO TOA / TANG / PHONG / GIUONG TEST
-- =========================================================

with inserted_toa as (
  insert into public.toa (ma_dinh_danh, ten, dia_chi, quan_huyen, thanh_pho)
  values ('TEST-RECON', 'Toa test doi soat', 'Khu du lieu test doi soat', 'Quan 1', 'TP HCM')
  returning ma_toa
)
insert into public.tang (ma_toa, so_tang, ten_tang)
select ma_toa, 9, 'Tang 9 test doi soat'
from inserted_toa;

insert into public.phong (
  ma_toa,
  ma_tang,
  ma_phong_hien_thi,
  loai_phong,
  suc_chua,
  gia_thang,
  trang_thai,
  gioi_tinh
)
select t.ma_toa, tg.ma_tang, room_data.ma_phong_hien_thi, 'STANDARD', 1, room_data.gia_thang, 'DANG_O', 'Nam/Nữ'
from public.toa t
join public.tang tg on tg.ma_toa = t.ma_toa and tg.so_tang = 9
join (
  values
    ('901', 3000000),
    ('902', 2500000),
    ('903', 3000000),
    ('904', 3500000)
) as room_data(ma_phong_hien_thi, gia_thang) on true
where t.ma_dinh_danh = 'TEST-RECON';

insert into public.giuong (ma_phong, ma_giuong_hien_thi, nhan_giuong, gia_thang, trang_thai)
select p.ma_phong, 'G1', concat('Bed-', p.ma_phong_hien_thi), p.gia_thang, 'DANG_O'
from public.phong p
join public.toa t on t.ma_toa = p.ma_toa
where t.ma_dinh_danh = 'TEST-RECON';

-- =========================================================
-- TAO HO SO TEST
-- =========================================================

insert into public.ho_so (vai_tro, ho_ten, email, so_dien_thoai)
values
  ('NHAN_VIEN', 'Nhan vien kiem tra test', 'test.recon.inspector@dormstay.local', '0900000100'),
  ('KHACH_HANG', 'Nguyen Minh Khang', 'test.recon.customer1@dormstay.local', '0907118225'),
  ('KHACH_HANG', 'Tran Thu Ha', 'test.recon.customer2@dormstay.local', '0912501119'),
  ('KHACH_HANG', 'Le Gia Phuc', 'test.recon.customer3@dormstay.local', '0988624771'),
  ('KHACH_HANG', 'Pham Anh Thu', 'test.recon.customer4@dormstay.local', '0933123456');

-- =========================================================
-- CASE 1: CHO_DOI_SOAT
-- =========================================================

with customer as (
  select ma_ho_so from public.ho_so where email = 'test.recon.customer1@dormstay.local'
),
bed as (
  select g.ma_giuong, g.ma_phong
  from public.giuong g
  join public.phong p on p.ma_phong = g.ma_phong
  join public.toa t on t.ma_toa = p.ma_toa
  where t.ma_dinh_danh = 'TEST-RECON' and p.ma_phong_hien_thi = '901' and g.ma_giuong_hien_thi = 'G1'
),
inserted_request as (
  insert into public.yeu_cau_thue (
    ma_ho_so_khach_hang,
    loai_muc_tieu,
    ma_giuong,
    ngay_du_kien_vao_o,
    gia_thue_thang,
    so_tien_dat_coc,
    trang_thai
  )
  select customer.ma_ho_so, 'GIUONG', bed.ma_giuong, date '2025-08-15', 3000000, 6000000, 'DA_DUYET'
  from customer, bed
  returning ma_yeu_cau_thue, ma_ho_so_khach_hang
),
inserted_contract as (
  insert into public.hop_dong (
    ma_yeu_cau_thue,
    ma_ho_so_khach_hang,
    loai_muc_tieu,
    ma_phong,
    ma_giuong,
    ngay_vao_o,
    gia_thue_co_ban_thang,
    so_tien_dat_coc_bao_dam,
    trang_thai
  )
  select req.ma_yeu_cau_thue, req.ma_ho_so_khach_hang, 'GIUONG', bed.ma_phong, bed.ma_giuong, date '2025-08-15', 3000000, 6000000, 'HIEU_LUC'
  from inserted_request req, bed
  returning ma_hop_dong, ma_ho_so_khach_hang
),
inserted_invoice as (
  insert into public.hoa_don (
    ma_hop_dong,
    loai_hoa_don,
    trang_thai,
    tong_so_tien,
    so_tien_da_thanh_toan,
    ngay_lap,
    ngay_den_han
  )
  select ma_hop_dong, 'PHAT_SINH_DICH_VU', 'CHO_THANH_TOAN', 420000, 0, current_date - 10, current_date - 2
  from inserted_contract
  returning ma_hoa_don
),
inserted_checkout as (
  insert into public.yeu_cau_tra_phong (
    ma_hop_dong,
    ma_ho_so_khach_hang,
    ngay_yeu_cau_tra_phong,
    gio_ban_giao,
    ly_do,
    trang_thai
  )
  select ma_hop_dong, ma_ho_so_khach_hang, current_date - 1, time '07:30', 'Tra phong som do chuyen cong tac', 'DANG_KIEM_TRA'
  from inserted_contract
  returning ma_yeu_cau_tra_phong
),
inserted_inspection as (
  insert into public.bien_ban_kiem_tra (
    ma_yeu_cau_tra_phong,
    ma_hop_dong,
    ma_ho_so_nguoi_kiem_tra,
    thoi_gian_kiem_tra,
    tong_uoc_tinh_khau_tru,
    trang_thai
  )
  select checkout.ma_yeu_cau_tra_phong, contract.ma_hop_dong, inspector.ma_ho_so, now() - interval '1 hour', 250000, 'DA_KIEM_TRA'
  from inserted_checkout checkout
  cross join inserted_contract contract
  cross join (select ma_ho_so from public.ho_so where email = 'test.recon.inspector@dormstay.local') inspector
  returning ma_bien_ban_kiem_tra
)
insert into public.chi_tiet_kiem_tra (
  ma_bien_ban_kiem_tra,
  ten_tai_san,
  tinh_trang,
  so_tien_boi_thuong
)
select ma_bien_ban_kiem_tra, 'Chia khoa du phong', 'Mat 1 chia khoa du phong', 250000
from inserted_inspection;

-- =========================================================
-- CASE 2: DANG_LAP
-- =========================================================

with customer as (
  select ma_ho_so from public.ho_so where email = 'test.recon.customer2@dormstay.local'
),
bed as (
  select g.ma_giuong, g.ma_phong
  from public.giuong g
  join public.phong p on p.ma_phong = g.ma_phong
  join public.toa t on t.ma_toa = p.ma_toa
  where t.ma_dinh_danh = 'TEST-RECON' and p.ma_phong_hien_thi = '902' and g.ma_giuong_hien_thi = 'G1'
),
inserted_request as (
  insert into public.yeu_cau_thue (
    ma_ho_so_khach_hang,
    loai_muc_tieu,
    ma_giuong,
    ngay_du_kien_vao_o,
    gia_thue_thang,
    so_tien_dat_coc,
    trang_thai
  )
  select customer.ma_ho_so, 'GIUONG', bed.ma_giuong, date '2024-10-01', 2500000, 5000000, 'DA_DUYET'
  from customer, bed
  returning ma_yeu_cau_thue, ma_ho_so_khach_hang
),
inserted_contract as (
  insert into public.hop_dong (
    ma_yeu_cau_thue,
    ma_ho_so_khach_hang,
    loai_muc_tieu,
    ma_phong,
    ma_giuong,
    ngay_vao_o,
    gia_thue_co_ban_thang,
    so_tien_dat_coc_bao_dam,
    trang_thai
  )
  select req.ma_yeu_cau_thue, req.ma_ho_so_khach_hang, 'GIUONG', bed.ma_phong, bed.ma_giuong, date '2024-10-01', 2500000, 5000000, 'HIEU_LUC'
  from inserted_request req, bed
  returning ma_hop_dong, ma_ho_so_khach_hang
),
inserted_checkout as (
  insert into public.yeu_cau_tra_phong (
    ma_hop_dong,
    ma_ho_so_khach_hang,
    ngay_yeu_cau_tra_phong,
    gio_ban_giao,
    ly_do,
    trang_thai
  )
  select ma_hop_dong, ma_ho_so_khach_hang, current_date + 1, time '10:00', 'Ket thuc hop dong va doi chuyen noi o', 'DANG_KIEM_TRA'
  from inserted_contract
  returning ma_yeu_cau_tra_phong
),
inserted_inspection as (
  insert into public.bien_ban_kiem_tra (
    ma_yeu_cau_tra_phong,
    ma_hop_dong,
    ma_ho_so_nguoi_kiem_tra,
    thoi_gian_kiem_tra,
    tong_uoc_tinh_khau_tru,
    trang_thai
  )
  select checkout.ma_yeu_cau_tra_phong, contract.ma_hop_dong, inspector.ma_ho_so, now() - interval '30 minutes', 180000, 'DA_KIEM_TRA'
  from inserted_checkout checkout
  cross join inserted_contract contract
  cross join (select ma_ho_so from public.ho_so where email = 'test.recon.inspector@dormstay.local') inspector
  returning ma_bien_ban_kiem_tra
),
inserted_reconciliation as (
  insert into public.doi_soat_tai_chinh (
    ma_hop_dong,
    so_tien_dat_coc_ban_dau,
    so_tien_hoan_lai,
    so_tien_can_thanh_toan_them,
    trang_thai
  )
  select ma_hop_dong, 5000000, 3420000, 0, 'DANG_LAP'
  from inserted_contract
  returning ma_doi_soat
)
insert into public.chi_tiet_doi_soat_tai_chinh (
  ma_doi_soat,
  danh_muc,
  huong_giao_dich,
  loai_nguon,
  ma_nguon,
  so_tien,
  mo_ta
)
select ma_doi_soat, 'TIEN_DICH_VU', 'THU', 'KIEM_TRA', null::bigint, 180000, 'Phi ve sinh cuoi ky'
from inserted_reconciliation
union all
select ma_doi_soat, 'DIEU_CHINH_HOAN_THEM', 'CHI', null, null::bigint, 100000, 'Dieu chinh ho tro khach hang'
from inserted_reconciliation;

-- =========================================================
-- CASE 3: CHO_HANH_DONG
-- =========================================================

with customer as (
  select ma_ho_so from public.ho_so where email = 'test.recon.customer3@dormstay.local'
),
bed as (
  select g.ma_giuong, g.ma_phong
  from public.giuong g
  join public.phong p on p.ma_phong = g.ma_phong
  join public.toa t on t.ma_toa = p.ma_toa
  where t.ma_dinh_danh = 'TEST-RECON' and p.ma_phong_hien_thi = '903' and g.ma_giuong_hien_thi = 'G1'
),
inserted_request as (
  insert into public.yeu_cau_thue (
    ma_ho_so_khach_hang,
    loai_muc_tieu,
    ma_giuong,
    ngay_du_kien_vao_o,
    gia_thue_thang,
    so_tien_dat_coc,
    trang_thai
  )
  select customer.ma_ho_so, 'GIUONG', bed.ma_giuong, date '2025-12-10', 3000000, 3000000, 'DA_DUYET'
  from customer, bed
  returning ma_yeu_cau_thue, ma_ho_so_khach_hang
),
inserted_contract as (
  insert into public.hop_dong (
    ma_yeu_cau_thue,
    ma_ho_so_khach_hang,
    loai_muc_tieu,
    ma_phong,
    ma_giuong,
    ngay_vao_o,
    gia_thue_co_ban_thang,
    so_tien_dat_coc_bao_dam,
    trang_thai
  )
  select req.ma_yeu_cau_thue, req.ma_ho_so_khach_hang, 'GIUONG', bed.ma_phong, bed.ma_giuong, date '2025-12-10', 3000000, 3000000, 'HIEU_LUC'
  from inserted_request req, bed
  returning ma_hop_dong, ma_ho_so_khach_hang
),
inserted_invoice as (
  insert into public.hoa_don (
    ma_hop_dong,
    loai_hoa_don,
    trang_thai,
    tong_so_tien,
    so_tien_da_thanh_toan,
    ngay_lap,
    ngay_den_han
  )
  select ma_hop_dong, 'PHAT_SINH_DICH_VU', 'CHO_THANH_TOAN', 350000, 0, current_date - 6, current_date - 1
  from inserted_contract
  returning ma_hoa_don
),
inserted_checkout as (
  insert into public.yeu_cau_tra_phong (
    ma_hop_dong,
    ma_ho_so_khach_hang,
    ngay_yeu_cau_tra_phong,
    gio_ban_giao,
    ly_do,
    trang_thai
  )
  select ma_hop_dong, ma_ho_so_khach_hang, current_date, time '14:30', 'Tra phong som, can tat toan trong ngay', 'DANG_KIEM_TRA'
  from inserted_contract
  returning ma_yeu_cau_tra_phong
),
inserted_inspection as (
  insert into public.bien_ban_kiem_tra (
    ma_yeu_cau_tra_phong,
    ma_hop_dong,
    ma_ho_so_nguoi_kiem_tra,
    thoi_gian_kiem_tra,
    tong_uoc_tinh_khau_tru,
    trang_thai
  )
  select checkout.ma_yeu_cau_tra_phong, contract.ma_hop_dong, inspector.ma_ho_so, now() - interval '15 minutes', 2450000, 'DA_KIEM_TRA'
  from inserted_checkout checkout
  cross join inserted_contract contract
  cross join (select ma_ho_so from public.ho_so where email = 'test.recon.inspector@dormstay.local') inspector
  returning ma_bien_ban_kiem_tra
),
inserted_damage as (
  insert into public.chi_tiet_kiem_tra (
    ma_bien_ban_kiem_tra,
    ten_tai_san,
    tinh_trang,
    so_tien_boi_thuong
  )
  select ma_bien_ban_kiem_tra, 'Ban hoc', 'Vo mat kinh ban hoc', 2100000
  from inserted_inspection
  returning ma_chi_tiet_kiem_tra
),
inserted_reconciliation as (
  insert into public.doi_soat_tai_chinh (
    ma_hop_dong,
    so_tien_dat_coc_ban_dau,
    so_tien_hoan_lai,
    so_tien_can_thanh_toan_them,
    trang_thai
  )
  select ma_hop_dong, 3000000, 0, 950000, 'DA_CHOT'
  from inserted_contract
  returning ma_doi_soat
)
insert into public.chi_tiet_doi_soat_tai_chinh (
  ma_doi_soat,
  danh_muc,
  huong_giao_dich,
  loai_nguon,
  ma_nguon,
  so_tien,
  mo_ta
)
select recon.ma_doi_soat, 'TIEN_DICH_VU', 'THU', 'HOA_DON', invoice.ma_hoa_don, 350000, 'Phi dich vu chua thanh toan'
from inserted_reconciliation recon
cross join inserted_invoice invoice
union all
select recon.ma_doi_soat, 'BOI_THUONG_HU_HONG', 'THU', 'KIEM_TRA', damage.ma_chi_tiet_kiem_tra, 2100000, 'Boi thuong thay mat kinh ban hoc'
from inserted_reconciliation recon
cross join inserted_damage damage;

-- =========================================================
-- CASE 4: DA_CHOT
-- =========================================================

with customer as (
  select ma_ho_so from public.ho_so where email = 'test.recon.customer4@dormstay.local'
),
bed as (
  select g.ma_giuong, g.ma_phong
  from public.giuong g
  join public.phong p on p.ma_phong = g.ma_phong
  join public.toa t on t.ma_toa = p.ma_toa
  where t.ma_dinh_danh = 'TEST-RECON' and p.ma_phong_hien_thi = '904' and g.ma_giuong_hien_thi = 'G1'
),
inserted_request as (
  insert into public.yeu_cau_thue (
    ma_ho_so_khach_hang,
    loai_muc_tieu,
    ma_giuong,
    ngay_du_kien_vao_o,
    gia_thue_thang,
    so_tien_dat_coc,
    trang_thai
  )
  select customer.ma_ho_so, 'GIUONG', bed.ma_giuong, date '2024-04-01', 3500000, 7000000, 'DA_DUYET'
  from customer, bed
  returning ma_yeu_cau_thue, ma_ho_so_khach_hang
),
inserted_contract as (
  insert into public.hop_dong (
    ma_yeu_cau_thue,
    ma_ho_so_khach_hang,
    loai_muc_tieu,
    ma_phong,
    ma_giuong,
    ngay_vao_o,
    gia_thue_co_ban_thang,
    so_tien_dat_coc_bao_dam,
    trang_thai
  )
  select req.ma_yeu_cau_thue, req.ma_ho_so_khach_hang, 'GIUONG', bed.ma_phong, bed.ma_giuong, date '2024-04-01', 3500000, 7000000, 'HIEU_LUC'
  from inserted_request req, bed
  returning ma_hop_dong, ma_ho_so_khach_hang
),
inserted_checkout as (
  insert into public.yeu_cau_tra_phong (
    ma_hop_dong,
    ma_ho_so_khach_hang,
    ngay_yeu_cau_tra_phong,
    gio_ban_giao,
    ly_do,
    trang_thai
  )
  select ma_hop_dong, ma_ho_so_khach_hang, current_date - 2, time '09:00', 'Ket thuc hop dong dung han', 'DANG_KIEM_TRA'
  from inserted_contract
  returning ma_yeu_cau_tra_phong
),
inserted_inspection as (
  insert into public.bien_ban_kiem_tra (
    ma_yeu_cau_tra_phong,
    ma_hop_dong,
    ma_ho_so_nguoi_kiem_tra,
    thoi_gian_kiem_tra,
    tong_uoc_tinh_khau_tru,
    trang_thai
  )
  select checkout.ma_yeu_cau_tra_phong, contract.ma_hop_dong, inspector.ma_ho_so, now() - interval '2 hour', 400000, 'DA_KIEM_TRA'
  from inserted_checkout checkout
  cross join inserted_contract contract
  cross join (select ma_ho_so from public.ho_so where email = 'test.recon.inspector@dormstay.local') inspector
  returning ma_bien_ban_kiem_tra
),
inserted_reconciliation as (
  insert into public.doi_soat_tai_chinh (
    ma_hop_dong,
    so_tien_dat_coc_ban_dau,
    so_tien_hoan_lai,
    so_tien_can_thanh_toan_them,
    trang_thai
  )
  select ma_hop_dong, 7000000, 4500000, 0, 'DA_CHOT'
  from inserted_contract
  returning ma_doi_soat
),
inserted_refund as (
  insert into public.phieu_hoan_coc (
    ma_doi_soat,
    ma_hop_dong,
    so_tien_hoan,
    ten_nguoi_nhan,
    trang_thai
  )
  select recon.ma_doi_soat, contract.ma_hop_dong, 4500000, 'Pham Anh Thu', 'CHO_HOAN'
  from inserted_reconciliation recon
  cross join inserted_contract contract
  returning ma_phieu_hoan_coc
)
insert into public.chi_tiet_doi_soat_tai_chinh (
  ma_doi_soat,
  danh_muc,
  huong_giao_dich,
  loai_nguon,
  ma_nguon,
  so_tien,
  mo_ta
)
select ma_doi_soat, 'TIEN_DICH_VU', 'THU', null, null::bigint, 400000, 'Phi ve sinh va don phong cuoi ky'
from inserted_reconciliation;

commit;