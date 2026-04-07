// backend/src/routes/index.js
const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const roomRoutes = require("./room.routes");
const rentalRequestRoutes = require("./rentalRequest.routes");
const contractRoutes = require("./contract.routes");
const paymentRoutes = require("./payment.routes");
const invoiceRoutes = require("./invoice.routes"); // ✅ Đã có từ session trước

router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);
router.use("/rental-requests", rentalRequestRoutes);
router.use("/contracts", contractRoutes);
router.use("/payments", paymentRoutes);
router.use("/invoices", invoiceRoutes); // ✅ Fix: bỏ "/api/" thừa

module.exports = router;
