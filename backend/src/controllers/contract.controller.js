const ContractService = require("../services/contract.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const getList = asyncHandler(async (req, res) => {
  const result = await ContractService.getList(req.user.id);
  return sendSuccess(res, result, "Fetch contracts successful");
});

const getLiquidations = asyncHandler(async (req, res) => {
  const result = await ContractService.getLiquidations(req.user.id);
  return sendSuccess(res, result, "Fetch liquidations successful");
});

const getDetail = asyncHandler(async (req, res) => {
  const result = await ContractService.getDetail(req.params.id, req.user.id);
  return sendSuccess(res, result, "Fetch contract detail successful");
});

const getInvoices = asyncHandler(async (req, res) => {
  const result = await ContractService.getInvoices(req.params.id, req.user.id);
  return sendSuccess(res, result, "Fetch contract invoices successful");
});

module.exports = {
  getList,
  getLiquidations,
  getDetail,
  getInvoices,
};
