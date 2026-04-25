const SaleModel = require("../models/sale.model");

const SaleService = {
  async getDashboard() {
    return SaleModel.getDashboard();
  },
  async getRentalRequests(filters) {
    return SaleModel.getRentalRequests(filters);
  },
  async getRentalRequestDetail(id) {
    return SaleModel.getRentalRequestDetail(id);
  },
  async processRentalRequest(id, payload) {
    return SaleModel.processRentalRequest(id, payload);
  },
  async getCustomers(filters) {
    return SaleModel.getCustomers(filters);
  },
  async getCustomerDetail(id) {
    return SaleModel.getCustomerDetail(id);
  },
  async getContracts(filters) {
    return SaleModel.getContracts(filters);
  },
  async getContractDetail(id) {
    return SaleModel.getContractDetail(id);
  },
  async getCheckoutRequests(filters) {
    return SaleModel.getCheckoutRequests(filters);
  },
  async createCheckoutRequest(payload) {
    return SaleModel.createCheckoutRequest(payload);
  },
  async updateCheckoutRequestTime(id, payload) {
    return SaleModel.updateCheckoutRequestTime(id, payload);
  },
};

module.exports = SaleService;