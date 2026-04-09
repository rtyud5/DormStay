// backend/src/routes/invoice.routes.js
const express = require("express");
const router = express.Router();
const InvoiceController = require("../controllers/invoice.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

// KE_TOAN và QUAN_LY đều có quyền truy cập phiếu thu
const INVOICE_ROLES = ["KE_TOAN", "QUAN_LY", "NHAN_VIEN"];

router.get("/", authMiddleware, requireRole(INVOICE_ROLES), InvoiceController.listInvoices);
router.get("/:id", authMiddleware, requireRole(INVOICE_ROLES), InvoiceController.getInvoiceDetail);

module.exports = router;
