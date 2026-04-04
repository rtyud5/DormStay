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

module.exports = {
  login,
  register,
  me,
};
