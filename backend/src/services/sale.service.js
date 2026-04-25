const { supabase } = require("../config/supabase");

const SaleService = {
  async getDashboardStats() {
    // Lấy số lượng các yêu cầu thuê đang chờ xử lý
    const { count: pendingRequests } = await supabase
      .from('yeu_cau_thue')
      .select('*', { count: 'exact', head: true })
      .in('trang_thai', ['MOI_TAO', 'CHO_XU_LY']);

    // Thống kê số phòng trống
    const { count: emptyRooms } = await supabase
      .from('phong')
      .select('*', { count: 'exact', head: true })
      .eq('trang_thai', 'TRONG');

    return {
      pendingRequests: pendingRequests || 0,
      emptyRooms: emptyRooms || 0,
    };
  },

  async getRentalRequests(filters) {
    let query = supabase
      .from('yeu_cau_thue')
      .select(`
        *,
        ho_so!yeu_cau_thue_ma_ho_so_khach_hang_fkey (ho_ten, email, so_dien_thoai),
        phong (ma_phong_hien_thi, loai_phong)
      `)
      .order('created_at', { ascending: false });

    // Hỗ trợ filter cơ bản
    if (filters.status && filters.status !== 'all') {
      query = query.eq('trang_thai', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return data;
  }
};

module.exports = SaleService;