const express = require("express");
const RentalRequestController = require("../controllers/rentalRequest.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

router.get("/", authMiddleware, RentalRequestController.getList);
router.get("/my", authMiddleware, RentalRequestController.getMyRequests);
router.post("/save-payos-info", authMiddleware, RentalRequestController.savePayOSInfo);
router.post("/admin/expire-holds", authMiddleware, RentalRequestController.expireHolds);
router.get("/:id", authMiddleware, RentalRequestController.getDetail);
router.post("/:id/confirm-payment", authMiddleware, RentalRequestController.confirmPayment);
router.post("/", authMiddleware, validate(["ma_phong", "loai_muc_tieu"]), RentalRequestController.create);

module.exports = router;
