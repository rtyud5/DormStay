const express = require("express");
const AccountingController = require("../controllers/accounting.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { requireAccountingAccess } = require("../middlewares/accounting.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

router.use(authMiddleware, requireAccountingAccess);

router.get("/reconciliation/work-items", AccountingController.getReconciliationWorkItems);
router.get("/reconciliation/work-items/:checkoutRequestId", AccountingController.getReconciliationWorkItemDetail);
router.post(
  "/reconciliation/preview",
  validate(["contractId", "refundReason"]),
  AccountingController.previewReconciliation,
);
router.post(
  "/reconciliation",
  validate(["checkoutRequestId", "contractId", "refundReason"]),
  AccountingController.createReconciliationDraft,
);
router.get("/reconciliation/:id", AccountingController.getReconciliationDetail);
router.put("/reconciliation/:id/draft", AccountingController.updateReconciliationDraft);
router.post("/reconciliation/:id/finalize", AccountingController.finalizeReconciliation);
router.post("/reconciliation/:id/create-refund", AccountingController.createRefundFromReconciliation);
router.post(
  "/reconciliation/:id/create-additional-payment",
  AccountingController.createAdditionalPaymentFromReconciliation,
);

router.get("/billing/contracts", AccountingController.getInitialBillingPendingContracts);
router.get("/billing/contracts/:contractId/preview", AccountingController.getInitialBillingPreview);
router.post("/billing/contracts/:contractId/invoice", AccountingController.createInitialBillingInvoice);

router.get("/invoices", AccountingController.getInvoices);
router.get("/invoices/:id", AccountingController.getInvoiceDetail);
router.get("/extra-invoices", AccountingController.getAdditionalPaymentVouchers);
router.get("/extra-invoices/:id", AccountingController.getAdditionalPaymentVoucherDetail);
router.post(
  "/extra-invoices/confirm-cash",
  validate(["voucherIds"]),
  AccountingController.confirmAdditionalPaymentVouchersCash,
);

router.use(AccountingController.accountingApisTemporarilyDisabled);

module.exports = router;
