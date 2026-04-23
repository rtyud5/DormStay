const BedService = require("../services/bed.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const updateBedStatusToRented = asyncHandler(async (req, res) => {
  const { ma_giuong } = req.params;
  const result = await BedService.updateBedStatusToRented(ma_giuong);
  return sendSuccess(res, result, "Cập nhật trạng thái giường thành công");
});

module.exports = {
  updateBedStatusToRented
};