const {
  supabase,
  AppError,
  TABLES,
  buildPagination,
  fetchByIds,
  fetchOne,
  indexBy,
  loadInvoiceContext,
  mapInvoiceRow,
  mapPaymentStatusToDb,
  normalizeInvoiceType,
  normalizePaymentStatus,
  roundMoney,
  toNumber,
  ensureClient,
} = require("./shared");

function mapPaymentWithInvoice(payment, invoice) {
  return {
    id: payment.ma_thanh_toan,
    invoiceId: payment.ma_hoa_don,
    contractId: invoice?.contractId || null,
    customerName: invoice?.customerName || "Khach thue chua cap nhat",
    amount: toNumber(payment.so_tien),
    method: payment.phuong_thuc,
    status: normalizePaymentStatus(payment),
    rawStatus: payment.trang_thai,
    transactionCode: payment.ma_giao_dich,
    payerName: payment.ten_nguoi_thanh_toan,
    paidAt: payment.thoi_gian_thanh_toan,
    confirmedAt: payment.thoi_gian_xac_nhan,
    invoice,
    raw: payment,
  };
}

const PaymentModel = {
  async listPayments(filters = {}) {
    ensureClient();

    const pagination = buildPagination(filters.page, filters.limit);
    const { data, error, count } = await supabase
      .from(TABLES.payments)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(pagination.from, pagination.to);

    if (error) throw error;

    const paymentRows = data || [];
    const invoiceIds = [...new Set(paymentRows.map((item) => item.ma_hoa_don).filter(Boolean))];
    const invoices = await fetchByIds(TABLES.invoices, "ma_hoa_don", invoiceIds);
    const invoiceContext = await loadInvoiceContext(invoices, [], paymentRows);
    const mappedInvoiceMap = indexBy(
      invoices.map((invoice) => mapInvoiceRow(invoice, { ...invoiceContext, invoiceItemGroup: {} })),
      "id",
    );

    const items = paymentRows.map((payment) =>
      mapPaymentWithInvoice(payment, mappedInvoiceMap[payment.ma_hoa_don] || null),
    );

    return {
      items,
      total: count || items.length,
      page: pagination.currentPage,
      limit: pagination.currentLimit,
    };
  },

  async createPayment(payload = {}) {
    ensureClient();

    if (!payload.invoiceId) {
      throw new AppError("invoiceId is required", 400);
    }

    if (!payload.amount) {
      throw new AppError("amount is required", 400);
    }

    const invoice = await fetchOne(TABLES.invoices, "ma_hoa_don", payload.invoiceId);
    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    const insertPayload = {
      ma_hoa_don: payload.invoiceId,
      phuong_thuc: payload.method || payload.paymentMethod || "BANK_TRANSFER",
      trang_thai: "CHO_XAC_NHAN",
      so_tien: toNumber(payload.amount),
      ma_giao_dich: payload.transactionCode || null,
      ten_nguoi_thanh_toan: payload.payerName || null,
      thoi_gian_thanh_toan: payload.paidAt || new Date().toISOString(),
    };

    const { data, error } = await supabase.from(TABLES.payments).insert(insertPayload).select("*").single();

    if (error) throw error;

    return {
      id: data.ma_thanh_toan,
      invoiceId: data.ma_hoa_don,
      amount: toNumber(data.so_tien),
      method: data.phuong_thuc,
      status: normalizePaymentStatus(data),
      rawStatus: data.trang_thai,
      transactionCode: data.ma_giao_dich,
      payerName: data.ten_nguoi_thanh_toan,
      paidAt: data.thoi_gian_thanh_toan,
      raw: data,
    };
  },

  async getPaymentDetail(paymentId) {
    const payment = await fetchOne(TABLES.payments, "ma_thanh_toan", paymentId);
    if (!payment) {
      throw new AppError("Payment not found", 404);
    }

    const invoices = payment.ma_hoa_don ? await fetchByIds(TABLES.invoices, "ma_hoa_don", [payment.ma_hoa_don]) : [];
    const invoice = invoices[0] || null;
    const invoiceContext = await loadInvoiceContext(invoices, [], [payment]);
    const mappedInvoice = invoice ? mapInvoiceRow(invoice, { ...invoiceContext, invoiceItemGroup: {} }) : null;

    return mapPaymentWithInvoice(payment, mappedInvoice);
  },

  async confirmPayment(paymentId, actorProfileId) {
    ensureClient();

    const payment = await fetchOne(TABLES.payments, "ma_thanh_toan", paymentId);
    if (!payment) {
      throw new AppError("Payment not found", 404);
    }

    const { data: updatedPayment, error: paymentError } = await supabase
      .from(TABLES.payments)
      .update({
        trang_thai: "DA_XAC_NHAN",
        thoi_gian_xac_nhan: new Date().toISOString(),
      })
      .eq("ma_thanh_toan", paymentId)
      .select("*")
      .single();

    if (paymentError) throw paymentError;

    const invoice = await fetchOne(TABLES.invoices, "ma_hoa_don", updatedPayment.ma_hoa_don);
    const nextPaidAmount = roundMoney(toNumber(invoice?.so_tien_da_thanh_toan) + toNumber(updatedPayment.so_tien));
    const invoiceStatus = nextPaidAmount >= toNumber(invoice?.tong_so_tien) ? "DA_THANH_TOAN" : "CHO_THANH_TOAN";

    const { error: invoiceError } = await supabase
      .from(TABLES.invoices)
      .update({
        so_tien_da_thanh_toan: nextPaidAmount,
        trang_thai: invoiceStatus,
      })
      .eq("ma_hoa_don", updatedPayment.ma_hoa_don);

    if (invoiceError) throw invoiceError;

    if (actorProfileId) {
      const { error: receiptError } = await supabase.from(TABLES.receipts).insert({
        ma_thanh_toan: updatedPayment.ma_thanh_toan,
        ma_hoa_don: updatedPayment.ma_hoa_don,
        so_tien: toNumber(updatedPayment.so_tien),
        so_bien_lai: `BL-${updatedPayment.ma_thanh_toan}-${Date.now()}`,
        ma_ho_so_nguoi_lap: actorProfileId,
      });

      if (receiptError) throw receiptError;
    }

    const refreshedInvoice = await fetchOne(TABLES.invoices, "ma_hoa_don", updatedPayment.ma_hoa_don);
    if (refreshedInvoice?.ma_yeu_cau_thue && normalizeInvoiceType(refreshedInvoice.loai_hoa_don) === "DEPOSIT") {
      await supabase
        .from(TABLES.requests)
        .update({ trang_thai: "DA_DAT_COC" })
        .eq("ma_yeu_cau_thue", refreshedInvoice.ma_yeu_cau_thue);
      await supabase
        .from(TABLES.holds)
        .update({ trang_thai: "DA_XAC_NHAN_COC" })
        .eq("ma_yeu_cau_thue", refreshedInvoice.ma_yeu_cau_thue)
        .eq("trang_thai", "DANG_GIU");
    }

    return require("./invoice.model").getInvoiceDetail(updatedPayment.ma_hoa_don);
  },

  mapPaymentStatusToDb,
  normalizePaymentStatus,
};

module.exports = PaymentModel;
