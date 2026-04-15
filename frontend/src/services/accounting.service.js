/**
 * Accounting Service - API Calls
 * Tất cả các request liên quan đến kế toán
 */

import api from "./api";
import {
  mockContracts,
  mockInvoices,
  mockPayments,
  mockRefunds,
  mockReconciliations,
  mockTransactionLog,
  mockFinancialStatement,
  mockDashboardKPI,
  mockBillingDetails,
  mockExtraCharges,
} from "../mockdata/accounting.mockdata";

// Mock flag
const USE_MOCK_DATA = import.meta.env.VITE_USE_ACCOUNTING_MOCK === "true";

const unwrapPayload = (response) => response?.data?.data ?? null;
const unwrapSuccess = (response) => response?.data?.success ?? false;
const unwrapMessage = (response) => response?.data?.message ?? "";

const mapListResponse = (response) => {
  const payload = unwrapPayload(response) || {};

  return {
    success: unwrapSuccess(response),
    data: payload.items || [],
    total: payload.total || 0,
    page: payload.page || 1,
    limit: payload.limit || 10,
    message: unwrapMessage(response),
  };
};

const mapDetailResponse = (response) => ({
  success: unwrapSuccess(response),
  data: unwrapPayload(response),
  message: unwrapMessage(response),
});

const getInitials = (fullName = "") =>
  fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");

const mapInvoiceUiFields = (invoice) => ({
  ...invoice,
  avatarInitials: invoice.avatarInitials || getInitials(invoice.customerName),
  method: invoice.method || invoice.paymentMethod || "—",
  paidDate: invoice.paidDate || invoice.paymentDate || "—",
  statusText: invoice.statusText || invoice.status,
  isOverdue: invoice.status === "OVERDUE",
});

const mapContractUiFields = (contract) => ({
  ...contract,
  avatarInitials: contract.avatarInitials || getInitials(contract.customerName),
});

// ==================== CONTRACTS ====================

/**
 * Get contracts list with filters
 */
export const getContracts = async (filters = {}) => {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockContracts];

    if (filters.status) {
      filtered = filtered.filter((c) => c.status === filters.status);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.customerName.toLowerCase().includes(search) ||
          c.id.toLowerCase().includes(search) ||
          c.roomNumber.toLowerCase().includes(search),
      );
    }

    return {
      success: true,
      data: filtered,
      total: filtered.length,
      page: filters.page || 1,
      limit: filters.limit || 10,
    };
  }

  const response = await api.get("/accounting/contracts", { params: filters });
  const normalized = mapListResponse(response);

  return {
    ...normalized,
    data: normalized.data.map(mapContractUiFields),
  };
};

/**
 * Get single contract
 */
export const getContractDetail = async (contractId) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const contract = mockContracts.find((c) => c.id === contractId);
    return {
      success: !!contract,
      data: contract,
    };
  }

  const response = await api.get(`/accounting/contracts/${contractId}`);
  const normalized = mapDetailResponse(response);

  return {
    ...normalized,
    data: normalized.data ? mapContractUiFields(normalized.data) : null,
  };
};

export const getBillingPreview = async (contractId) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      data: null,
    };
  }

  const response = await api.get(`/accounting/contracts/${contractId}/billing-preview`);
  return mapDetailResponse(response);
};

// ==================== INVOICES ====================

/**
 * Get invoices list with filters
 */
export const getInvoices = async (filters = {}) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockInvoices];

    if (filters.status) {
      filtered = filtered.filter((inv) => inv.status === filters.status);
    }

    if (filters.invoiceType) {
      filtered = filtered.filter((inv) => inv.invoiceType === filters.invoiceType);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.id.toLowerCase().includes(search) ||
          inv.customerName.toLowerCase().includes(search) ||
          inv.contractId.toLowerCase().includes(search),
      );
    }

    return {
      success: true,
      data: filtered,
      total: filtered.length,
      page: filters.page || 1,
      limit: filters.limit || 10,
    };
  }

  const response = await api.get("/accounting/invoices", { params: filters });
  const normalized = mapListResponse(response);

  return {
    ...normalized,
    data: normalized.data.map(mapInvoiceUiFields),
  };
};

/**
 * Get invoice detail with billing details
 */
export const getInvoiceDetail = async (invoiceId) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const invoice = mockInvoices.find((inv) => inv.id === invoiceId);
    const billingDetails = mockBillingDetails.filter((bd) => bd.invoiceId === invoiceId);

    return {
      success: !!invoice,
      data: {
        ...invoice,
        billingDetails,
      },
    };
  }

  const response = await api.get(`/accounting/invoices/${invoiceId}`);
  const normalized = mapDetailResponse(response);

  return {
    ...normalized,
    data: normalized.data ? mapInvoiceUiFields(normalized.data) : null,
  };
};

/**
 * Create invoice (lập phiếu)
 */
export const createInvoice = async (invoiceData) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newInvoice = {
      id: `INV-${Date.now()}`,
      ...invoiceData,
      createdAt: new Date().toISOString(),
    };
    mockInvoices.push(newInvoice);

    return {
      success: true,
      data: newInvoice,
      message: "Lập phiếu thành công",
    };
  }

  const response = await api.post("/accounting/invoices", invoiceData);
  return mapDetailResponse(response);
};

/**
 * Create extra invoice (phiếu phát sinh)
 */
export const createExtraInvoice = async (invoiceData) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newInvoice = {
      id: `PS-${Date.now()}`,
      invoiceType: "PHAT_SINH",
      ...invoiceData,
      createdAt: new Date().toISOString(),
    };
    mockInvoices.push(newInvoice);
    mockExtraCharges.push(newInvoice);

    return {
      success: true,
      data: newInvoice,
      message: "Lập phiếu phát sinh thành công",
    };
  }

  const response = await api.post("/accounting/invoices/extra", invoiceData);
  return mapDetailResponse(response);
};

/**
 * Update invoice
 */
export const updateInvoice = async (invoiceId, updateData) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = mockInvoices.findIndex((inv) => inv.id === invoiceId);
    if (index !== -1) {
      mockInvoices[index] = { ...mockInvoices[index], ...updateData };
    }

    return {
      success: index !== -1,
      data: mockInvoices[index],
    };
  }

  const response = await api.put(`/accounting/invoices/${invoiceId}`, updateData);
  return mapDetailResponse(response);
};

// ==================== PAYMENTS ====================

/**
 * Get payments with filters
 */
export const getPayments = async (filters = {}) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockPayments];

    if (filters.status) {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    if (filters.invoiceId) {
      filtered = filtered.filter((p) => p.invoiceId === filters.invoiceId);
    }

    return {
      success: true,
      data: filtered,
      total: filtered.length,
    };
  }

  const response = await api.get("/accounting/payments", { params: filters });
  return mapListResponse(response);
};

/**
 * Record payment
 */
export const recordPayment = async (paymentData) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newPayment = {
      id: `PAY-${Date.now()}`,
      ...paymentData,
      createdAt: new Date().toISOString(),
    };
    mockPayments.push(newPayment);

    // Update invoice status
    const invoice = mockInvoices.find((inv) => inv.id === paymentData.invoiceId);
    if (invoice) {
      invoice.status = "COMPLETED";
      invoice.paymentDate = new Date().toISOString();
    }

    return {
      success: true,
      data: newPayment,
      message: "Ghi nhận thanh toán thành công",
    };
  }

  const response = await api.post("/accounting/payments", paymentData);
  return mapDetailResponse(response);
};

/**
 * Confirm payment
 */
export const confirmPayment = async (paymentId) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const payment = mockPayments.find((p) => p.id === paymentId);
    if (payment) {
      payment.status = "CONFIRMED";
      payment.confirmedDate = new Date().toISOString();
    }

    return {
      success: !!payment,
      data: payment,
      message: "Xác nhận thanh toán thành công",
    };
  }

  const response = await api.post(`/accounting/payments/${paymentId}/confirm`);
  return mapDetailResponse(response);
};

// ==================== REFUNDS ====================

/**
 * Get refunds with filters
 */
export const getRefunds = async (filters = {}) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockRefunds];

    if (filters.status) {
      filtered = filtered.filter((ref) => ref.status === filters.status);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (ref) =>
          ref.customerName.toLowerCase().includes(search) ||
          ref.contractId.toLowerCase().includes(search) ||
          ref.id.toLowerCase().includes(search),
      );
    }

    return {
      success: true,
      data: filtered,
      total: filtered.length,
    };
  }

  const response = await api.get("/accounting/refunds", { params: filters });
  return mapListResponse(response);
};

export const getRefundDetail = async (refundId) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const refund = mockRefunds.find((item) => item.id === refundId);
    return {
      success: !!refund,
      data: refund || null,
    };
  }

  const response = await api.get(`/accounting/refunds/${refundId}`);
  return mapDetailResponse(response);
};

/**
 * Create refund record
 */
export const createRefund = async (refundData) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newRefund = {
      id: `REF-${Date.now()}`,
      ...refundData,
      issuedDate: new Date().toISOString(),
    };
    mockRefunds.push(newRefund);

    return {
      success: true,
      data: newRefund,
      message: "Tạo phiếu hoàn cọc thành công",
    };
  }

  const response = await api.post("/accounting/refunds", refundData);
  return mapDetailResponse(response);
};

/**
 * Process refund
 */
export const processRefund = async (refundId, status = "PROCESSING") => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const refund = mockRefunds.find((ref) => ref.id === refundId);
    if (refund) {
      refund.status = status;
      if (status === "COMPLETED") {
        refund.completedDate = new Date().toISOString();
      }
    }

    return {
      success: !!refund,
      data: refund,
      message: `Cập nhật trạng thái thành "${status}" thành công`,
    };
  }

  const response = await api.put(`/accounting/refunds/${refundId}`, { status });
  return mapDetailResponse(response);
};

// ==================== TRANSACTIONS ====================

/**
 * Get transaction log with filters
 */
export const getTransactions = async (filters = {}) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockTransactionLog];

    if (filters.status) {
      filtered = filtered.filter((txn) => txn.status === filters.status);
    }

    if (filters.matchStatus) {
      filtered = filtered.filter((txn) => txn.matchStatus === filters.matchStatus);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (txn) => txn.id.toLowerCase().includes(search) || txn.refNumber.toLowerCase().includes(search),
      );
    }

    return {
      success: true,
      data: filtered,
      total: filtered.length,
      stats: {
        success: filtered.filter((t) => t.status === "SUCCESS").length,
        failed: filtered.filter((t) => t.status === "FAILED").length,
        pending: filtered.filter((t) => t.status === "PENDING").length,
        mismatch: filtered.filter((t) => t.status === "MISMATCH").length,
      },
    };
  }

  const response = await api.get("/accounting/transactions", { params: filters });
  const normalized = mapListResponse(response);

  return {
    ...normalized,
    stats: {
      success: normalized.data.filter((item) => item.matchStatus === "MATCHED").length,
      failed: normalized.data.filter((item) => item.status === "FAILED").length,
      pending: normalized.data.filter((item) => item.status === "PENDING").length,
      mismatch: normalized.data.filter((item) => item.matchStatus === "MISMATCH").length,
    },
  };
};

/**
 * Resolve transaction mismatch
 */
export const resolveTransaction = async (transactionId, resolution) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const txn = mockTransactionLog.find((t) => t.id === transactionId);
    if (txn) {
      txn.status = resolution.status;
      txn.matchStatus = resolution.matchStatus;
      txn.notes = resolution.notes;
    }

    return {
      success: !!txn,
      data: txn,
      message: "Cập nhật giao dịch thành công",
    };
  }

  const response = await api.post(`/accounting/transactions/${transactionId}/resolve`, resolution);
  return mapDetailResponse(response);
};

// ==================== RECONCILIATION ====================

/**
 * Get reconciliation records
 */
export const getReconciliations = async (filters = {}) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockReconciliations];

    if (filters.status) {
      filtered = filtered.filter((rec) => rec.status === filters.status);
    }

    return {
      success: true,
      data: filtered,
      total: filtered.length,
    };
  }

  const response = await api.get("/accounting/reconciliation", { params: filters });
  return mapListResponse(response);
};

/**
 * Get reconciliation for a specific period
 */
export const getReconciliationDetail = async (reconciliationId) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Generate mock reconciliation data for the period
    const data = {
      period: reconciliationId,
      status: "OPEN",
      revenue: {
        roomRent: 45000000,
        utilities: 8500000,
        services: 2300000,
        lateFees: 850000,
        total: 56650000,
      },
      expenses: {
        labor: 12000000,
        maintenance: 3500000,
        utilities: 5200000,
        other: 2300000,
        total: 23000000,
      },
      profit: {
        grossProfit: 33650000,
        netProfit: 33650000,
      },
      contracts: {
        active: 18,
        ended: 2,
        totalMonthlyRate: 45000000,
      },
      payments: {
        collected: 54200000,
        outstanding: 2450000,
        collectionRate: 96,
      },
    };

    return {
      success: true,
      data,
    };
  }

  const response = await api.get(`/accounting/reconciliation/${reconciliationId}`);
  return mapDetailResponse(response);
};

/**
 * Perform reconciliation
 */
export const performReconciliation = async (reconciliationData) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      data: reconciliationData,
      message: "Đối soát thành công",
    };
  }

  const response = await api.post("/accounting/reconciliation", reconciliationData);
  return mapDetailResponse(response);
};

// ==================== FINANCIAL STATEMENT ====================

/**
 * Get dashboard KPI
 */
export const getDashboardKPI = async () => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      data: mockDashboardKPI,
    };
  }

  const response = await api.get("/accounting/dashboard");
  return mapDetailResponse(response);
};

/**
 * Get financial statement
 */
export const getFinancialStatement = async (period) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      data: {
        ...mockFinancialStatement,
        period,
      },
    };
  }

  const response = await api.get(`/accounting/statement?period=${period}`);
  return mapDetailResponse(response);
};

/**
 * Generate report
 */
export const generateReport = async (reportType, params = {}) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      data: {
        reportType,
        generatedAt: new Date().toISOString(),
        url: `/reports/${reportType}-${Date.now()}.pdf`,
      },
      message: `Báo cáo ${reportType} đã được tạo thành công`,
    };
  }

  const response = await api.post("/accounting/reports", {
    reportType,
    ...params,
  });

  return mapDetailResponse(response);
};

// ==================== BATCH OPERATIONS ====================

/**
 * Generate initial billing for contracts
 */
export const generateInitialBilling = async (payload) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const contractIds = Array.isArray(payload) ? payload : [payload?.contractId].filter(Boolean);

    return {
      success: true,
      data: {
        created: contractIds.length,
        invoices: contractIds.map((id) => ({
          contractId: id,
          invoiceId: `INV-${Date.now()}`,
        })),
      },
      message: `Đã lập phiếu cho ${contractIds.length} hợp đồng`,
    };
  }

  const response = await api.post("/accounting/billing/generate-initial", payload);
  return mapDetailResponse(response);
};

/**
 * Send payment reminders
 */
export const sendPaymentReminders = async (invoiceIds) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      data: {
        sent: invoiceIds.length,
      },
      message: `Đã gửi nhắc nhở thanh toán đến ${invoiceIds.length} khách hàng`,
    };
  }

  const response = await api.post("/accounting/invoices/send-reminders", {
    invoiceIds,
  });

  return mapDetailResponse(response);
};

export default {
  getContracts,
  getContractDetail,
  getBillingPreview,
  getInvoices,
  getInvoiceDetail,
  createInvoice,
  createExtraInvoice,
  updateInvoice,
  getPayments,
  recordPayment,
  confirmPayment,
  getRefunds,
  getRefundDetail,
  createRefund,
  processRefund,
  getTransactions,
  resolveTransaction,
  getReconciliations,
  getReconciliationDetail,
  performReconciliation,
  getDashboardKPI,
  getFinancialStatement,
  generateReport,
  generateInitialBilling,
  sendPaymentReminders,
};
