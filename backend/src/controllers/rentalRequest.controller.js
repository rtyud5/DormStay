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
          cccd: payload.idCard || null,
          vai_tro: 'KHACH_HANG'
        })
        .select()
        .single();
      
      if (newProfileErr) throw newProfileErr;
      payload.ma_ho_so_khach_hang = newProfile.ma_ho_so;
    }
  }

  // Prepare data for yeu_cau_thue table (whitelist only valid columns)
  const validPayload = {
    ma_ho_so_khach_hang: payload.ma_ho_so_khach_hang,
    loai_muc_tieu: payload.loai_muc_tieu,
    ma_phong: payload.ma_phong,
    ma_giuong: payload.ma_giuong,
    ngay_du_kien_vao_o: payload.ngay_du_kien_vao_o,
    gia_thue_thang: payload.gia_thue_thang,
    so_tien_dat_coc: payload.so_tien_dat_coc,
    trang_thai: payload.trang_thai || 'MOI_TAO'
  };

  console.log('Final RentalRequest Payload:', validPayload);

  const result = await RentalRequestService.create(validPayload);
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

module.exports = {
  getList,
  getDetail,
  getMyRequests,
  create,
  savePayOSInfo,
};
