const express = require("express");
const PaymentController = require("../controllers/payment.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

router.get("/invoices", authMiddleware, PaymentController.getInvoices);
router.get("/history", authMiddleware, PaymentController.getHistory);
router.post("/", authMiddleware, validate(["invoiceId", "amount"]), PaymentController.create);

module.exports = router;
