const RoomService = require("../services/room.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const getList = asyncHandler(async (req, res) => {
  const result = await RoomService.getList(req.query);
  return sendSuccess(res, result, "Fetch rooms successful");
});

const getDetail = asyncHandler(async (req, res) => {
  const result = await RoomService.getDetail(req.params.id);
  return sendSuccess(res, result, "Fetch room detail successful");
});

const getRoomBeds = asyncHandler(async (req, res) => {
  const result = await RoomService.getRoomBeds(req.params.id);
  return sendSuccess(res, result, "Fetch room beds successful");
});

const getBuildings = asyncHandler(async (req, res) => {
  const result = await RoomService.getBuildings();
  return sendSuccess(res, result, "Fetch buildings successful");
});

module.exports = {
  getList,
  getDetail,
  getRoomBeds,
  getBuildings,
};
