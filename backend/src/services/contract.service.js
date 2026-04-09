const { supabase } = require("../config/supabase");

const ContractService = {
  async getList() {
    const { data, error } = await supabase
      .from("hop_dong")
      .select(`
        ma_hop_dong,
        trang_thai,
        ngay_vao_o,
        gia_thue_co_ban_thang,
        so_tien_dat_coc_bao_dam,
        ho_so_khach_hang:ma_ho_so_khach_hang (ma_ho_so, ho_ten, email),
        phong:ma_phong (ma_phong, ma_phong_hien_thi),
        giuong:ma_giuong (ma_giuong, ma_giuong_hien_thi)
      `)
      .order("ngay_vao_o", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getDetail(id) {
    const { data, error } = await supabase
      .from("hop_dong")
      .select(`
        *,
        ho_so_khach_hang:ma_ho_so_khach_hang (*),
        phong:ma_phong (ma_phong, ma_phong_hien_thi, loai_phong, gia_thang),
        giuong:ma_giuong (ma_giuong, ma_giuong_hien_thi, nhan_giuong),
        khoan_thu_hop_dong (*),
        hoa_don:HOA_DON (ma_hoa_don, loai_hoa_don, tong_so_tien, trang_thai, ngay_lap, ngay_den_han)
      `)
      .eq("ma_hop_dong", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};

module.exports = ContractService;
