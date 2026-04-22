const AccountingService = require("../services/accounting.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const getReconciliationWorkItems = asyncHandler(async (req, res) => {
  const result = await AccountingService.getReconciliationWorkItems(req.query);
  return sendSuccess(res, result, "Fetch reconciliation work items successful");
});

const getReconciliationWorkItemDetail = asyncHandler(async (req, res) => {
  const result = await AccountingService.getReconciliationWorkItemDetail(req.params.checkoutRequestId);
  return sendSuccess(res, result, "Fetch reconciliation work item detail successful");
});

const previewReconciliation = asyncHandler(async (req, res) => {
  const result = await AccountingService.previewReconciliation(req.body);
  return sendSuccess(res, result, "Preview reconciliation successful");
});

const createReconciliationDraft = asyncHandler(async (req, res) => {
  const result = await AccountingService.createReconciliationDraft(req.body);
  return sendSuccess(res, result, "Create reconciliation draft successful", 201);
});

const getReconciliationDetail = asyncHandler(async (req, res) => {
  const result = await AccountingService.getReconciliationDetail(req.params.id);
  return sendSuccess(res, result, "Fetch reconciliation detail successful");
});

const updateReconciliationDraft = asyncHandler(async (req, res) => {
  const result = await AccountingService.updateReconciliationDraft(req.params.id, req.body);
  return sendSuccess(res, result, "Update reconciliation draft successful");
});

const finalizeReconciliation = asyncHandler(async (req, res) => {
  const result = await AccountingService.finalizeReconciliation(req.params.id);
  return sendSuccess(res, result, "Finalize reconciliation successful");
});

const createRefundFromReconciliation = asyncHandler(async (req, res) => {
  const result = await AccountingService.createRefundFromReconciliation(req.params.id, req.body);
  return sendSuccess(res, result, "Create refund voucher from reconciliation successful", 201);
});

const createAdditionalPaymentFromReconciliation = asyncHandler(async (req, res) => {
  const result = await AccountingService.createAdditionalPaymentFromReconciliation(req.params.id, req.body);
  return sendSuccess(res, result, "Create additional payment voucher from reconciliation successful", 201);
});

const accountingApisTemporarilyDisabled = (req, res) => {
  const result = AccountingService.getApiResetStatus();

  return res.status(503).json({
    success: false,
    message: "Accounting APIs are temporarily disabled while the team reviews each accounting page.",
    data: result,
  });
};

module.exports = {
  getReconciliationWorkItems,
  getReconciliationWorkItemDetail,
  previewReconciliation,
  createReconciliationDraft,
  getReconciliationDetail,
  updateReconciliationDraft,
  finalizeReconciliation,
  createRefundFromReconciliation,
  createAdditionalPaymentFromReconciliation,
  accountingApisTemporarilyDisabled,
};
