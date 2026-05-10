const {
  supabase,
  TABLES,
  ensureClient,
  toNumber,
  roundMoney,
  normalizeInvoiceStatus,
  normalizePaymentStatus,
  normalizeRefundStatus,
  normalizeContractStatus,
} = require("./shared");

const PAGE_SPEC = {
  id: "accounting-dashboard-page",
  frontendPageName: "AccountingDashboardPage",
  frontendFile: "frontend/src/pages/accounting/AccountingDashboardPage.jsx",
  routePath: "/accounting/dashboard",
  reviewStatus: "IN_PROGRESS",
  apiStatus: "PARTIALLY_ENABLED",
  purpose: "Dashboard overview for accounting KPIs, recent documents, and operational alerts.",
  reviewFocus: [
    "Provide daily monitoring KPIs with consistent month-over-month comparison.",
    "Aggregate invoice/payment/refund/reconciliation metrics from real transactional data.",
    "Keep payload minimal and stable for dashboard card rendering.",
  ],
};

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function isDateInRange(rawValue, from, to) {
  if (!rawValue) {
    return false;
  }

  const date = new Date(rawValue);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date >= from && date <= to;
}

function resolvePaymentDate(payment) {
  return payment.thoi_gian_xac_nhan || payment.thoi_gian_thanh_toan || payment.created_at || null;
}

function resolveInvoiceDate(invoice) {
  return invoice.ngay_lap || invoice.created_at || invoice.ngay_den_han || null;
}

function summarizeInvoiceStats(invoices) {
  return invoices.reduce(
    (summary, invoice) => {
      const status = normalizeInvoiceStatus(invoice);

      summary.total += 1;
      if (status === "COMPLETED") summary.completed += 1;
      else if (status === "OVERDUE") summary.overdue += 1;
      else if (status === "CANCELLED") summary.cancelled += 1;
      else summary.pending += 1;

      return summary;
    },
    {
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      cancelled: 0,
    },
  );
}

function summarizeRefundStats(refunds) {
  return refunds.reduce(
    (summary, refund) => {
      const status = normalizeRefundStatus(refund.trang_thai);

      if (status === "COMPLETED") summary.completed += 1;
      else if (status === "PROCESSING") summary.processing += 1;
      else if (status === "FAILED") summary.failed += 1;
      else summary.pending += 1;

      return summary;
    },
    {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    },
  );
}

function summarizeTransactionStats(transactions, invoiceMap = {}) {
  return transactions.reduce(
    (summary, payment) => {
      const status = normalizePaymentStatus(payment);
      const amount = toNumber(payment.so_tien);
      const invoice = invoiceMap[payment.ma_hoa_don] || null;
      const expectedAmount = toNumber(invoice?.tong_so_tien);
      const hasMismatch = invoice && Math.abs(roundMoney(amount - expectedAmount)) > 0;

      summary.total += 1;
      if (status === "CONFIRMED") summary.successful += 1;
      else if (status === "FAILED") summary.failed += 1;
      else summary.pending += 1;

      if (hasMismatch) {
        summary.mismatch += 1;
      }

      return summary;
    },
    {
      total: 0,
      successful: 0,
      pending: 0,
      failed: 0,
      mismatch: 0,
    },
  );
}

function summarizeContractStats(contracts) {
  return contracts.reduce(
    (summary, contract) => {
      const status = normalizeContractStatus(contract);
      const rawStatus = String(contract.trang_thai || "").toUpperCase();

      if (status === "ACTIVE") {
        summary.contractsActive += 1;
      }

      if (rawStatus.includes("CHO_LAP_KHOAN_THU_DAU")) {
        summary.contractsNeedingBilling += 1;
      }

      return summary;
    },
    {
      contractsNeedingBilling: 0,
      contractsActive: 0,
    },
  );
}

const AccountingDashboardPageModel = {
  ...PAGE_SPEC,

  async getKpiOverview() {
    ensureClient();

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const previousMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const previousMonthEnd = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));

    const [invoiceResult, paymentResult, refundResult, contractResult] = await Promise.all([
      supabase.from(TABLES.invoices).select("*"),
      supabase.from(TABLES.payments).select("*"),
      supabase.from(TABLES.refunds).select("*"),
      supabase.from(TABLES.contracts).select("ma_hop_dong, trang_thai"),
    ]);

    if (invoiceResult.error) throw invoiceResult.error;
    if (paymentResult.error) throw paymentResult.error;
    if (refundResult.error) throw refundResult.error;
    if (contractResult.error) throw contractResult.error;

    const invoices = invoiceResult.data || [];
    const payments = paymentResult.data || [];
    const refunds = refundResult.data || [];
    const contracts = contractResult.data || [];

    const invoiceMap = invoices.reduce((accumulator, invoice) => {
      accumulator[invoice.ma_hoa_don] = invoice;
      return accumulator;
    }, {});

    const currentMonthInvoices = invoices.filter((invoice) =>
      isDateInRange(resolveInvoiceDate(invoice), currentMonthStart, currentMonthEnd),
    );

    const currentMonthPayments = payments.filter((payment) =>
      isDateInRange(resolvePaymentDate(payment), currentMonthStart, currentMonthEnd),
    );

    const previousMonthPayments = payments.filter((payment) =>
      isDateInRange(resolvePaymentDate(payment), previousMonthStart, previousMonthEnd),
    );

    const currentRevenue = roundMoney(
      currentMonthPayments
        .filter((payment) => normalizePaymentStatus(payment) === "CONFIRMED")
        .reduce((sum, payment) => sum + toNumber(payment.so_tien), 0),
    );

    const previousRevenue = roundMoney(
      previousMonthPayments
        .filter((payment) => normalizePaymentStatus(payment) === "CONFIRMED")
        .reduce((sum, payment) => sum + toNumber(payment.so_tien), 0),
    );

    const monthlyChange = roundMoney(currentRevenue - previousRevenue);
    const monthlyChangePercent =
      previousRevenue > 0 ? roundMoney((monthlyChange / previousRevenue) * 100) : currentRevenue > 0 ? 100 : 0;

    return {
      totalRevenue: currentRevenue,
      monthlyChange,
      monthlyChangePercent,
      invoiceStats: summarizeInvoiceStats(currentMonthInvoices),
      refundStats: summarizeRefundStats(refunds),
      transactionStats: summarizeTransactionStats(currentMonthPayments, invoiceMap),
      ...summarizeContractStats(contracts),
    };
  },
};

module.exports = AccountingDashboardPageModel;
