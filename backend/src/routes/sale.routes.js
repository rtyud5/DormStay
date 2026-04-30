const express = require("express");
const saleController = require("../controllers/sale.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { requireSaleAccess } = require("../middlewares/sale.middleware");

const router = express.Router();

// Tất cả route sale đều cần auth và quyền sale
router.use(authMiddleware, requireSaleAccess);

// DASHBOARD
router.get("/dashboard", saleController.getDashboard);

// RENTAL REQUESTS
router.get("/rental-requests", saleController.getRentalRequests);
router.get("/rental-requests/:id", saleController.getRentalRequestDetail);
router.post("/rental-requests/:id/process", saleController.processRentalRequest);

// CUSTOMERS
router.get("/customers", saleController.getCustomers);
router.get("/customers/:id", saleController.getCustomerDetail);

// CONTRACTS
router.get("/contracts", saleController.getContracts);
router.get("/contracts/:id", saleController.getContractDetail);

// CHECKOUT REQUESTS
router.get("/checkout-requests", saleController.getCheckoutRequests);
router.post("/checkout-requests", saleController.createCheckoutRequest);
router.put("/checkout-requests/:id/reschedule", saleController.updateCheckoutRequestTime);

module.exports = router;