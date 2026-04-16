const {
  AppError,
  TABLES,
  fetchOne,
  mapTransactionRow,
  mapPaymentStatusToDb,
  normalizePaymentStatus,
  toNumber,
  supabase,
  ensureClient,
} = require("./shared");
const PaymentModel = require("./payment.model");

module.exports = {
  async listTransactions(filters = {}) {
    const paymentResult = await PaymentModel.listPayments(filters);
    const items = paymentResult.items.map((payment) => mapTransactionRow(payment, payment.invoice));

    return {
      ...paymentResult,
      items,
    };
  },

  async getTransactionDetail(transactionId) {
    const payment = await PaymentModel.getPaymentDetail(transactionId);
    return mapTransactionRow(payment, payment.invoice);
  },

  async resolveTransaction(transactionId, payload = {}) {
    ensureClient();

    const payment = await fetchOne(TABLES.payments, "ma_thanh_toan", transactionId);
    if (!payment) {
      throw new AppError("Transaction not found", 404);
    }

    const currentStatus = normalizePaymentStatus(payment);
    const nextStatus = String(payload.status || currentStatus).toUpperCase();

    if (currentStatus === "CONFIRMED" && nextStatus !== "CONFIRMED") {
      throw new AppError("Confirmed transaction cannot be changed to another status", 400);
    }

    const baseUpdatePayload = {
      phuong_thuc: payload.method !== undefined ? payload.method : payment.phuong_thuc,
      so_tien: payload.amount !== undefined ? toNumber(payload.amount) : toNumber(payment.so_tien),
      ma_giao_dich: payload.transactionCode !== undefined ? payload.transactionCode : payment.ma_giao_dich,
      ten_nguoi_thanh_toan: payload.payerName !== undefined ? payload.payerName : payment.ten_nguoi_thanh_toan,
      thoi_gian_thanh_toan: payload.paidAt !== undefined ? payload.paidAt : payment.thoi_gian_thanh_toan,
    };

    if (nextStatus === "CONFIRMED" && currentStatus !== "CONFIRMED") {
      const { error: preUpdateError } = await supabase
        .from(TABLES.payments)
        .update(baseUpdatePayload)
        .eq("ma_thanh_toan", transactionId);
      if (preUpdateError) throw preUpdateError;

      return this.getTransactionDetail(transactionId).then(async () => {
        await PaymentModel.confirmPayment(transactionId, null);
        return this.getTransactionDetail(transactionId);
      });
    }

    const updatePayload = {
      ...baseUpdatePayload,
      trang_thai: mapPaymentStatusToDb(nextStatus),
    };

    const { error: paymentError } = await supabase
      .from(TABLES.payments)
      .update(updatePayload)
      .eq("ma_thanh_toan", transactionId);
    if (paymentError) throw paymentError;

    return this.getTransactionDetail(transactionId);
  },
};
