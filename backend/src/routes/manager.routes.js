const express = require("express");
const managerController = require("../controllers/manager.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { requireManagerAccess } = require("../middlewares/manager.middleware");

const router = express.Router();

router.use(authMiddleware, requireManagerAccess);

// DASHBOARD
router.get("/dashboard", managerController.getDashboardKPI);
router.get("/checkout-requests/recent", managerController.getRecentCheckoutRequests);

// RESIDENTS
router.get("/residents", managerController.getResidents);
router.get("/residents/:id", managerController.getResidentDetail);

// INSPECTIONS
router.get("/inspections", managerController.getInspections);
router.get("/inspections/:id", managerController.getInspectionDetail);
router.post("/inspections", managerController.createInspection);

// LIQUIDATIONS
router.get("/liquidations", managerController.getLiquidations);
router.get("/liquidations/:id", managerController.getLiquidationDetail);
router.post("/liquidations/:id/perform", managerController.performLiquidation);

// ROOMS
router.get("/rooms", managerController.getRoomsOverview);
router.get("/rooms/:roomId", managerController.getRoomDetail);
router.put("/rooms/:roomId/status", managerController.updateRoomStatus);
router.put("/rooms/:roomId/beds/:bedId/status", managerController.updateBedStatus);

module.exports = router;
