const { supabase } = require("../config/supabase");
const { createRequestCode } = require("../utils/helpers");

const TABLE_NAME = "yeu_cau_thue";

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const mapRequestToFrontendFormat = (raw) => {
  // Status mapping
  let statusText = "Mới tạo";
  let statusBadge = "bg-[#E6F0FF] text-[#0052CC]";
  let actionLabel = "Xem chi tiết";
  let actionStyle = "bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A]";
  let iconType = "document";

  switch (raw.trang_thai) {
    case 'MOI_TAO':
    case 'CHO_XU_LY':
      statusText = "Đang xử lý";
      statusBadge = "bg-[#E6F0FF] text-[#0052CC]";
      break;
    case 'DANG_XU_LY':
      statusText = "Chờ thanh toán cọc";
      statusBadge = "bg-[#FFF3E0] text-[#E65100]";
      actionLabel = "Thanh toán ngay";
      actionStyle = "bg-[#0A192F] hover:bg-[#112240] text-white border border-[#0A192F]";
      iconType = "lightning";
      break;
    case 'DA_COC':
      statusText = "Chờ duyệt cọc";
      statusBadge = "bg-[#E6F0FF] text-[#0052CC]";
      break;
    case 'DA_XAC_NHAN':
      statusText = "Đã xác nhận";
      statusBadge = "bg-[#E4F2ED] text-[#22A06B]";
      actionLabel = "Tải hợp đồng";
      actionStyle = "bg-[#E6F0FF] hover:bg-[#DBEAFE] text-[#0052CC]";
      iconType = "download";
      break;
    case 'TU_CHOI':
      statusText = "Từ chối";
      statusBadge = "bg-[#FEE2E2] text-[#DC2626]";
      actionStyle = "bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] text-[#475569]";
      break;
    case 'QUA_HAN':
      statusText = "Quá hạn";
      statusBadge = "bg-[#7F1D1D] text-white";
      break;
  }

  const roomName = raw.phong ? `Phòng ${raw.phong.ma_phong_hien_thi}` : "Không xác định";
  const date = new Date(raw.created_at).toLocaleDateString('vi-VN');

  return {
    ...raw,
    id: `#REQ-${raw.ma_yeu_cau_thue.toString().padStart(4, '0')}`,
    rawId: raw.ma_yeu_cau_thue,
    statusText,
    statusBadge,
    roomName,
    date,
    amount: formatPrice(raw.so_tien_dat_coc),
    deadline: "--/--/----", // Derived dynamically depending on states usually
    actionLink: `/rental-requests/${raw.ma_yeu_cau_thue}`,
    actionLabel,
    actionStyle,
    iconType,
    hasIcon: true,
  };
};

const RentalRequestModel = {
  async list() {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
         *,
         phong ( ma_phong_hien_thi )
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data ? data.map(mapRequestToFrontendFormat) : [];
  },

  async listByUserId(userId) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
         *,
         ho_so!yeu_cau_thue_ma_ho_so_khach_hang_fkey!inner ( ma_nguoi_dung_xac_thuc ),
         phong ( ma_phong_hien_thi )
      `)
      .eq("ho_so.ma_nguoi_dung_xac_thuc", userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data ? data.map(mapRequestToFrontendFormat) : [];
  },

  async getById(id) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
         *,
         phong ( ma_phong_hien_thi )
      `)
      .eq("ma_yeu_cau_thue", id)
      .maybeSingle();
      
    if (error) throw error;
    return data ? mapRequestToFrontendFormat(data) : null;
  },

  async create(payload) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(payload)
      .select("*")
      .single();
      
    if (error) throw error;
    return data;
  },
};

module.exports = RentalRequestModel;
