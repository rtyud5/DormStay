const InvoiceModel = require("../models/invoice.model");
const PaymentModel = require("../models/payment.model");

const PaymentService = {
  async getInvoices(userId) {
    return InvoiceModel.listByUserId(userId);
  },

  async getHistory(userId) {
    return PaymentModel.listByUserId(userId);
  },

  async create(payload) {
    return PaymentModel.create(payload);
  },
};

module.exports = PaymentService;
