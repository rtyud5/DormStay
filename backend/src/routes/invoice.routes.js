// backend/src/routes/invoice.routes.js
const express = require("express");
const router = express.Router();
const InvoiceController = require("../controllers/invoice.controller");
const authMiddleware = require("../middlewares/auth.middleware"); // ← giữ nguyên import cũ
const { requireRole } = require("../middlewares/role.middleware"); // ← file mới của mình

router.get("/", authMiddleware, requireRole(["NHAN_VIEN", "QUAN_LY"]), InvoiceController.listInvoices);
router.get("/:id", authMiddleware, requireRole(["NHAN_VIEN", "QUAN_LY"]), InvoiceController.getInvoiceDetail);

module.exports = router;
