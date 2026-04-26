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

function matchContractId(invoice, contractId) {
  if (!contractId || String(contractId).trim() === "") {
    return true;
  }

  const search = String(contractId).trim().toLowerCase();
  const invoiceContractId = String(invoice.contractId || "").toLowerCase();
  return invoiceContractId.includes(search);
}

function matchPaymentMethod(invoice, paymentMethod) {
  if (!paymentMethod || paymentMethod === "ALL") {
    return true;
  }

  const method = String(paymentMethod || "").toUpperCase();
  const invoiceMethod = String(invoice.paymentMethod || "").toUpperCase();
  return invoiceMethod.includes(method);
}

function matchTimeRange(invoice, timeRange) {
  if (!timeRange || timeRange === "all") {
    return true;
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  let startDate, endDate;

  switch (timeRange.toLowerCase()) {
    case "this_month":
      startDate = new Date(currentYear, currentMonth, 1);
      endDate = new Date(currentYear, currentMonth + 1, 0);
      break;
    case "last_month":
      startDate = new Date(currentYear, currentMonth - 1, 1);
      endDate = new Date(currentYear, currentMonth, 0);
      break;
    case "this_quarter":
      const quarterStart = Math.floor(currentMonth / 3) * 3;
      startDate = new Date(currentYear, quarterStart, 1);
      endDate = new Date(currentYear, quarterStart + 3, 0);
      break;
    case "this_year":
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear, 11, 31);
      break;
    default:
      return true;
  }

  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
  const paymentDate = invoice.paymentDate ? new Date(invoice.paymentDate) : null;
  const issueDate = invoice.issueDate ? new Date(invoice.issueDate) : null;

  // Lọc theo dueDate nếu có, nếu không theo paymentDate, nếu không theo issueDate
  const dateToCheck = dueDate || paymentDate || issueDate;
  if (!dateToCheck) {
    return true;
  }

  return dateToCheck >= startDate && dateToCheck <= endDate;
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
        matchKeyword(invoice, filters.search) &&
        matchContractId(invoice, filters.contractId) &&
        matchPaymentMethod(invoice, filters.paymentMethod) &&
        matchTimeRange(invoice, filters.timeRange),
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
