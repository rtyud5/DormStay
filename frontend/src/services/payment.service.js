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
};

export default PaymentService;
