const express = require("express");
const RentalRequestController = require("../controllers/rentalRequest.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

router.get("/", authMiddleware, RentalRequestController.getList);
router.get("/my", authMiddleware, RentalRequestController.getMyRequests);
router.get("/:id", authMiddleware, RentalRequestController.getDetail);
router.post("/", authMiddleware, validate(["ma_phong", "loai_muc_tieu"]), RentalRequestController.create);

module.exports = router;
