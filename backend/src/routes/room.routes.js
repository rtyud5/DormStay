const express = require("express");
const RoomController = require("../controllers/room.controller");

const router = express.Router();

router.get("/", RoomController.getList);
router.get("/:id", RoomController.getDetail);

module.exports = router;
