const express = require("express");
const ContractController = require("../controllers/contract.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, ContractController.getList);
router.get("/:id", authMiddleware, ContractController.getDetail);

module.exports = router;
