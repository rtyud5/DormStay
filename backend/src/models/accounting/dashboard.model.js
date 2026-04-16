const {
  supabase,
  TABLES,
  groupBy,
  loadContractContext,
  loadInvoiceContext,
  mapContractRow,
  mapInvoiceRow,
  normalizePaymentStatus,
  normalizeRefundStatus,
  roundMoney,
  toNumber,
  ensureClient,
} = require("./shared");

module.exports = {
  async getDashboard(filters = {}) {
    ensureClient();

    const invoicesPromise = supabase
      .from(TABLES.invoices)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    const paymentsPromise = supabase
      .from(TABLES.payments)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    const refundsPromise = supabase
      .from(TABLES.refunds)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    const contractsPromise = supabase
      .from(TABLES.contracts)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const [invoiceResult, paymentResult, refundResult, contractResult] = await Promise.all([
      invoicesPromise,
      paymentsPromise,
      refundsPromise,
      contractsPromise,
    ]);

    if (invoiceResult.error) throw invoiceResult.error;
    if (paymentResult.error) throw paymentResult.error;
    if (refundResult.error) throw refundResult.error;
    if (contractResult.error) throw contractResult.error;

    const invoices = invoiceResult.data || [];
    const payments = paymentResult.data || [];
    const refunds = refundResult.data || [];
    const contracts = contractResult.data || [];
    groupBy(payments, "ma_hoa_don");

    const invoiceContext = await loadInvoiceContext(invoices, [], payments);
    const mappedInvoices = invoices.map((invoice) =>
      mapInvoiceRow(invoice, { ...invoiceContext, invoiceItemGroup: {} }),
    );
    const contractContext = await loadContractContext(contracts);
    const mappedContracts = contracts.map((contract) => mapContractRow(contract, contractContext));

    const totalRevenueFromInvoices = invoices.reduce(
      (sum, invoice) => sum + toNumber(invoice.so_tien_da_thanh_toan),
      0,
    );
    const totalRevenueFromConfirmedPayments = payments
      .filter((payment) => normalizePaymentStatus(payment) === "CONFIRMED")
      .reduce((sum, payment) => sum + toNumber(payment.so_tien), 0);
    const totalRevenue = Math.max(totalRevenueFromInvoices, totalRevenueFromConfirmedPayments);

    const invoiceStats = mappedInvoices.reduce(
      (accumulator, invoice) => {
        accumulator.total += 1;
        accumulator[invoice.status.toLowerCase()] += 1;
        return accumulator;
      },
      { total: 0, completed: 0, overdue: 0, pending: 0, cancelled: 0 },
    );

    const refundStats = refunds.reduce(
      (accumulator, refund) => {
        const status = normalizeRefundStatus(refund.trang_thai).toLowerCase();
        accumulator[status] += 1;
        return accumulator;
      },
      { pending: 0, processing: 0, completed: 0, failed: 0 },
    );

    const transactionStats = payments.reduce(
      (accumulator, payment) => {
        const invoice = invoices.find((item) => item.ma_hoa_don === payment.ma_hoa_don);
        const systemAmount = toNumber(invoice?.tong_so_tien);
        const actualAmount = toNumber(payment.so_tien);
        const paymentStatus = normalizePaymentStatus(payment);

        accumulator.total += 1;

        if (paymentStatus === "CONFIRMED" && systemAmount === actualAmount) {
          accumulator.successful += 1;
        } else if (paymentStatus === "PENDING") {
          accumulator.pending += 1;
        } else {
          accumulator.mismatch += 1;
        }

        return accumulator;
      },
      { total: 0, successful: 0, mismatch: 0, pending: 0 },
    );

    const recentInvoices = mappedInvoices.slice(0, Number(filters.limit) || 5);
    const contractsNeedingBilling = mappedContracts
      .filter((contract) => {
        const contractInvoices = invoices.filter((invoice) => invoice.ma_hop_dong === contract.id);
        return contract.status === "ACTIVE" && contractInvoices.length === 0;
      })
      .slice(0, 5);

    return {
      totalRevenue: roundMoney(totalRevenue),
      monthlyChange: 0,
      monthlyChangePercent: 0,
      invoiceStats,
      refundStats,
      transactionStats,
      recentInvoices,
      contractsNeedingBilling,
    };
  },
};
