const { supabase } = require("../config/supabase");

const TABLE_NAME = "hoa_don";

const InvoiceModel = {
  async listByUserId(userId) {
    if (!supabase) return [];

    // Filter by joining with hop_dong or yeu_cau_thue then ho_so
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        hop_dong (
          ho_so!inner ( ma_nguoi_dung_xac_thuc )
        ),
        yeu_cau_thue (
          ho_so!yeu_cau_thue_ma_ho_so_khach_hang_fkey!inner ( ma_nguoi_dung_xac_thuc )
        )
      `)
      .or(`hop_dong.ho_so.ma_nguoi_dung_xac_thuc.eq.${userId},yeu_cau_thue.ho_so!yeu_cau_thue_ma_ho_so_khach_hang_fkey.ma_nguoi_dung_xac_thuc.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

module.exports = InvoiceModel;
