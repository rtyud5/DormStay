const express = require("express");
const AccountingController = require("../controllers/accounting.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { requireAccountingAccess } = require("../middlewares/accounting.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

router.use(authMiddleware, requireAccountingAccess);

// Feature: dashboard kế toán để tổng hợp KPI, phiếu thu gần đây và hợp đồng cần lập khoản thu.
router.get("/dashboard", AccountingController.getDashboard);

// Feature: hợp đồng và billing preview để kế toán lập khoản thu đầu kỳ theo công thức nghiệp vụ mới.
router.get("/contracts", AccountingController.getContracts);
router.get("/contracts/:id", AccountingController.getContractDetail);
router.get("/contracts/:id/billing-preview", AccountingController.getBillingPreview);
router.post(
  "/billing/generate-initial",
  validate(["contractId", "lineItems"]),
  AccountingController.generateInitialBilling,
);

// Feature: hóa đơn kế toán gồm phiếu thu đầu kỳ và phiếu phát sinh.
router.get("/invoices", AccountingController.getInvoices);
router.get("/invoices/:id", AccountingController.getInvoiceDetail);
router.post("/invoices", validate(["contractId", "lineItems"]), AccountingController.createInvoice);
router.post("/invoices/extra", validate(["contractId", "lineItems"]), AccountingController.createExtraInvoice);
router.put("/invoices/:id", AccountingController.updateInvoice);

// Feature: ghi nhận và xác nhận thanh toán dùng bảng thanh_toan hiện hữu.
router.get("/payments", AccountingController.getPayments);
router.post("/payments", validate(["invoiceId", "amount"]), AccountingController.recordPayment);
router.post("/payments/:id/confirm", AccountingController.confirmPayment);

// Feature: tra soát giao dịch từ dữ liệu thanh toán nội bộ.
router.get("/transactions", AccountingController.getTransactions);
router.get("/transactions/:id", AccountingController.getTransactionDetail);
router.post("/transactions/:id/resolve", AccountingController.resolveTransaction);

// Feature: bảng đối soát tài chính và phiếu hoàn cọc sau khi đối soát được chốt.
router.get("/reconciliation", AccountingController.getReconciliations);
router.get("/reconciliation/:id", AccountingController.getReconciliationDetail);
router.post("/reconciliation", validate(["contractId"]), AccountingController.createReconciliation);
router.put("/reconciliation/:id", AccountingController.updateReconciliation);

router.get("/refunds", AccountingController.getRefunds);
router.get("/refunds/:id", AccountingController.getRefundDetail);
router.post("/refunds", validate(["reconciliationId"]), AccountingController.createRefund);
router.put("/refunds/:id", AccountingController.updateRefund);

module.exports = router;
