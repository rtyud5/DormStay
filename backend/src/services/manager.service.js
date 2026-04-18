const ManagerModel = require("../models/manager.model");

const ManagerService = {
  // DASHBOARD
  async getDashboardKPI() {
    return await ManagerModel.getDashboardKPI();
  },

  async getRecentCheckoutRequests() {
    return await ManagerModel.getRecentCheckoutRequests();
  },

  // RESIDENTS
  async getResidents(filters) {
    return await ManagerModel.getResidents(filters);
  },

  async getResidentDetail(id) {
    return await ManagerModel.getResidentDetail(id);
  },

  // INSPECTIONS
  async getInspections(filters) {
    return await ManagerModel.getInspections(filters);
  },

  async getInspectionDetail(id) {
    return await ManagerModel.getInspectionDetail(id);
  },

  async createInspection(payload) {
    return await ManagerModel.createInspection(payload);
  },

  // LIQUIDATIONS
  async getLiquidations(filters) {
    return await ManagerModel.getLiquidations(filters);
  },

  async getLiquidationDetail(id) {
    return await ManagerModel.getLiquidationDetail(id);
  },

  async performLiquidation(id, payload) {
    return await ManagerModel.performLiquidation(id, payload);
  },

  // ROOMS
  async getRoomsOverview(filters) {
    return await ManagerModel.getRoomsOverview(filters);
  },

  async getRoomDetail(roomId) {
    // RoomModel equivalent or specific query? Wait, we can reuse RoomService or redefine in ManagerModel.
    // However, I didn't add getRoomDetail in manager schema. Let me check if frontend calls getRoomDetail.
    // Yes: api.get(`/manager/rooms/${roomId}`) 
    // I can reuse backend/src/models/room.model.js if I want, or add a brief wrapper.
    const RoomModel = require("../models/room.model");
    return await RoomModel.getById(roomId);
  },

  async updateRoomStatus(roomId, payload) {
    return await ManagerModel.updateRoomStatus(roomId, payload);
  },

  async updateBedStatus(roomId, bedId, payload) {
    return await ManagerModel.updateBedStatus(roomId, bedId, payload);
  }
};

module.exports = ManagerService;
