// backend/src/controllers/auth.controller.js
const AuthService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const login = asyncHandler(async (req, res) => {
  const result = await AuthService.login(req.body);
  return sendSuccess(res, result, "Đăng nhập thành công");
});

const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body);
  return sendSuccess(res, result, "Đăng ký thành công", 201);
});

// ✅ Fix: truyền ma_ho_so từ req.user (được gắn bởi authMiddleware)
const me = asyncHandler(async (req, res) => {
  const result = await AuthService.getMe(req.user.ma_ho_so);
  return sendSuccess(res, result, "Lấy thông tin thành công");
});

// Tạo tài khoản nhân viên — chỉ QUAN_LY gọi được (kiểm soát ở route)
const createStaff = asyncHandler(async (req, res) => {
  const result = await AuthService.createStaffAccount(req.body);
  return sendSuccess(res, result, "Tạo tài khoản nhân viên thành công", 201);
});

module.exports = { login, register, me, createStaff };
