const SaleService = require("../services/sale.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const getDashboard = asyncHandler(async (req, res) => {
  const result = await SaleService.getDashboard();
  return sendSuccess(res, result, "Fetch sale dashboard successful");
});

const getRentalRequests = asyncHandler(async (req, res) => {
  const result = await SaleService.getRentalRequests(req.query);
  return sendSuccess(res, result, "Fetch rental requests successful");
});

const getRentalRequestDetail = asyncHandler(async (req, res) => {
  const result = await SaleService.getRentalRequestDetail(req.params.id);
  return sendSuccess(res, result, "Fetch rental request detail successful");
});

const getCustomers = asyncHandler(async (req, res) => {
  const result = await SaleService.getCustomers(req.query);
  return sendSuccess(res, result, "Fetch customers successful");
});

const getCustomerDetail = asyncHandler(async (req, res) => {
  const result = await SaleService.getCustomerDetail(req.params.id);
  return sendSuccess(res, result, "Fetch customer detail successful");
});

const getContracts = asyncHandler(async (req, res) => {
  const result = await SaleService.getContracts(req.query);
  return sendSuccess(res, result, "Fetch contracts successful");
});

const getContractDetail = asyncHandler(async (req, res) => {
  const result = await SaleService.getContractDetail(req.params.id);
  return sendSuccess(res, result, "Fetch contract detail successful");
});

const getCheckoutRequests = asyncHandler(async (req, res) => {
  const result = await SaleService.getCheckoutRequests(req.query);
  return sendSuccess(res, result, "Fetch checkout requests successful");
});

const createCheckoutRequest = asyncHandler(async (req, res) => {
  const result = await SaleService.createCheckoutRequest(req.body);
  return sendSuccess(res, result, "Create checkout request successful", 201);
});

const updateCheckoutRequestTime = asyncHandler(async (req, res) => {
  const result = await SaleService.updateCheckoutRequestTime(req.params.id, req.body);
  return sendSuccess(res, result, "Update checkout request successful");
});

module.exports = {
  getDashboard,
  getRentalRequests,
  getRentalRequestDetail,
  getCustomers,
  getCustomerDetail,
  getContracts,
  getContractDetail,
  getCheckoutRequests,
  createCheckoutRequest,
  updateCheckoutRequestTime,
};
