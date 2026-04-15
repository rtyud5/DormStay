const express = require("express");
const RoomController = require("../controllers/room.controller");

const router = express.Router();

router.get("/", RoomController.getList);
router.get("/buildings", RoomController.getBuildings);
router.get("/:id(\\d+)", RoomController.getDetail);
router.get("/:id(\\d+)/beds", RoomController.getRoomBeds);

module.exports = router;
