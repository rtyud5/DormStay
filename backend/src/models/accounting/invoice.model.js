const {
  supabase,
  AppError,
  TABLES,
  buildChargePayloads,
  buildInvoiceItemPayloads,
  buildPagination,
  fetchByIds,
  fetchOne,
  loadInvoiceContext,
  mapInvoiceRow,
  mapInvoiceStatusToDb,
  normalizeInvoiceType,
  roundMoney,
  toNumber,
  ensureClient,
} = require("./shared");

module.exports = {
  async listInvoices(filters = {}) {
    ensureClient();

    const pagination = buildPagination(filters.page, filters.limit);
    const { data, error, count } = await supabase
      .from(TABLES.invoices)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(pagination.from, pagination.to);

    if (error) throw error;

    const invoiceRows = data || [];
    const invoiceItems = invoiceRows.length
      ? await fetchByIds(
          TABLES.invoiceItems,
          "ma_hoa_don",
          invoiceRows.map((item) => item.ma_hoa_don),
        )
      : [];
    const payments = invoiceRows.length
      ? await fetchByIds(
          TABLES.payments,
          "ma_hoa_don",
          invoiceRows.map((item) => item.ma_hoa_don),
        )
      : [];
    const context = await loadInvoiceContext(invoiceRows, invoiceItems, payments);

    let mappedInvoices = invoiceRows.map((invoice) => mapInvoiceRow(invoice, context));

    if (filters.status) {
      mappedInvoices = mappedInvoices.filter((invoice) => invoice.status === String(filters.status).toUpperCase());
    }

    if (filters.invoiceType) {
      mappedInvoices = mappedInvoices.filter(
        (invoice) => invoice.invoiceType === String(filters.invoiceType).toUpperCase(),
      );
    }

    if (filters.search) {
      const keyword = String(filters.search).toLowerCase();
      mappedInvoices = mappedInvoices.filter(
        (invoice) =>
          String(invoice.id).toLowerCase().includes(keyword) ||
          String(invoice.contractId || "")
            .toLowerCase()
            .includes(keyword) ||
          invoice.customerName.toLowerCase().includes(keyword),
      );
    }

    return {
      items: mappedInvoices,
      total: count || mappedInvoices.length,
      page: pagination.currentPage,
      limit: pagination.currentLimit,
    };
  },

  async getInvoiceDetail(invoiceId) {
    const invoice = await fetchOne(TABLES.invoices, "ma_hoa_don", invoiceId);
    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    const invoiceItems = await fetchByIds(TABLES.invoiceItems, "ma_hoa_don", [invoiceId]);
    const payments = await fetchByIds(TABLES.payments, "ma_hoa_don", [invoiceId]);
    const context = await loadInvoiceContext([invoice], invoiceItems, payments);

    return mapInvoiceRow(invoice, context);
  },

  async createInvoice(payload = {}, mode = "INITIAL") {
    ensureClient();

    if (!payload.contractId) {
      throw new AppError("contractId is required", 400);
    }

    const contract = await fetchOne(TABLES.contracts, "ma_hop_dong", payload.contractId);
    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const lineItems = Array.isArray(payload.lineItems) ? payload.lineItems : [];
    if (!lineItems.length) {
      throw new AppError("lineItems is required", 400);
    }

    const totalAmount = roundMoney(
      lineItems.reduce((sum, item) => {
        const amount =
          item.amount !== undefined
            ? toNumber(item.amount)
            : toNumber(item.quantity || 1) * toNumber(item.unitPrice || 0);

        return sum + amount;
      }, 0),
    );

    const invoicePayload = {
      ma_hop_dong: payload.contractId,
      loai_hoa_don: payload.invoiceType || (mode === "EXTRA" ? "PHAT_SINH" : "INITIAL_BILLING"),
      trang_thai: "CHO_THANH_TOAN",
      tong_so_tien: totalAmount,
      so_tien_da_thanh_toan: 0,
      ngay_lap: payload.issueDate || new Date().toISOString().slice(0, 10),
      ngay_den_han: payload.dueDate || null,
      ma_tai_khoan_ngan_hang: payload.bankAccountCode || null,
      ma_tham_chieu_qr: payload.qrReference || null,
    };

    const { data: insertedInvoice, error: invoiceError } = await supabase
      .from(TABLES.invoices)
      .insert(invoicePayload)
      .select("*")
      .single();

    if (invoiceError) throw invoiceError;

    const chargePayloads = buildChargePayloads(
      payload.contractId,
      insertedInvoice.ma_hoa_don,
      lineItems,
      mode === "EXTRA" ? "PHAT_SINH" : "DAU_KY",
    );

    const { data: insertedCharges, error: chargeError } = await supabase
      .from(TABLES.contractCharges)
      .insert(chargePayloads)
      .select("*");

    if (chargeError) throw chargeError;

    const invoiceItemPayloads = buildInvoiceItemPayloads(insertedInvoice.ma_hoa_don, lineItems, insertedCharges);
    const { error: itemError } = await supabase.from(TABLES.invoiceItems).insert(invoiceItemPayloads);

    if (itemError) throw itemError;

    return this.getInvoiceDetail(insertedInvoice.ma_hoa_don);
  },

  async updateInvoice(invoiceId, payload = {}) {
    ensureClient();

    const invoice = await fetchOne(TABLES.invoices, "ma_hoa_don", invoiceId);
    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    const nextLineItems = Array.isArray(payload.lineItems) ? payload.lineItems : null;
    const nextTotalAmount = nextLineItems
      ? roundMoney(
          nextLineItems.reduce((sum, item) => {
            const amount =
              item.amount !== undefined
                ? toNumber(item.amount)
                : toNumber(item.quantity || 1) * toNumber(item.unitPrice || 0);

            return sum + amount;
          }, 0),
        )
      : payload.amount !== undefined
        ? roundMoney(payload.amount)
        : toNumber(invoice.tong_so_tien);
    const nextPaidAmount = Math.min(
      Math.max(
        payload.paidAmount !== undefined ? toNumber(payload.paidAmount) : toNumber(invoice.so_tien_da_thanh_toan),
        0,
      ),
      nextTotalAmount,
    );

    const updatePayload = {
      loai_hoa_don: payload.invoiceType || invoice.loai_hoa_don,
      trang_thai: mapInvoiceStatusToDb(payload.status, nextPaidAmount, nextTotalAmount),
      tong_so_tien: nextTotalAmount,
      so_tien_da_thanh_toan: nextPaidAmount,
      ngay_lap: payload.issueDate || invoice.ngay_lap,
      ngay_den_han: payload.dueDate !== undefined ? payload.dueDate : invoice.ngay_den_han,
      ma_tai_khoan_ngan_hang:
        payload.bankAccountCode !== undefined ? payload.bankAccountCode : invoice.ma_tai_khoan_ngan_hang,
      ma_tham_chieu_qr: payload.qrReference !== undefined ? payload.qrReference : invoice.ma_tham_chieu_qr,
    };

    const { error: invoiceError } = await supabase
      .from(TABLES.invoices)
      .update(updatePayload)
      .eq("ma_hoa_don", invoiceId);
    if (invoiceError) throw invoiceError;

    if (nextLineItems) {
      await supabase.from(TABLES.invoiceItems).delete().eq("ma_hoa_don", invoiceId);
      await supabase.from(TABLES.contractCharges).delete().eq("ma_hoa_don_da_lap", invoiceId);

      if (nextLineItems.length) {
        const chargePayloads = buildChargePayloads(
          invoice.ma_hop_dong,
          invoiceId,
          nextLineItems,
          normalizeInvoiceType(updatePayload.loai_hoa_don) === "EXTRA" ? "PHAT_SINH" : "DAU_KY",
        );

        const { data: insertedCharges, error: chargeError } = await supabase
          .from(TABLES.contractCharges)
          .insert(chargePayloads)
          .select("*");

        if (chargeError) throw chargeError;

        const invoiceItemPayloads = buildInvoiceItemPayloads(invoiceId, nextLineItems, insertedCharges);
        const { error: itemError } = await supabase.from(TABLES.invoiceItems).insert(invoiceItemPayloads);

        if (itemError) throw itemError;
      }
    }

    return this.getInvoiceDetail(invoiceId);
  },
};
