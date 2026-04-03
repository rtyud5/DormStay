const express = require("express");

const authRoutes = require("./auth.routes");
const roomRoutes = require("./room.routes");
const rentalRequestRoutes = require("./rentalRequest.routes");
const contractRoutes = require("./contract.routes");
const paymentRoutes = require("./payment.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);
router.use("/rental-requests", rentalRequestRoutes);
router.use("/contracts", contractRoutes);
router.use("/payments", paymentRoutes);

module.exports = router;
