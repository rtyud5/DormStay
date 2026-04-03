const ContractService = require("../services/contract.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const getList = asyncHandler(async (req, res) => {
  const result = await ContractService.getList();
  return sendSuccess(res, result, "Fetch contracts successful");
});

const getDetail = asyncHandler(async (req, res) => {
  const result = await ContractService.getDetail(req.params.id);
  return sendSuccess(res, result, "Fetch contract detail successful");
});

module.exports = {
  getList,
  getDetail,
};
