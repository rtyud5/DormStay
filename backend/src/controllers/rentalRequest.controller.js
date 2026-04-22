const RentalRequestService = require("../services/rentalRequest.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const getList = asyncHandler(async (req, res) => {
  const result = await RentalRequestService.getList();
  return sendSuccess(res, result, "Fetch rental requests successful");
});

const getDetail = asyncHandler(async (req, res) => {
  const result = await RentalRequestService.getDetail(req.params.id);
  return sendSuccess(res, result, "Fetch rental request detail successful");
});

const getMyRequests = asyncHandler(async (req, res) => {
  const result = await RentalRequestService.getMyRequests(req.user.id);
  return sendSuccess(res, result, "Fetch user's rental requests successful");
});

const create = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const payload = { ...req.body };
  
  // Resolve ma_ho_so_khach_hang from auth user
  if (!payload.ma_ho_so_khach_hang) {
    const { supabase } = require("../config/supabase");
    const { data: hoSo, error: hoSoErr } = await supabase
      .from("ho_so")
      .select("ma_ho_so")
      .eq("ma_nguoi_dung_xac_thuc", userId)
      .maybeSingle();

    if (hoSoErr) throw hoSoErr;

    if (hoSo) {
      payload.ma_ho_so_khach_hang = hoSo.ma_ho_so;
    } else {
      const { data: newProfile, error: newProfileErr } = await supabase
        .from("ho_so")
        .insert({
          ma_nguoi_dung_xac_thuc: userId,
          ho_ten: payload.fullName || "Tài khoản mới",
          so_dien_thoai: payload.phone || null,
          email: payload.email || null,
          so_cccd: payload.idCard || null,
          vai_tro: 'KHACH_HANG'
        })
        .select()
        .single();
      
      if (newProfileErr) throw newProfileErr;
      payload.ma_ho_so_khach_hang = newProfile.ma_ho_so;
    }
  }

  // Validate selectedBeds
  const selectedBeds = payload.selectedBeds;
  if (!selectedBeds || !Array.isArray(selectedBeds) || selectedBeds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng chọn ít nhất 1 giường (selectedBeds phải là mảng không rỗng)"
    });
  }

  // Build the payload for createWithHolds (RPC)
  const rpcPayload = {
    ma_ho_so_khach_hang: payload.ma_ho_so_khach_hang,
    loai_muc_tieu: payload.loai_muc_tieu,
    ma_phong: payload.ma_phong,
    selectedBeds: selectedBeds.map(Number),
    ngay_du_kien_vao_o: payload.ngay_du_kien_vao_o,
    gia_thue_thang: payload.gia_thue_thang,
    so_tien_dat_coc: payload.so_tien_dat_coc,
    trang_thai: payload.trang_thai || 'DANG_XU_LY',
    // Hold expiry: 24h from now
    thoi_gian_het_han: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  console.log('RentalRequest RPC Payload:', rpcPayload);

  const result = await RentalRequestService.create(rpcPayload);
  return sendSuccess(res, result, "Create rental request successful", 201);
});

const savePayOSInfo = asyncHandler(async (req, res) => {
  const { maYeuCauThue, checkoutUrl, paymentLinkId } = req.body;

  if (!maYeuCauThue || !checkoutUrl || !paymentLinkId) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin: maYeuCauThue, checkoutUrl hoặc paymentLinkId"
    });
  }

  const result = await RentalRequestService.savePayOSInfo(maYeuCauThue, {
    checkoutUrl,
    paymentLinkId
  });

  return sendSuccess(res, result, "Save PayOS payment info successful");
});

const confirmPayment = asyncHandler(async (req, res) => {
  const maYeuCauThue = parseInt(req.params.id);

  if (!maYeuCauThue) {
    return res.status(400).json({
      success: false,
      message: "Thiếu mã yêu cầu thuê"
    });
  }

  const result = await RentalRequestService.confirmPayment(maYeuCauThue);
  return sendSuccess(res, result, "Payment confirmed successfully");
});

const expireHolds = asyncHandler(async (req, res) => {
  const result = await RentalRequestService.expireStaleHolds();
  return sendSuccess(res, result, "Expired stale holds successfully");
});

module.exports = {
  getList,
  getDetail,
  getMyRequests,
  create,
  savePayOSInfo,
  confirmPayment,
  expireHolds,
};
