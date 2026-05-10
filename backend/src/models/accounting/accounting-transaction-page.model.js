const { supabase } = require("../../config/supabase");
const { AppError } = require("../../utils/errors");
const { buildPagination, toNumber, roundMoney, includesAny } = require("./shared");

const TABLES = {
  invoices: "hoa_don",
  refunds: "phieu_hoan_coc",
  extraPayments: "phieu_thanh_toan_phat_sinh",
  contracts: "hop_dong",
  profiles: "ho_so",
};

function normalizeTransactionStatus(rawStatus) {
  const value = String(rawStatus || "").toUpperCase();
  if (includesAny(value, ["DA_XAC_NHAN", "CONFIRMED", "DA_THANH_TOAN", "DA_HOAN", "HOAN_TAT", "COMPLETED", "DA_NHAN"]))
    return "CONFIRMED";
  if (includesAny(value, ["CHO_XAC_NHAN", "CHO_THANH_TOAN", "PENDING", "CHO_HOAN", "DANG_XU_LY", "PROCESS"]))
    return "PENDING";
  if (includesAny(value, ["THAT_BAI", "FAILED", "HUY", "CANCEL"])) return "FAILED";
  return "PENDING";
}

function mapStatusFilter(filterStatus) {
  if (!filterStatus || filterStatus === "all" || filterStatus === "ALL") return null;
  const value = String(filterStatus).toUpperCase();
  if (value === "CONFIRMED")
    return ["DA_XAC_NHAN", "CONFIRMED", "DA_THANH_TOAN", "DA_HOAN", "HOAN_TAT", "COMPLETED", "DA_NHAN"];
  if (value === "PENDING") return ["CHO_XAC_NHAN", "CHO_THANH_TOAN", "PENDING", "CHO_HOAN", "DANG_XU_LY", "PROCESSING"];
  if (value === "FAILED") return ["THAT_BAI", "FAILED", "HUY", "CANCEL"];
  return null;
}

function getTransactionTypeLabel(type) {
  const labels = {
    INVOICE_INITIAL: "Hóa đơn kỳ đầu",
    INVOICE_EXTRA: "Hóa đơn phát sinh",
    INVOICE_DEPOSIT: "Hóa đơn cọc",
    REFUND: "Phiếu hoàn cọc",
    EXTRA_PAYMENT: "Phiếu thanh toán phát sinh",
  };
  return labels[type] || type;
}

function mapInvoiceTransaction(invoice, customer) {
  let type = "INVOICE_EXTRA";
  const invoiceType = String(invoice.loai_hoa_don || "").toUpperCase();
  if (invoiceType.includes("KY_DAU") || invoiceType.includes("INITIAL")) type = "INVOICE_INITIAL";
  if (invoiceType.includes("COC") || invoiceType.includes("DEPOSIT")) type = "INVOICE_DEPOSIT";
  if (invoiceType.includes("PHAT_SINH") || invoiceType.includes("EXTRA")) type = "INVOICE_EXTRA";

  return {
    id: `INV-${invoice.ma_hoa_don}`,
    type,
    typeLabel: getTransactionTypeLabel(type),
    invoiceId: invoice.ma_hoa_don,
    contractId: invoice.ma_hop_dong,
    customerName: customer?.ho_ten || "Khách thuê chưa cập nhật",
    phone: customer?.so_dien_thoai || "",
    amount: toNumber(invoice.tong_so_tien),
    paidAmount: toNumber(invoice.so_tien_da_thanh_toan),
    status: normalizeTransactionStatus(invoice.trang_thai),
    statusRaw: invoice.trang_thai,
    createdDate: invoice.ngay_lap,
    dueDate: invoice.ngay_den_han,
    createdAt: invoice.created_at,
  };
}

function mapRefundTransaction(refund, customer) {
  return {
    id: `REF-${refund.ma_phieu_hoan_coc}`,
    type: "REFUND",
    typeLabel: "Phiếu hoàn cọc",
    refundId: refund.ma_phieu_hoan_coc,
    contractId: refund.ma_hop_dong,
    customerName: customer?.ho_ten || "Khách thuê chưa cập nhật",
    phone: customer?.so_dien_thoai || "",
    beneficiaryName: refund.ten_nguoi_nhan,
    amount: toNumber(refund.so_tien_hoan),
    status: normalizeTransactionStatus(refund.trang_thai),
    statusRaw: refund.trang_thai,
    createdDate: refund.created_at,
    dueDate: null,
    createdAt: refund.created_at,
  };
}

function mapExtraPaymentTransaction(payment, customer) {
  return {
    id: `EXP-${payment.ma_phieu_tt_phat_sinh}`,
    type: "EXTRA_PAYMENT",
    typeLabel: "Phiếu thanh toán phát sinh",
    paymentId: payment.ma_phieu_tt_phat_sinh,
    contractId: payment.ma_hop_dong,
    customerName: customer?.ho_ten || "Khách thuê chưa cập nhật",
    phone: customer?.so_dien_thoai || "",
    amount: toNumber(payment.so_tien_thanh_toan),
    status: normalizeTransactionStatus(payment.trang_thai),
    statusRaw: payment.trang_thai,
    createdDate: payment.created_at,
    dueDate: null,
    createdAt: payment.created_at,
  };
}

function mapTransaction(tx, invoiceMap, contractMap, profileMap) {
  const invoice = invoiceMap[tx.ma_hoa_don] || null;
  const contract = contractMap[tx.ma_hop_dong] || null;
  const customer = profileMap[contract?.ma_ho_so_khach_hang] || null;
  return {
    id: tx.ma_thanh_toan,
    invoiceId: tx.ma_hoa_don,
    contractId: tx.ma_hop_dong,
    customerName: customer?.ho_ten || "Khách thuê chưa cập nhật",
    phone: customer?.so_dien_thoai || "",
    amount: toNumber(tx.so_tien_thanh_toan),
    paymentMethod: tx.hinh_thuc_thanh_toan,
    status: normalizeTransactionStatus(tx.trang_thai),
    statusRaw: tx.trang_thai,
    createdAt: tx.created_at,
    invoice,
    contract,
    raw: tx,
  };
}

async function fetchByIds(tableName, idField, ids, columns = "*") {
  if (!ids.length) return [];
  const { data, error } = await supabase.from(tableName).select(columns).in(idField, ids);
  if (error) throw error;
  return data || [];
}

async function fetchOne(tableName, idField, id, columns = "*") {
  const { data, error } = await supabase.from(tableName).select(columns).eq(idField, id).maybeSingle();
  if (error) throw error;
  return data;
}

const AccountingTransactionPageModel = {
  id: "accounting-transaction-page",
  frontendPageName: "AccountingTransactionPage",
  frontendFile: "frontend/src/pages/accounting/AccountingTransactionPage.jsx",
  routePath: "/accounting/transactions",
  reviewStatus: "IN_PROGRESS",
  apiStatus: "ENABLED",
  purpose:
    "Transaction investigation page model that aggregates all payment-related documents (invoices, refunds, extra payments) for comprehensive transaction auditing.",
  reviewFocus: [
    "Consolidated transaction view from multiple sources",
    "Proper status normalization across all transaction types",
    "Customer and contract information enrichment",
  ],

  async listTransactions(filters = {}) {
    const { status, search, page = 1, limit = 20 } = filters;
    const { currentPage, currentLimit, from, to } = buildPagination(page, limit);
    const statusFilter = mapStatusFilter(status);

    // Fetch all transaction types in parallel
    const [invoices, refunds, extraPayments] = await Promise.all([
      supabase.from(TABLES.invoices).select("*"),
      supabase.from(TABLES.refunds).select("*"),
      supabase.from(TABLES.extraPayments).select("*"),
    ]);

    if (invoices.error) throw invoices.error;
    if (refunds.error) throw refunds.error;
    if (extraPayments.error) throw extraPayments.error;

    const allContractIds = [
      ...(invoices.data || []).map((i) => i.ma_hop_dong),
      ...(refunds.data || []).map((r) => r.ma_hop_dong),
      ...(extraPayments.data || []).map((p) => p.ma_hop_dong),
    ].filter(Boolean);

    const uniqueContractIds = [...new Set(allContractIds)];
    const contracts = await fetchByIds(TABLES.contracts, "ma_hop_dong", uniqueContractIds);
    const profileIds = [...new Set(contracts.map((c) => c.ma_ho_so_khach_hang).filter(Boolean))];
    const profiles = await fetchByIds(TABLES.profiles, "ma_ho_so", profileIds);

    const contractMap = Object.fromEntries(contracts.map((c) => [c.ma_hop_dong, c]));
    const profileMap = Object.fromEntries(profiles.map((p) => [p.ma_ho_so, p]));

    // Build all transactions
    let allTransactions = [];

    // Add invoice transactions
    (invoices.data || []).forEach((inv) => {
      const contract = contractMap[inv.ma_hop_dong];
      const customer = contract ? profileMap[contract.ma_ho_so_khach_hang] : null;
      allTransactions.push(mapInvoiceTransaction(inv, customer));
    });

    // Add refund transactions
    (refunds.data || []).forEach((ref) => {
      const contract = contractMap[ref.ma_hop_dong];
      const customer = contract ? profileMap[contract.ma_ho_so_khach_hang] : null;
      allTransactions.push(mapRefundTransaction(ref, customer));
    });

    // Add extra payment transactions
    (extraPayments.data || []).forEach((exp) => {
      const contract = contractMap[exp.ma_hop_dong];
      const customer = contract ? profileMap[contract.ma_ho_so_khach_hang] : null;
      allTransactions.push(mapExtraPaymentTransaction(exp, customer));
    });

    // Apply filters
    if (statusFilter) {
      allTransactions = allTransactions.filter((tx) => statusFilter.includes(String(tx.statusRaw || "").toUpperCase()));
    }

    if (search) {
      const keyword = String(search).toLowerCase();
      allTransactions = allTransactions.filter((tx) =>
        [tx.id, tx.customerName, tx.phone, tx.contractId, tx.typeLabel]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(keyword)),
      );
    }

    // Sort by created date descending
    allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate
    const total = allTransactions.length;
    const paginatedItems = allTransactions.slice(from, to);

    // Build stats
    const stats = {
      total: total,
      confirmed: allTransactions.filter((tx) => tx.status === "CONFIRMED").length,
      pending: allTransactions.filter((tx) => tx.status === "PENDING").length,
      failed: allTransactions.filter((tx) => tx.status === "FAILED").length,
    };

    return {
      items: paginatedItems,
      total,
      page: currentPage,
      limit: currentLimit,
      stats,
    };
  },

  async getTransactionDetail(transactionId) {
    const prefix = String(transactionId || "").split("-")[0];

    if (prefix === "INV") {
      const invoiceId = transactionId.replace("INV-", "");
      const invoice = await fetchOne(TABLES.invoices, "ma_hoa_don", invoiceId);
      if (!invoice) throw new AppError("Invoice not found", 404);

      const contract = await fetchOne(TABLES.contracts, "ma_hop_dong", invoice.ma_hop_dong);
      const customer = contract ? await fetchOne(TABLES.profiles, "ma_ho_so", contract.ma_ho_so_khach_hang) : null;

      return mapInvoiceTransaction(invoice, customer);
    }

    if (prefix === "REF") {
      const refundId = transactionId.replace("REF-", "");
      const refund = await fetchOne(TABLES.refunds, "ma_phieu_hoan_coc", refundId);
      if (!refund) throw new AppError("Refund not found", 404);

      const contract = await fetchOne(TABLES.contracts, "ma_hop_dong", refund.ma_hop_dong);
      const customer = contract ? await fetchOne(TABLES.profiles, "ma_ho_so", contract.ma_ho_so_khach_hang) : null;

      return mapRefundTransaction(refund, customer);
    }

    if (prefix === "EXP") {
      const paymentId = transactionId.replace("EXP-", "");
      const payment = await fetchOne(TABLES.extraPayments, "ma_phieu_tt_phat_sinh", paymentId);
      if (!payment) throw new AppError("Extra payment not found", 404);

      const contract = await fetchOne(TABLES.contracts, "ma_hop_dong", payment.ma_hop_dong);
      const customer = contract ? await fetchOne(TABLES.profiles, "ma_ho_so", contract.ma_ho_so_khach_hang) : null;

      return mapExtraPaymentTransaction(payment, customer);
    }

    throw new AppError("Invalid transaction ID format", 400);
  },
};

module.exports = AccountingTransactionPageModel;
