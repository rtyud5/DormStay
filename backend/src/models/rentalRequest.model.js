const { supabase } = require("../config/supabase");

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

  // Map giu_cho_tam rows to selectedBeds
  const holdRows = raw.giu_cho_tam || [];
  const selectedBeds = holdRows.map(h => ({
    ma_giuong: h.ma_giuong,
    ma_giuong_hien_thi: h.giuong?.ma_giuong_hien_thi || null,
    trang_thai_hold: h.trang_thai,
    thoi_gian_het_han: h.thoi_gian_het_han,
  }));

  return {
    ...raw,
    id: `#REQ-${raw.ma_yeu_cau_thue.toString().padStart(4, '0')}`,
    rawId: raw.ma_yeu_cau_thue,
    statusText,
    statusBadge,
    roomName,
    date,
    amount: formatPrice(raw.so_tien_dat_coc),
    deadline: "--/--/----",
    actionLink: `/rental-requests/${raw.ma_yeu_cau_thue}`,
    actionLabel,
    actionStyle,
    iconType,
    hasIcon: true,
    so_luong_giuong_dat: raw.so_luong_giuong_dat || 1,
    selectedBeds,
  };
};

const RentalRequestModel = {
  async list() {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
         *,
         phong ( ma_phong_hien_thi ),
         giu_cho_tam (
           ma_giuong,
           trang_thai,
           thoi_gian_het_han,
           giuong ( ma_giuong_hien_thi )
         )
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
         phong ( ma_phong_hien_thi ),
         giu_cho_tam (
           ma_giuong,
           trang_thai,
           thoi_gian_het_han,
           giuong ( ma_giuong_hien_thi )
         )
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
         phong ( ma_phong_hien_thi ),
         giu_cho_tam (
           ma_giu_cho_tam,
           ma_giuong,
           trang_thai,
           thoi_gian_het_han,
           giuong ( ma_giuong_hien_thi )
         )
      `)
      .eq("ma_yeu_cau_thue", id)
      .maybeSingle();
      
    if (error) throw error;
    return data ? mapRequestToFrontendFormat(data) : null;
  },

  /**
   * Atomic create: 1 yeu_cau_thue + N giu_cho_tam via Postgres RPC
   */
  async createWithHolds(payload) {
    if (!supabase) return null;

    const { data, error } = await supabase.rpc('create_rental_request_with_holds', {
      p_ma_ho_so_khach_hang: payload.ma_ho_so_khach_hang,
      p_loai_muc_tieu: payload.loai_muc_tieu,
      p_ma_phong: payload.ma_phong,
      p_selected_beds: payload.selectedBeds || [],
      p_ngay_du_kien_vao_o: payload.ngay_du_kien_vao_o,
      p_gia_thue_thang: payload.gia_thue_thang,
      p_so_tien_dat_coc: payload.so_tien_dat_coc,
      p_trang_thai: payload.trang_thai || 'DANG_XU_LY',
      p_thoi_gian_het_han: payload.thoi_gian_het_han || null,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Legacy create (without holds) — kept for backward compatibility
   */
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

  async updatePayOSInfo(maYeuCauThue, { checkoutUrl, paymentLinkId }) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({
        checkoutUrl,
        paymentLinkId,
        updated_at: new Date()
      })
      .eq("ma_yeu_cau_thue", maYeuCauThue)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Confirm payment: updates request + holds via Postgres RPC
   */
  async confirmPayment(maYeuCauThue) {
    if (!supabase) return null;

    const { data, error } = await supabase.rpc('confirm_rental_payment', {
      p_ma_yeu_cau_thue: maYeuCauThue,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Expire stale holds via Postgres RPC
   */
  async expireStaleHolds() {
    if (!supabase) return null;

    const { data, error } = await supabase.rpc('expire_stale_holds');

    if (error) throw error;
    return data;
  },
};

module.exports = RentalRequestModel;
