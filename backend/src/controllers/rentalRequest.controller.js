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

const create = asyncHandler(async (req, res) => {
  const result = await RentalRequestService.create(req.body);
  return sendSuccess(res, result, "Create rental request successful", 201);
});

module.exports = {
  getList,
  getDetail,
  create,
};
