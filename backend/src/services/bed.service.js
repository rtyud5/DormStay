const bedModel = require("../models/bed.model");

const BedService = {
  async updateBedStatusToRented(ma_giuong) {
    return bedModel.updateBedStatusToRented(ma_giuong); 
  }
}

module.exports = BedService;