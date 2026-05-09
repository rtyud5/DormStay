const PaymentService = require("../services/payment.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const getInvoices = asyncHandler(async (req, res) => {
  const result = await PaymentService.getInvoices(req.user.id);
  return sendSuccess(res, result, "Fetch invoices successful");
});

const getHistory = asyncHandler(async (req, res) => {
  const result = await PaymentService.getHistory(req.user.id);
  return sendSuccess(res, result, "Fetch payment history successful");
});

const create = asyncHandler(async (req, res) => {
  const result = await PaymentService.create(req.body);
  return sendSuccess(res, result, "Create payment successful", 201);
});

const createPayOSPayment = asyncHandler(async (req, res) => {
  const { amount, description, returnUrl, cancelUrl, expiredAt } = req.body;
  const result = await PaymentService.createPayOSPayment({ amount, description, returnUrl, cancelUrl, expiredAt });
  return sendSuccess(res, result, "Create PayOS payment successful", 201);
});

const cancelPayment = asyncHandler(async (req, res) => {
  const { paymentLinkId } = req.params;
  const result = await PaymentService.cancelPayment(paymentLinkId);
  return sendSuccess(res, result, "Cancel payment successful");
});

const confirmPayment = asyncHandler(async (req, res) => {
  const { paymentLinkId } = req.params;
  const result = await PaymentService.confirmPayment(paymentLinkId);
  return sendSuccess(res, result, "Confirm payment successful");
});

const payInvoice = asyncHandler(async (req, res) => {
  const result = await PaymentService.payInvoice(req.body);
  return sendSuccess(res, result, "Pay invoice successful");
});

module.exports = {
  getInvoices,
  getHistory,
  create,
  createPayOSPayment,
  cancelPayment,
  confirmPayment,
  payInvoice
};
