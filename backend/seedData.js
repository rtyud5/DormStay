const { supabase } = require('./src/config/supabase');

async function seed() {
  console.log("Seeding data to Supabase...");
  if (!supabase) {
    console.error("Supabase client is not available.");
    return;
  }

  try {
    // 1. Toa (Building)
    const { data: toas, error: toaErr } = await supabase.from('toa').insert([
      { ma_dinh_danh: 'Tòa A', ten: 'Khu A - Nam', dia_chi: '123 Đường Nguyễn Hữu Thọ', quan_huyen: 'Quận 7', thanh_pho: 'TP.HCM' },
      { ma_dinh_danh: 'Tòa B', ten: 'Khu B - Nữ', dia_chi: '123 Đường Nguyễn Hữu Thọ', quan_huyen: 'Quận 7', thanh_pho: 'TP.HCM' }
    ]).select();
    if (toaErr) throw toaErr;

    const toaA = toas[0].ma_toa;
    const toaB = toas[1].ma_toa;

    // 2. Tang (Floor)
    const { data: tangs, error: tangErr } = await supabase.from('tang').insert([
      { ma_toa: toaA, so_tang: 1, ten_tang: 'Tầng 1' },
      { ma_toa: toaA, so_tang: 2, ten_tang: 'Tầng 2' },
      { ma_toa: toaB, so_tang: 1, ten_tang: 'Tầng 1' }
    ]).select();
    if (tangErr) throw tangErr;

    const tangA1 = tangs.find(t => t.ma_toa === toaA && t.so_tang === 1).ma_tang;
    const tangA2 = tangs.find(t => t.ma_toa === toaA && t.so_tang === 2).ma_tang;
    const tangB1 = tangs.find(t => t.ma_toa === toaB && t.so_tang === 1).ma_tang;

    // 3. Phong (Rooms)
    const { data: phongs, error: phongErr } = await supabase.from('phong').insert([
      { ma_toa: toaA, ma_tang: tangA1, ma_phong_hien_thi: 'A101', loai_phong: 'PHONG_STUDIO', suc_chua: 2, gia_thang: 4500000, trang_thai: 'TRONG' },
      { ma_toa: toaA, ma_tang: tangA1, ma_phong_hien_thi: 'A102', loai_phong: 'PHONG_CHUNG', suc_chua: 4, gia_thang: 1800000, trang_thai: 'SAP_DAY' },
      { ma_toa: toaA, ma_tang: tangA2, ma_phong_hien_thi: 'A201', loai_phong: 'PHONG_CHUNG', suc_chua: 6, gia_thang: 1500000, trang_thai: 'TRONG' },
      { ma_toa: toaB, ma_tang: tangB1, ma_phong_hien_thi: 'B101', loai_phong: 'PHONG_STUDIO', suc_chua: 2, gia_thang: 5000000, trang_thai: 'TRONG' }
    ]).select();
    if (phongErr) throw phongErr;

    // 4. Hinh Anh Phong (Room Images)
    const imageData = [];
    phongs.forEach(p => {
      let url = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80';
      if (p.loai_phong === 'PHONG_CHUNG') {
         url = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80';
      }
      imageData.push({
        ma_phong: p.ma_phong,
        duong_dan_cong_khai: url,
        la_anh_bia: true,
        thu_tu_hien_thi: 1
      });
      // some random 2nd image
      imageData.push({
        ma_phong: p.ma_phong,
        duong_dan_cong_khai: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80',
        la_anh_bia: false,
        thu_tu_hien_thi: 2
      });
    });

    const { error: imgErr } = await supabase.from('hinh_anh_phong').insert(imageData);
    if (imgErr) throw imgErr;
    
    // 5. Create some Yeu_Cau_Thue (Rental Requests) based on a dummy HS (Profile)
    // First, let's create a User Profile (hs). But wait, do we have any auth.users?
    // The schema says `ma_nguoi_dung_xac_thuc` references auth.users(id), which we can't easily insert via normal queries due to constraints unless we bypass them.
    // However `ma_nguoi_dung_xac_thuc` can be null. We just specify ho_ten and thong_tin.
    
    const { data: hoso, error: hsErr } = await supabase.from('ho_so').insert([
        { ho_ten: 'Test Nguoi Dung', so_dien_thoai: '0901234567', email: 'test@dormstay.vn', vai_tro: 'KHACH_HANG' }
    ]).select().single();
    if (hsErr) throw hsErr;

    const { error: yctErr } = await supabase.from('yeu_cau_thue').insert([
        { 
            ma_ho_so_khach_hang: hoso.ma_ho_so, 
            loai_muc_tieu: 'PHONG', 
            ma_phong: phongs[0].ma_phong, 
            ngay_du_kien_vao_o: '2026-05-01', 
            gia_thue_thang: phongs[0].gia_thang, 
            so_tien_dat_coc: phongs[0].gia_thang,
            trang_thai: 'CHO_XU_LY'
        },
        { 
            ma_ho_so_khach_hang: hoso.ma_ho_so, 
            loai_muc_tieu: 'PHONG', 
            ma_phong: phongs[3].ma_phong, 
            ngay_du_kien_vao_o: '2026-06-01', 
            gia_thue_thang: phongs[3].gia_thang, 
            so_tien_dat_coc: phongs[3].gia_thang,
            trang_thai: 'DANG_XU_LY'
        }
    ]);
    if (yctErr) throw yctErr;

    console.log("Seed complete! Added dummy data to Toa, Tang, Phong, HinhAnhPhong and YeuCauThue.");
  } catch (error) {
    console.error("Seed error:", error.message || error);
  }
}

seed().then(() => process.exit(0));
