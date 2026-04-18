const express = require("express");
const RoomController = require("../controllers/room.controller");

const router = express.Router();

router.get("/", RoomController.getList);
router.get("/buildings", RoomController.getBuildings);
router.get("/:id", RoomController.getDetail);
router.get("/:id/beds", RoomController.getRoomBeds);
router.post("/deposit", RoomController.createDeposit);
module.exports = router;
