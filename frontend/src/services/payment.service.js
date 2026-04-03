import api from "./api";

const PaymentService = {
  getInvoices() {
    return api.get("/payments/invoices");
  },
  createPayment(payload) {
    return api.post("/payments", payload);
  },
  getHistory() {
    return api.get("/payments/history");
  },
};

export default PaymentService;
