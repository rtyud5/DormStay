const SaleService = require("../services/sale.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const getDashboardStats = asyncHandler(async (req, res) => {
  const result = await SaleService.getDashboardStats();
  return sendSuccess(res, result, "Lấy thống kê Sale thành công");
});

const getRentalRequests = asyncHandler(async (req, res) => {
  // Lấy danh sách yêu cầu cần Sale xử lý (có hỗ trợ filter qua req.query)
  const result = await SaleService.getRentalRequests(req.query);
  return sendSuccess(res, result, "Lấy danh sách yêu cầu thuê thành công");
});

// Đang suy nghĩ có cần thêm các hàm như approveRequest, sendPaymentLink...

module.exports = {
  getDashboardStats,
  getRentalRequests,
};