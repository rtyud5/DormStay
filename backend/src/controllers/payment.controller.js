const PaymentService = require("../services/payment.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const getInvoices = asyncHandler(async (req, res) => {
  const result = await PaymentService.getInvoices();
  return sendSuccess(res, result, "Fetch invoices successful");
});

const getHistory = asyncHandler(async (req, res) => {
  const result = await PaymentService.getHistory();
  return sendSuccess(res, result, "Fetch payment history successful");
});

const create = asyncHandler(async (req, res) => {
  const result = await PaymentService.create(req.body);
  return sendSuccess(res, result, "Create payment successful", 201);
});

module.exports = {
  getInvoices,
  getHistory,
  create,
};
