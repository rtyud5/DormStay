const RentalRequestModel = require("../models/rentalRequest.model");

const RentalRequestService = {
  async getList() {
    return RentalRequestModel.list();
  },

  async getDetail(id) {
    return RentalRequestModel.getById(id);
  },

  async create(payload) {
    return RentalRequestModel.create(payload);
  },
};

module.exports = RentalRequestService;
