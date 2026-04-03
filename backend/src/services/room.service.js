const RoomModel = require("../models/room.model");

const RoomService = {
  async getList() {
    return RoomModel.list();
  },

  async getDetail(id) {
    return RoomModel.getById(id);
  },
};

module.exports = RoomService;
