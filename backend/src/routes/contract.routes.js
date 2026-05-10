const express = require("express");
const ContractController = require("../controllers/contract.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, ContractController.getList);
router.get("/liquidations", authMiddleware, ContractController.getLiquidations);
router.get("/:id", authMiddleware, ContractController.getDetail);
router.get("/:id/invoices", authMiddleware, ContractController.getInvoices);

module.exports = router;
