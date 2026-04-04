const AuthService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const login = asyncHandler(async (req, res) => {
  const result = await AuthService.login(req.body);
  return sendSuccess(res, result, "Login successful");
});

const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body);
  return sendSuccess(res, result, "Register successful", 201);
});

const me = asyncHandler(async (req, res) => {
  const result = await AuthService.getMe(req.user);
  return sendSuccess(res, result, "Fetch profile successful");
});

const updateMe = asyncHandler(async (req, res) => {
  // Loại bỏ email và ma_ho_so ra khỏi payload cập nhật để tránh lỗi unique/id
  const { email, ma_ho_so, ...updateData } = req.body;

  // Chuyển chuỗi rỗng thành null để tránh lỗi kiểu dữ liệu (vd: date "")
  const sanitizedData = Object.keys(updateData).reduce((acc, key) => {
    acc[key] = updateData[key] === "" ? null : updateData[key];
    return acc;
  }, {});

  const result = await AuthService.updateMe(req.user.id, sanitizedData);
  return sendSuccess(res, result, "Update profile successful");
});

module.exports = {
  login,
  register,
  me,
  updateMe,
};
