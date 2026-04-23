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

const mapRefundUiFields = (refund) => ({
  ...refund,
  avatarInitials: refund.avatarInitials || getInitials(refund.customerName),
  statusText: refund.statusText || refund.status,
});

const mapTransactionUiFields = (transaction) => ({
  ...transaction,
  statusText: transaction.statusText || transaction.status,
});

const mapReconciliationUiFields = (reconciliation) => ({
  ...reconciliation,
  avatarInitials: reconciliation.avatarInitials || getInitials(reconciliation.customerName),
  statusText: reconciliation.statusText || reconciliation.status,
  lineItems: Array.isArray(reconciliation.lineItems) ? reconciliation.lineItems : [],
  suggestedLineItems: Array.isArray(reconciliation.suggestedLineItems) ? reconciliation.suggestedLineItems : [],
  inspectionItems: Array.isArray(reconciliation.inspectionItems) ? reconciliation.inspectionItems : [],
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

    const contract = mockContracts.find((item) => String(item.id) === String(contractId)) || null;
    if (!contract) {
      return {
        success: false,
        data: null,
        message: "Khong tim thay hop dong",
      };
    }

    const startDate = contract.startDate ? new Date(contract.startDate) : new Date();
    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    const rentDays = Math.max(daysInMonth - startDate.getDate() + 1, 1);
    const unitPrice = Math.round(contract.baseRent / daysInMonth);
    const amount = unitPrice * rentDays;

    return {
      success: true,
      data: {
        contract,
        rentLineItem: {
          category: "TIEN_THUE_THANG_DAU",
          description: `Tien thue ky dau (${rentDays}/${daysInMonth} ngay)`,
          quantity: rentDays,
          unitPrice,
          amount,
          period: {
            daysInMonth,
            rentDays,
            startDate: contract.startDate,
          },
        },
        summary: {
          rentAmount: amount,
          extraAmount: 0,
          totalAmount: amount,
        },
        options: {
          includeDeposit: false,
        },
      },
    };
  }

  const response = await api.get(`/accounting/billing/contracts/${contractId}/preview`);
  return mapDetailResponse(response);
};

export const getInitialBillingPendingContracts = async (filters = {}) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      data: mockContracts,
      total: mockContracts.length,
      page: Number(filters.page || 1),
      limit: Number(filters.limit || 10),
    };
  }

  const response = await api.get("/accounting/billing/contracts", { params: filters });
  const normalized = mapListResponse(response);

  return {
    ...normalized,
    data: normalized.data.map(mapContractUiFields),
  };
};

export const createInitialBillingInvoice = async (contractId, payload = {}) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      data: {
        invoice: {
          id: `INV-${Date.now()}`,
          contractId,
          amount: 0,
        },
      },
      message: "Lap hoa don ky dau thanh cong",
    };
  }

  const response = await api.post(`/accounting/billing/contracts/${contractId}/invoice`, payload);
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
 * Chức năng: cập nhật nhanh thông tin phiếu thu, trạng thái và line item của hóa đơn kế toán.
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
 * Chức năng: lấy danh sách các lần thanh toán đã ghi nhận để kế toán đối chiếu với hóa đơn.
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
 * Chức năng: ghi nhận một lần thanh toán vào bảng thanh_toan trước khi kế toán xác nhận.
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
 * Chức năng: xác nhận thanh toán để cộng tiền vào hóa đơn và sinh biên lai nội bộ.
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

/**
 * Get refund detail
 * Chức năng: lấy chi tiết phiếu hoàn cọc để kế toán kiểm tra người nhận và số tiền hoàn.
 */
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
  const normalized = mapDetailResponse(response);

  return {
    ...normalized,
    data: normalized.data ? mapRefundUiFields(normalized.data) : null,
  };
};

/**
 * Create refund record
 * Chức năng: tạo phiếu hoàn cọc từ kết quả đối soát của hợp đồng.
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
 * Update refund
 * Chức năng: cập nhật trạng thái hoặc thông tin thụ hưởng của phiếu hoàn cọc.
 */
export const updateRefund = async (refundId, refundData = {}) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const refund = mockRefunds.find((item) => item.id === refundId);

    if (refund) {
      Object.assign(refund, refundData);
    }

    return {
      success: !!refund,
      data: refund || null,
      message: "Cập nhật phiếu hoàn cọc thành công",
    };
  }

  const response = await api.put(`/accounting/refunds/${refundId}`, refundData);
  const normalized = mapDetailResponse(response);

  return {
    ...normalized,
    data: normalized.data ? mapRefundUiFields(normalized.data) : null,
  };
};

/**
 * Process refund
 * Chức năng: wrapper nhanh để đổi trạng thái xử lý của phiếu hoàn cọc.
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

  return updateRefund(refundId, { status });
};

// ==================== TRANSACTIONS ====================

/**
 * Get transaction log with filters
 * Chức năng: lấy danh sách giao dịch để kế toán theo dõi trạng thái xác nhận và chênh lệch số tiền.
 */
export const getTransactions = async (filters = {}) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockTransactionLog];

    if (filters.status) {
      filtered = filtered.filter((txn) => txn.status === filters.status);
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
        confirmed: filtered.filter((t) => t.status === "CONFIRMED").length,
        failed: filtered.filter((t) => t.status === "FAILED").length,
        pending: filtered.filter((t) => t.status === "PENDING").length,
      },
    };
  }

  const response = await api.get("/accounting/transactions", { params: filters });
  const normalized = mapListResponse(response);

  return {
    ...normalized,
    data: normalized.data.map(mapTransactionUiFields),
    stats: {
      confirmed: normalized.data.filter((item) => item.status === "CONFIRMED").length,
      failed: normalized.data.filter((item) => item.status === "FAILED").length,
      pending: normalized.data.filter((item) => item.status === "PENDING").length,
    },
  };
};

/**
 * Get transaction detail
 * Chức năng: lấy chi tiết một giao dịch để hiển thị thông tin đối chiếu thủ công.
 */
export const getTransactionDetail = async (transactionId) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const transaction = mockTransactionLog.find((item) => item.id === transactionId);

    return {
      success: !!transaction,
      data: transaction ? mapTransactionUiFields(transaction) : null,
    };
  }

  const response = await api.get(`/accounting/transactions/${transactionId}`);
  const normalized = mapDetailResponse(response);

  return {
    ...normalized,
    data: normalized.data ? mapTransactionUiFields(normalized.data) : null,
  };
};

/**
 * Resolve transaction
 * Chức năng: cập nhật trạng thái giao dịch đang chờ xác nhận hoặc cần xác nhận lại ở màn tra soát.
 */
export const resolveTransaction = async (transactionId, resolution) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const txn = mockTransactionLog.find((t) => t.id === transactionId);
    if (txn) {
      txn.status = resolution.status;
      txn.notes = resolution.notes;
    }

    return {
      success: !!txn,
      data: txn,
      message: "Cập nhật giao dịch thành công",
    };
  }

  const response = await api.post(`/accounting/transactions/${transactionId}/resolve`, resolution);
  const normalized = mapDetailResponse(response);

  return {
    ...normalized,
    data: normalized.data ? mapTransactionUiFields(normalized.data) : null,
  };
};

// ==================== RECONCILIATION ====================

export const getReconciliationWorkItems = async (filters = {}) => {
  const response = await api.get("/accounting/reconciliation/work-items", { params: filters });
  const normalized = mapListResponse(response);

  return {
    ...normalized,
    data: normalized.data.map(mapReconciliationUiFields),
  };
};

export const getReconciliationWorkItemDetail = async (checkoutRequestId) => {
  const response = await api.get(`/accounting/reconciliation/work-items/${checkoutRequestId}`);
  const normalized = mapDetailResponse(response);

  return {
    ...normalized,
    data: normalized.data ? mapReconciliationUiFields(normalized.data) : null,
  };
};

export const previewReconciliation = async (payload) => {
  const response = await api.post("/accounting/reconciliation/preview", payload);
  return mapDetailResponse(response);
};

export const createReconciliationDraft = async (payload) => {
  const response = await api.post("/accounting/reconciliation", payload);
  const normalized = mapDetailResponse(response);

  return {
    ...normalized,
    data: normalized.data ? mapReconciliationUiFields(normalized.data) : null,
  };
};

export const updateReconciliationDraft = async (reconciliationId, payload = {}) => {
  const response = await api.put(`/accounting/reconciliation/${reconciliationId}/draft`, payload);
  const normalized = mapDetailResponse(response);

  return {
    ...normalized,
    data: normalized.data ? mapReconciliationUiFields(normalized.data) : null,
  };
};

export const finalizeReconciliation = async (reconciliationId) => {
  const response = await api.post(`/accounting/reconciliation/${reconciliationId}/finalize`);
  const normalized = mapDetailResponse(response);

  return {
    ...normalized,
    data: normalized.data ? mapReconciliationUiFields(normalized.data) : null,
  };
};

export const createRefundVoucherFromReconciliation = async (reconciliationId, payload = {}) => {
  const response = await api.post(`/accounting/reconciliation/${reconciliationId}/create-refund`, payload);
  return mapDetailResponse(response);
};

export const createAdditionalPaymentVoucherFromReconciliation = async (reconciliationId, payload = {}) => {
  const response = await api.post(`/accounting/reconciliation/${reconciliationId}/create-additional-payment`, payload);
  return mapDetailResponse(response);
};

/**
 * Get reconciliation records
 * Chức năng: lấy danh sách bảng đối soát tài chính để kế toán mở và kiểm tra từng hồ sơ.
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

  return getReconciliationWorkItems(filters);
};

/**
 * Get reconciliation for a specific period
 * Chức năng: lấy chi tiết bảng đối soát để kiểm tra line item khấu trừ và số tiền hoàn/thu thêm.
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
  const normalized = mapDetailResponse(response);

  return {
    ...normalized,
    data: normalized.data ? mapReconciliationUiFields(normalized.data) : null,
  };
};

/**
 * Perform reconciliation
 * Chức năng: tạo mới bảng đối soát tài chính cho hợp đồng đang chuẩn bị thanh lý.
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

  return createReconciliationDraft(reconciliationData);
};

/**
 * Update reconciliation
 * Chức năng: cập nhật trạng thái và chi tiết line item của bảng đối soát hiện có.
 */
export const updateReconciliation = async (reconciliationId, reconciliationData = {}) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const reconciliation = mockReconciliations.find((item) => item.id === reconciliationId);

    if (reconciliation) {
      Object.assign(reconciliation, reconciliationData);
    }

    return {
      success: !!reconciliation,
      data: reconciliation ? mapReconciliationUiFields(reconciliation) : null,
      message: "Cập nhật đối soát thành công",
    };
  }

  return updateReconciliationDraft(reconciliationId, reconciliationData);
};

// ==================== FINANCIAL STATEMENT ====================

/**
 * Get dashboard KPI
 * Chức năng: lấy KPI tổng hợp cho trang dashboard kế toán.
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
 * Chức năng: lấy báo cáo tài chính tổng hợp theo kỳ khi backend hỗ trợ.
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
 * Chức năng: yêu cầu backend sinh báo cáo chuyên biệt khi service reports được bổ sung.
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
 * Chức năng: tạo phiếu đầu kỳ từ hợp đồng đã chọn ở màn lập khoản thu nhận phòng.
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

  const contractId = payload?.contractId;
  if (!contractId) {
    return {
      success: false,
      data: null,
      message: "contractId is required",
    };
  }

  return createInitialBillingInvoice(contractId, payload);
};

/**
 * Send payment reminders
 * Chức năng: gửi nhắc thanh toán cho danh sách hóa đơn khi backend notification sẵn sàng.
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
  getInitialBillingPendingContracts,
  createInitialBillingInvoice,
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
  updateRefund,
  processRefund,
  getTransactions,
  getTransactionDetail,
  resolveTransaction,
  getReconciliationWorkItems,
  getReconciliationWorkItemDetail,
  previewReconciliation,
  createReconciliationDraft,
  updateReconciliationDraft,
  finalizeReconciliation,
  createRefundVoucherFromReconciliation,
  createAdditionalPaymentVoucherFromReconciliation,
  getReconciliations,
  getReconciliationDetail,
  performReconciliation,
  updateReconciliation,
  getDashboardKPI,
  getFinancialStatement,
  generateReport,
  generateInitialBilling,
  sendPaymentReminders,
};
