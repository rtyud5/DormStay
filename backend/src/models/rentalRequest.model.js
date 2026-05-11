const { supabase } = require("../config/supabase");

const TABLE_NAME = "yeu_cau_thue";

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const toNumber = (value) => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeRequestStatus = (status) => {
  const value = String(status || "").toUpperCase();
  if (["MOI_TAO", "CHO_XU_LY"].includes(value)) return "DANG_XU_LY";
  if (value === "DA_DUYET") return "DA_XAC_NHAN";
  if (value === "TU_CHOI") return "QUA_HAN";
  return value;
};

const normalizeBedAvailabilityStatus = (status) => {
  const value = String(status || "").toUpperCase();
  if (["TRONG", "CON_TRONG"].includes(value)) return "TRONG";
  if (["DA_THUE", "DANG_O", "DANG_SU_DUNG", "DA_THUE_HET"].includes(value)) return "DA_THUE";
  if (value === "DANG_GIU") return "DANG_GIU";
  return value;
};

const mapRequestToFrontendFormat = (raw) => {
  const status = normalizeRequestStatus(raw.trang_thai);

  // Status mapping
  let statusText = "Mới tạo";
  let statusBadge = "bg-[#E6F0FF] text-[#0052CC]";
  let actionLabel = "Xem chi tiết";
  let actionStyle = "bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A]";
  let iconType = "document";

  switch (status) {
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
    case 'CHO_THANH_TOAN':
      statusText = "Chá» thanh toĂ¡n cá»c";
      statusBadge = "bg-[#FFF3E0] text-[#E65100]";
      actionLabel = "Thanh toĂ¡n ngay";
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
  const holdDeadline = holdRows
    .map((h) => h.thoi_gian_het_han)
    .filter(Boolean)
    .sort()[0] || null;

  return {
    ...raw,
    trang_thai: status,
    id: `#REQ-${raw.ma_yeu_cau_thue.toString().padStart(4, '0')}`,
    rawId: raw.ma_yeu_cau_thue,
    statusText,
    statusBadge,
    roomName,
    date,
    amount: formatPrice(raw.so_tien_dat_coc),
    deadline: "--/--/----",
    thoi_gian_het_han: holdDeadline,
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

    const selectedBeds = Array.isArray(payload.selectedBeds)
      ? [...new Set(payload.selectedBeds.map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0))]
      : [];

    if (!selectedBeds.length) {
      throw new Error("Vui lòng chọn ít nhất 1 giường");
    }

    const roomId = Number(payload.ma_phong);
    const requestStatus = normalizeRequestStatus(payload.trang_thai || "DANG_XU_LY");
    const holdExpiry = payload.thoi_gian_het_han ? new Date(payload.thoi_gian_het_han) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const holdExpiryIso = Number.isNaN(holdExpiry.getTime())
      ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      : holdExpiry.toISOString();

    const { data: bedRows, error: bedError } = await supabase
      .from("giuong")
      .select("ma_giuong, ma_phong, trang_thai")
      .in("ma_giuong", selectedBeds);

    if (bedError) throw bedError;
    if (!bedRows || bedRows.length !== selectedBeds.length) {
      throw new Error("Một hoặc nhiều giường đã không tồn tại");
    }

    const resolvedRoomId = Number.isInteger(roomId) && roomId > 0 ? roomId : Number(bedRows[0]?.ma_phong || 0);
    if (!resolvedRoomId) {
      throw new Error("Thiếu thông tin phòng");
    }

    const outOfRoomBeds = bedRows.filter((bed) => Number(bed.ma_phong) !== resolvedRoomId);
    if (outOfRoomBeds.length > 0) {
      throw new Error(`Một hoặc nhiều giường không thuộc phòng ${resolvedRoomId}`);
    }

    const unavailableBed = bedRows.find((bed) => normalizeBedAvailabilityStatus(bed.trang_thai) !== "TRONG");
    if (unavailableBed) {
      throw new Error(`Bed ${unavailableBed.ma_giuong} is not available (status: ${unavailableBed.trang_thai})`);
    }

    const nowIso = new Date().toISOString();
    const { data: activeHolds, error: holdError } = await supabase
      .from("giu_cho_tam")
      .select("ma_giuong, trang_thai, thoi_gian_het_han")
      .in("ma_giuong", selectedBeds)
      .in("trang_thai", ["DANG_GIU", "DA_XAC_NHAN_COC"])
      .or(`thoi_gian_het_han.is.null,thoi_gian_het_han.gt.${nowIso}`);

    if (holdError) throw holdError;
    if ((activeHolds || []).length > 0) {
      throw new Error(`One or more beds already have active holds (${activeHolds.length} conflicts)`);
    }

    const requestPayload = {
      ma_ho_so_khach_hang: payload.ma_ho_so_khach_hang,
      loai_muc_tieu: payload.loai_muc_tieu,
      ma_phong: resolvedRoomId,
      ma_giuong: selectedBeds.length === 1 && String(payload.loai_muc_tieu || "").toUpperCase() === "GIUONG" ? selectedBeds[0] : null,
      so_luong_giuong_dat: selectedBeds.length,
      ngay_du_kien_vao_o: payload.ngay_du_kien_vao_o,
      gia_thue_thang: toNumber(payload.gia_thue_thang),
      so_tien_dat_coc: toNumber(payload.so_tien_dat_coc),
      trang_thai: requestStatus,
      checkoutUrl: payload.checkoutUrl || null,
      paymentLinkId: payload.paymentLinkId || null,
    };

    const { data: request, error: requestError } = await supabase
      .from(TABLE_NAME)
      .insert(requestPayload)
      .select("*")
      .single();

    if (requestError) throw requestError;

    const holdRows = selectedBeds.map((bedId) => ({
      ma_yeu_cau_thue: request.ma_yeu_cau_thue,
      loai_muc_tieu: "GIUONG",
      ma_phong: resolvedRoomId,
      ma_giuong: bedId,
      trang_thai: "DANG_GIU",
      thoi_gian_het_han: holdExpiryIso,
    }));

    const { error: createHoldError } = await supabase
      .from("giu_cho_tam")
      .insert(holdRows);

    if (createHoldError) {
      await supabase.from(TABLE_NAME).delete().eq("ma_yeu_cau_thue", request.ma_yeu_cau_thue);
      throw createHoldError;
    }

    return request;
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
