const express = require("express");

const authRoutes = require("./auth.routes");
const roomRoutes = require("./room.routes");
const rentalRequestRoutes = require("./rentalRequest.routes");
const contractRoutes = require("./contract.routes");
const paymentRoutes = require("./payment.routes");
const accountingRoutes = require("./accounting.routes");
const managerRoutes = require("./manager.routes");
const bedRoutes = require("./bed.routes");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);
router.use("/rental-requests", rentalRequestRoutes);
router.use("/contracts", contractRoutes);
router.use("/payments", paymentRoutes);
router.use("/accounting", accountingRoutes);
router.use("/manager", managerRoutes);
router.use("/beds", bedRoutes);

module.exports = router;
