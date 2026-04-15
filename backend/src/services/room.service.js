const RoomModel = require("../models/room.model");

const RoomService = {
  async getList(filters = {}) {
    return RoomModel.list(filters);
  },

  async getDetail(id) {
    return RoomModel.getById(id);
  },

  async getRoomBeds(roomId) {
    return RoomModel.getBedsByRoomId(roomId);
  },

  async getBuildings() {
    return RoomModel.getBuildings();
  },
};

module.exports = RoomService;
