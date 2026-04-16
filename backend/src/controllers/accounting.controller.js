const AccountingService = require("../services/accounting.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const getDashboard = asyncHandler(async (req, res) => {
  const result = await AccountingService.getDashboard(req.query);
  return sendSuccess(res, result, "Fetch accounting dashboard successful");
});

const getContracts = asyncHandler(async (req, res) => {
  const result = await AccountingService.getContracts(req.query);
  return sendSuccess(res, result, "Fetch accounting contracts successful");
});

const getContractDetail = asyncHandler(async (req, res) => {
  const result = await AccountingService.getContractDetail(req.params.id);
  return sendSuccess(res, result, "Fetch accounting contract detail successful");
});

const getBillingPreview = asyncHandler(async (req, res) => {
  const result = await AccountingService.getBillingPreview(req.params.id);
  return sendSuccess(res, result, "Fetch billing preview successful");
});

const generateInitialBilling = asyncHandler(async (req, res) => {
  const result = await AccountingService.generateInitialBilling(req.body);
  return sendSuccess(res, result, "Generate initial billing successful", 201);
});

const getInvoices = asyncHandler(async (req, res) => {
  const result = await AccountingService.getInvoices(req.query);
  return sendSuccess(res, result, "Fetch accounting invoices successful");
});

const getInvoiceDetail = asyncHandler(async (req, res) => {
  const result = await AccountingService.getInvoiceDetail(req.params.id);
  return sendSuccess(res, result, "Fetch accounting invoice detail successful");
});

const createInvoice = asyncHandler(async (req, res) => {
  const result = await AccountingService.createInvoice(req.body);
  return sendSuccess(res, result, "Create accounting invoice successful", 201);
});

const updateInvoice = asyncHandler(async (req, res) => {
  const result = await AccountingService.updateInvoice(req.params.id, req.body);
  return sendSuccess(res, result, "Update accounting invoice successful");
});

const createExtraInvoice = asyncHandler(async (req, res) => {
  const result = await AccountingService.createExtraInvoice(req.body);
  return sendSuccess(res, result, "Create extra invoice successful", 201);
});

const getPayments = asyncHandler(async (req, res) => {
  const result = await AccountingService.getPayments(req.query);
  return sendSuccess(res, result, "Fetch accounting payments successful");
});

const recordPayment = asyncHandler(async (req, res) => {
  const result = await AccountingService.recordPayment(req.body);
  return sendSuccess(res, result, "Record accounting payment successful", 201);
});

const confirmPayment = asyncHandler(async (req, res) => {
  const result = await AccountingService.confirmPayment(req.params.id, req.user.profileId);
  return sendSuccess(res, result, "Confirm accounting payment successful");
});

const getTransactions = asyncHandler(async (req, res) => {
  const result = await AccountingService.getTransactions(req.query);
  return sendSuccess(res, result, "Fetch accounting transactions successful");
});

const getTransactionDetail = asyncHandler(async (req, res) => {
  const result = await AccountingService.getTransactionDetail(req.params.id);
  return sendSuccess(res, result, "Fetch accounting transaction detail successful");
});

const resolveTransaction = asyncHandler(async (req, res) => {
  const result = await AccountingService.resolveTransaction(req.params.id, req.body);
  return sendSuccess(res, result, "Resolve accounting transaction successful");
});

const getReconciliations = asyncHandler(async (req, res) => {
  const result = await AccountingService.getReconciliations(req.query);
  return sendSuccess(res, result, "Fetch reconciliations successful");
});

const getReconciliationDetail = asyncHandler(async (req, res) => {
  const result = await AccountingService.getReconciliationDetail(req.params.id);
  return sendSuccess(res, result, "Fetch reconciliation detail successful");
});

const createReconciliation = asyncHandler(async (req, res) => {
  const result = await AccountingService.createReconciliation(req.body);
  return sendSuccess(res, result, "Create reconciliation successful", 201);
});

const updateReconciliation = asyncHandler(async (req, res) => {
  const result = await AccountingService.updateReconciliation(req.params.id, req.body);
  return sendSuccess(res, result, "Update reconciliation successful");
});

const getRefunds = asyncHandler(async (req, res) => {
  const result = await AccountingService.getRefunds(req.query);
  return sendSuccess(res, result, "Fetch refund vouchers successful");
});

const getRefundDetail = asyncHandler(async (req, res) => {
  const result = await AccountingService.getRefundDetail(req.params.id);
  return sendSuccess(res, result, "Fetch refund voucher detail successful");
});

const createRefund = asyncHandler(async (req, res) => {
  const result = await AccountingService.createRefund(req.body);
  return sendSuccess(res, result, "Create refund voucher successful", 201);
});

const updateRefund = asyncHandler(async (req, res) => {
  const result = await AccountingService.updateRefund(req.params.id, req.body);
  return sendSuccess(res, result, "Update refund voucher successful");
});

module.exports = {
  getDashboard,
  getContracts,
  getContractDetail,
  getBillingPreview,
  generateInitialBilling,
  getInvoices,
  getInvoiceDetail,
  createInvoice,
  updateInvoice,
  createExtraInvoice,
  getPayments,
  recordPayment,
  confirmPayment,
  getTransactions,
  getTransactionDetail,
  resolveTransaction,
  getReconciliations,
  getReconciliationDetail,
  createReconciliation,
  updateReconciliation,
  getRefunds,
  getRefundDetail,
  createRefund,
  updateRefund,
};
