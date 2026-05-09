import api from "./api";

const PaymentService = {
  getInvoices: () => {
    return api.get("/payments/invoices");
  },
  createPayment: (payload) => {
    return api.post("/payments", payload);
  },
  getHistory: () => {
    return api.get("/payments/history");
  },
  createPayOSPayment: (payload) => {
    return api.post("/payments/payos", payload);
  },
  cancelPayment: (paymentLinkId) => {
    return api.put(`/payments/cancel/${paymentLinkId}`);
  },
  confirmPayment: (paymentLinkId) => {
    return api.put(`/payments/confirm/${paymentLinkId}`);
  },
  payInvoice: (payload) => {
    return api.post("/payments/pay-invoice", payload);
  }
};

export default PaymentService;
