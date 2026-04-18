const ManagerService = require("../services/manager.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const getDashboardKPI = asyncHandler(async (req, res) => {
  const result = await ManagerService.getDashboardKPI();
  return sendSuccess(res, result, "Fetch dashboard KPI successful");
});

const getRecentCheckoutRequests = asyncHandler(async (req, res) => {
  const result = await ManagerService.getRecentCheckoutRequests();
  return sendSuccess(res, result, "Fetch recent checkout requests successful");
});

const getResidents = asyncHandler(async (req, res) => {
  const result = await ManagerService.getResidents(req.query);
  return sendSuccess(res, result, "Fetch residents successful");
});

const getResidentDetail = asyncHandler(async (req, res) => {
  const result = await ManagerService.getResidentDetail(req.params.id);
  return sendSuccess(res, result, "Fetch resident detail successful");
});

const getInspections = asyncHandler(async (req, res) => {
  const result = await ManagerService.getInspections(req.query);
  return sendSuccess(res, result, "Fetch inspections successful");
});

const getInspectionDetail = asyncHandler(async (req, res) => {
  const result = await ManagerService.getInspectionDetail(req.params.id);
  return sendSuccess(res, result, "Fetch inspection detail successful");
});

const createInspection = asyncHandler(async (req, res) => {
  const result = await ManagerService.createInspection(req.body);
  return sendSuccess(res, result, "Create inspection report successful", 201);
});

const getLiquidations = asyncHandler(async (req, res) => {
  const result = await ManagerService.getLiquidations(req.query);
  return sendSuccess(res, result, "Fetch liquidations successful");
});

const getLiquidationDetail = asyncHandler(async (req, res) => {
  const result = await ManagerService.getLiquidationDetail(req.params.id);
  return sendSuccess(res, result, "Fetch liquidation detail successful");
});

const performLiquidation = asyncHandler(async (req, res) => {
  const result = await ManagerService.performLiquidation(req.params.id, req.body);
  return sendSuccess(res, result, "Perform liquidation successful", 200);
});

const getRoomsOverview = asyncHandler(async (req, res) => {
  const result = await ManagerService.getRoomsOverview(req.query);
  return sendSuccess(res, result, "Fetch rooms overview successful");
});

const getRoomDetail = asyncHandler(async (req, res) => {
  const result = await ManagerService.getRoomDetail(req.params.roomId);
  return sendSuccess(res, result, "Fetch room detail successful");
});

const updateRoomStatus = asyncHandler(async (req, res) => {
  const result = await ManagerService.updateRoomStatus(req.params.roomId, req.body);
  return sendSuccess(res, result, "Update room status successful", 200);
});

const updateBedStatus = asyncHandler(async (req, res) => {
  const result = await ManagerService.updateBedStatus(req.params.roomId, req.params.bedId, req.body);
  return sendSuccess(res, result, "Update bed status successful", 200);
});

module.exports = {
  getDashboardKPI,
  getRecentCheckoutRequests,
  getResidents,
  getResidentDetail,
  getInspections,
  getInspectionDetail,
  createInspection,
  getLiquidations,
  getLiquidationDetail,
  performLiquidation,
  getRoomsOverview,
  getRoomDetail,
  updateRoomStatus,
  updateBedStatus
};
