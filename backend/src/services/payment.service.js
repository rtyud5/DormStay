const InvoiceModel = require("../models/invoice.model");
const PaymentModel = require("../models/payment.model");

const PaymentService = {
  async getInvoices() {
    return InvoiceModel.list();
  },

  async getHistory() {
    return PaymentModel.list();
  },

  async create(payload) {
    return PaymentModel.create(payload);
  },
};

module.exports = PaymentService;
