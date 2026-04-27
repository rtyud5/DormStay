const express = require("express");
const saleController = require("../controllers/sale.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { requireSaleAccess } = require("../middlewares/sale.middleware");

const router = express.Router();

router.use(authMiddleware, requireSaleAccess);

router.get("/dashboard", saleController.getDashboard);

router.get("/rental-requests", saleController.getRentalRequests);
router.get("/rental-requests/:id", saleController.getRentalRequestDetail);
router.post("/rental-requests/:id/process", saleController.processRentalRequest);

router.get("/customers", saleController.getCustomers);
router.get("/customers/:id", saleController.getCustomerDetail);

router.get("/contracts", saleController.getContracts);
router.get("/contracts/:id", saleController.getContractDetail);

router.get("/checkout-requests", saleController.getCheckoutRequests);
router.post("/checkout-requests", saleController.createCheckoutRequest);
router.put("/checkout-requests/:id/reschedule", saleController.updateCheckoutRequestTime);

module.exports = router;
