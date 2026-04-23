const {
  supabase,
  AppError,
  TABLES,
  ensureClient,
  buildPagination,
  loadInvoiceContext,
  mapInvoiceRow,
} = require("./shared");

const PAGE_SPEC = {
  id: "accounting-invoice-list-page",
  frontendPageName: "AccountingInvoiceListPage",
  frontendFile: "frontend/src/pages/accounting/AccountingInvoiceListPage.jsx",
  routePath: "/accounting/invoices",
  reviewStatus: "IN_PROGRESS",
  apiStatus: "PARTIALLY_ENABLED",
  purpose: "Invoice list and invoice detail page model for accounting receivables and status tracking.",
  reviewFocus: [
    "Invoice list API is enabled for accounting list page.",
    "Filters prioritize status, type, and keyword matching on invoice/contract/customer.",
    "Payment confirmation flow remains in dedicated payment endpoints.",
  ],
};

function matchStatus(invoice, filterStatus) {
  const status = String(filterStatus || "").toUpperCase();
  if (!status || status === "ALL") {
    return true;
  }

  return String(invoice.status || "").toUpperCase() === status;
}

function matchInvoiceType(invoice, filterType) {
  const type = String(filterType || "").toUpperCase();
  if (!type || type === "ALL") {
    return true;
  }

  return String(invoice.invoiceType || "").toUpperCase() === type;
}

function matchKeyword(invoice, keyword) {
  const search = String(keyword || "")
    .trim()
    .toLowerCase();
  if (!search) {
    return true;
  }

  return [invoice.id, invoice.contractId, invoice.customerName, invoice.description]
    .map((value) => String(value || "").toLowerCase())
    .some((value) => value.includes(search));
}

const AccountingInvoiceListPageModel = {
  ...PAGE_SPEC,

  async listInvoices(filters = {}) {
    ensureClient();

    const { data: invoiceRows, error } = await supabase
      .from(TABLES.invoices)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      throw error;
    }

    const context = await loadInvoiceContext(invoiceRows || []);
    const mappedInvoices = (invoiceRows || []).map((item) => mapInvoiceRow(item, context));

    const filteredInvoices = mappedInvoices.filter(
      (invoice) =>
        matchStatus(invoice, filters.status) &&
        matchInvoiceType(invoice, filters.invoiceType) &&
        matchKeyword(invoice, filters.search),
    );

    const pagination = buildPagination(filters.page, filters.limit || 10);
    const items = filteredInvoices.slice(pagination.from, pagination.to + 1);

    return {
      items,
      total: filteredInvoices.length,
      page: pagination.currentPage,
      limit: pagination.currentLimit,
    };
  },

  async getInvoiceDetail(invoiceId) {
    ensureClient();

    const { data: invoice, error } = await supabase
      .from(TABLES.invoices)
      .select("*")
      .eq("ma_hoa_don", invoiceId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    const context = await loadInvoiceContext([invoice]);
    return mapInvoiceRow(invoice, context);
  },
};

module.exports = AccountingInvoiceListPageModel;
