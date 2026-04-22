const RentalRequestModel = require("../models/rentalRequest.model");

const RentalRequestService = {
  async getList() {
    return RentalRequestModel.list();
  },

  async getDetail(id) {
    return RentalRequestModel.getById(id);
  },

  async getMyRequests(userId) {
    return RentalRequestModel.listByUserId(userId);
  },

  /**
   * Create request with holds (atomic, via RPC)
   */
  async create(payload) {
    return RentalRequestModel.createWithHolds(payload);
  },

  async savePayOSInfo(maYeuCauThue, payOSData) {
    return RentalRequestModel.updatePayOSInfo(maYeuCauThue, payOSData);
  },

  /**
   * Confirm payment — updates request + hold statuses
   */
  async confirmPayment(maYeuCauThue) {
    return RentalRequestModel.confirmPayment(maYeuCauThue);
  },

  /**
   * Expire stale holds (admin)
   */
  async expireStaleHolds() {
    return RentalRequestModel.expireStaleHolds();
  },
};

module.exports = RentalRequestService;
