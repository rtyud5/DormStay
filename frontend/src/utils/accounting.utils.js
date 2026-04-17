/**
 * Utility Functions cho Module Kế Toán
 * Format tiền, ngày, tính hoàn cọc, tính lãi suất
 */

// ==================== FORMAT FUNCTIONS ====================

/**
 * Format currency to Vietnamese Dong
 * @param {number} amount
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "₫0";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format number to string with commas
 * @param {number} num
 * @returns {string}
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  return new Intl.NumberFormat("vi-VN").format(num);
};

/**
 * Format date to Vietnamese format (DD/MM/YYYY)
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return "--/--/----";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format date to Vietnamese format (DD/MM/YYYY HH:MM)
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  if (!date) return "--/--/---- --:--";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Format month-year
 * @param {string|Date} date
 * @returns {string} MM/YYYY
 */
export const formatMonthYear = (date) => {
  if (!date) return "MM/YYYY";
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${year}`;
};

/**
 * Get daylight difference between two dates
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {number} Number of days
 */
export const getDaysDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Get month difference between two dates
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {number} Number of months
 */
export const getMonthsDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let months = (end.getFullYear() - start.getFullYear()) * 12;
  months += end.getMonth() - start.getMonth();
  return months + 1; // Include both start and end months
};

// ==================== DEPOSIT CALCULATION ====================

/**
 * Calculate security deposit
 * Formula: 2 months rent × number of beds/rooms
 * @param {number} monthlyRent
 * @param {number} quantity Default 1
 * @returns {number}
 */
export const calculateDeposit = (monthlyRent, quantity = 1) => {
  return monthlyRent * 2 * quantity;
};

/**
 * Calculate refund amount based on reason and deductions
 * @param {number} originalDeposit
 * @param {number} deductedAmount
 * @param {string} refundReason - NO_CONTRACT, EARLY_SHORT, EARLY_LONG, NORMAL
 * @returns {object} { refundRatio, refundAmount }
 */
export const calculateRefund = (originalDeposit, deductedAmount = 0, refundReason = "NORMAL_COMPLETION") => {
  const refundRatios = {
    NO_CONTRACT: 0.8, // 80%
    EARLY_TERMINATION_SHORT_STAY: 0.5, // 50% (< 6 months)
    EARLY_TERMINATION_LONG_STAY: 0.7, // 70% (6+ months)
    NORMAL_COMPLETION: 1.0, // 100%
  };

  const ratio = refundRatios[refundReason] || 1.0;
  const refundAmount = originalDeposit * ratio - deductedAmount;

  return {
    refundRatio: Math.round(ratio * 100),
    refundAmount: Math.max(0, refundAmount), // No negative refunds
  };
};

/**
 * Calculate pro-rated rent
 * @param {number} monthlyRent
 * @param {number} daysStayed
 * @returns {object} { dailyRate, proratedAmount }
 */
export const calculateProratedRent = (monthlyRent, daysStayed) => {
  const dailyRate = monthlyRent / 30; // Assume 30 days per month
  const proratedAmount = dailyRate * daysStayed;

  return {
    dailyRate: Math.round(dailyRate),
    daysStayed,
    proratedAmount: Math.round(proratedAmount),
  };
};

// ==================== INVOICE CALCULATION ====================

/**
 * Calculate total invoice amount from billing details
 * @param {array} billingDetails
 * @returns {number}
 */
export const calculateInvoiceTotal = (billingDetails) => {
  return billingDetails.reduce((sum, detail) => sum + (detail.amount || 0), 0);
};

/**
 * Calculate balance due for invoice
 * @param {number} totalAmount
 * @param {number} totalReceived
 * @returns {number}
 */
export const calculateBalanceDue = (totalAmount, totalReceived = 0) => {
  return Math.max(0, totalAmount - totalReceived);
};

/**
 * Calculate payment percentage
 * @param {number} totalReceived
 * @param {number} totalAmount
 * @returns {number} Percentage (0-100)
 */
export const calculatePaymentPercentage = (totalReceived, totalAmount) => {
  if (totalAmount === 0) return 0;
  return Math.round((totalReceived / totalAmount) * 100);
};

// ==================== FINANCIAL STATEMENT ====================

/**
 * Calculate total revenue for period
 * @param {array} invoices
 * @returns {number}
 */
export const calculateTotalRevenue = (invoices) => {
  return invoices.reduce((sum, invoice) => {
    if (invoice.status === "COMPLETED" || invoice.status === "MATCHED") {
      return sum + (invoice.amount || 0);
    }
    return sum;
  }, 0);
};

/**
 * Calculate revenue by category
 * @param {array} billingDetails
 * @returns {object}
 */
export const calculateRevenueByCategory = (billingDetails) => {
  const categories = {};

  billingDetails.forEach((detail) => {
    const category = detail.category || "OTHER";
    if (!categories[category]) {
      categories[category] = 0;
    }
    categories[category] += detail.amount || 0;
  });

  return categories;
};

/**
 * Calculate collection rate
 * @param {number} collected
 * @param {number} total
 * @returns {number} Percentage (0-100)
 */
export const calculateCollectionRate = (collected, total) => {
  if (total === 0) return 0;
  return Math.round((collected / total) * 100);
};

// ==================== VARIANCE & RECONCILIATION ====================

/**
 * Calculate variance between two amounts
 * @param {number} expectedAmount
 * @param {number} actualAmount
 * @returns {object} { variance, status, description }
 */
export const calculateVariance = (expectedAmount, actualAmount) => {
  const variance = actualAmount - expectedAmount;

  return {
    variance,
    status: variance === 0 ? "MATCHED" : "MISMATCH",
    description:
      variance === 0 ? "Khớp hoàn toàn" : variance > 0 ? `Thừa ₫${Math.abs(variance)}` : `Thiếu ₫${Math.abs(variance)}`,
    shortStatus: variance === 0 ? "Khớp" : variance > 0 ? "Thừa" : "Thiếu",
  };
};

/**
 * Check if dates are the same day
 * @param {Date|string} date1
 * @param {Date|string} date2
 * @returns {boolean}
 */
export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};

/**
 * Check if invoice is overdue
 * @param {Date|string} dueDate
 * @param {Date|string} compareDate Defaults to today
 * @returns {boolean}
 */
export const isOverdue = (dueDate, compareDate = new Date()) => {
  const due = new Date(dueDate);
  const compare = new Date(compareDate);
  return due < compare;
};

/**
 * Get days until due
 * @param {Date|string} dueDate
 * @returns {number} Days remaining (negative if overdue)
 */
export const getDaysUntilDue = (dueDate) => {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// ==================== GENERATE Report ====================

/**
 * Generate financial summary for period
 * @param {array} invoices
 * @param {array} payments
 * @returns {object}
 */
export const generateFinancialSummary = (invoices = [], payments = []) => {
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalPaid = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);

  return {
    totalInvoiced,
    totalPaid,
    outstanding: totalInvoiced - totalPaid,
    collectionRate: calculateCollectionRate(totalPaid, totalInvoiced),
  };
};

/**
 * Generate status breakdown
 * @param {array} items Array with 'status' field
 * @returns {object}
 */
export const generateStatusBreakdown = (items = []) => {
  const breakdown = {};

  items.forEach((item) => {
    const status = item.status || "UNKNOWN";
    breakdown[status] = (breakdown[status] || 0) + 1;
  });

  return breakdown;
};

// ==================== VALIDATION ====================

/**
 * Validate invoice data
 * @param {object} invoice
 * @returns {object} { isValid, errors }
 */
export const validateInvoice = (invoice) => {
  const errors = [];

  if (!invoice.contractId) errors.push("Không có mã hợp đồng");
  if (!invoice.amount || invoice.amount <= 0) errors.push("Số tiền không hợp lệ");
  if (!invoice.dueDate) errors.push("Không có ngày hạn");
  if (!invoice.status) errors.push("Không có trạng thái");

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate payment data
 * @param {object} payment
 * @returns {object} { isValid, errors }
 */
export const validatePayment = (payment) => {
  const errors = [];

  if (!payment.invoiceId) errors.push("Không có mã hóa đơn");
  if (!payment.amount || payment.amount <= 0) errors.push("Số tiền không hợp lệ");
  if (!payment.paymentMethod) errors.push("Không có phương thức thanh toán");

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate refund data
 * @param {object} refund
 * @returns {object} { isValid, errors }
 */
export const validateRefund = (refund) => {
  const errors = [];

  if (!refund.contractId) errors.push("Không có mã hợp đồng");
  if (!refund.originalDeposit || refund.originalDeposit <= 0) errors.push("Tiền cọc gốc không hợp lệ");
  if (refund.deductedAmount < 0) errors.push("Tiền khấu trừ không hợp lệ");
  if (!refund.reason) errors.push("Không có lý do hoàn cọc");

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  formatMonthYear,
  getDaysDifference,
  getMonthsDifference,
  calculateDeposit,
  calculateRefund,
  calculateProratedRent,
  calculateInvoiceTotal,
  calculateBalanceDue,
  calculatePaymentPercentage,
  calculateTotalRevenue,
  calculateRevenueByCategory,
  calculateCollectionRate,
  calculateVariance,
  isSameDay,
  isOverdue,
  getDaysUntilDue,
  generateFinancialSummary,
  generateStatusBreakdown,
  validateInvoice,
  validatePayment,
  validateRefund,
};
