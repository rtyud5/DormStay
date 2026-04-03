const express = require("express");
const RentalRequestController = require("../controllers/rentalRequest.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

router.get("/", authMiddleware, RentalRequestController.getList);
router.get("/:id", authMiddleware, RentalRequestController.getDetail);
router.post("/", authMiddleware, validate(["roomId", "stayType"]), RentalRequestController.create);

module.exports = router;
