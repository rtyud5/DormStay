const { supabase } = require("../config/supabase");

const TABLE_NAME = "hop_dong";

const ContractModel = {
  async listByUserId(userId) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        phong ( ma_phong_hien_thi ),
        ho_so!inner ( ma_nguoi_dung_xac_thuc ),
        phan_bo_hop_dong (
          ma_phan_bo,
          loai_muc_tieu,
          ma_giuong,
          giuong ( ma_giuong_hien_thi ),
          trang_thai
        )
      `)
      .eq("ho_so.ma_nguoi_dung_xac_thuc", userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        phong ( ma_phong_hien_thi ),
        phan_bo_hop_dong (
          ma_phan_bo,
          loai_muc_tieu,
          ma_giuong,
          giuong ( ma_giuong_hien_thi ),
          ngay_bat_dau,
          ngay_ket_thuc,
          trang_thai
        )
      `)
      .eq("ma_hop_dong", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};

module.exports = ContractModel;
