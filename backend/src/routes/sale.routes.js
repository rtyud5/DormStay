const express = require("express");
const SaleController = require("../controllers/sale.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { requireSaleAccess } = require("../middlewares/sale.middleware");

const router = express.Router();

// Áp dụng bảo mật cho toàn bộ router này
router.use(authMiddleware, requireSaleAccess);

router.get("/dashboard", SaleController.getDashboardStats);
router.get("/requests", SaleController.getRentalRequests);

module.exports = router;