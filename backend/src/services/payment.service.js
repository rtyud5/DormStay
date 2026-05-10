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

  async createPayOSPayment({ amount, description, returnUrl, cancelUrl, expiredAt }) {
    return PaymentModel.createPayOSPayment({ amount, description, returnUrl, cancelUrl, expiredAt });
  },
  async cancelPayment(paymentLinkId) {
    return PaymentModel.cancelPayment(paymentLinkId);
  },
  async confirmPayment(paymentLinkId) {
    return PaymentModel.confirmPayment(paymentLinkId);
  },

  async payInvoice(payload) {
    return PaymentModel.processPaymentForInvoice(payload);
  },

  async paySettlementVoucher(payload, userId) {
    return PaymentModel.paySettlementVoucher(payload, userId);
  }
};

module.exports = PaymentService;
