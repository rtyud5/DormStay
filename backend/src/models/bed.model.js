// bed.service.js
const { supabase } = require("../config/supabase");

const bedModel = {
  async updateBedStatusToRented(ma_giuong) {
    try {
      const { data, error } = await supabase
        .from('giuong')
        .update({ 
          trang_thai: 'DA_THUE',
          updated_at: new Date().toISOString() // Cập nhật luôn thời gian sửa đổi
        })
        .eq('ma_giuong', ma_giuong)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái giường:", error);
      throw error;
    }
  }
}

module.exports = bedModel;