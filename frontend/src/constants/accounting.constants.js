/**
 * Constants cho Module Kế Toán
 * Routes, API paths, status maps, enums
 */

import {
  LayoutDashboard,
  FileText,
  Receipt,
  PenTool,
  PlusSquare,
  Undo2,
  Search,
  Scale
} from "lucide-react";

// ==================== ROUTES ====================
export const ACCOUNTING_ROUTES = {
  DASHBOARD: "/accounting/dashboard",
  INVOICES: "/accounting/invoices",
  CONTRACTS: "/accounting/contracts",
  BILLING: "/accounting/billing",
  EXTRA_INVOICES: "/accounting/extra-invoices",
  REFUNDS: "/accounting/refunds",
  TRANSACTIONS: "/accounting/transactions",
  RECONCILIATION: "/accounting/reconciliation",
};

// ==================== API PATHS ====================
export const ACCOUNTING_API = {
  BASE: "/api/accounting",
  CONTRACTS: "/api/accounting/contracts",
  INVOICES: "/api/accounting/invoices",
  PAYMENTS: "/api/accounting/payments",
  REFUNDS: "/api/accounting/refunds",
  RECONCILIATION: "/api/accounting/reconciliation",
  TRANSACTIONS: "/api/accounting/transactions",
  STATEMENT: "/api/accounting/statement",
  DASHBOARD: "/api/accounting/dashboard",
  BILLING: "/api/accounting/billing",
  EXTRA_CHARGES: "/api/accounting/extra-charges",
};

// ==================== STATUS MAPS ====================

// Contract Status
export const CONTRACT_STATUS = {
  PROCESSING: {
    label: "Đang xử lý",
    color: "bg-blue-100",
    textColor: "text-blue-700",
    badgeColor: "bg-blue-500",
  },
  ACTIVE: {
    label: "Hiệu lực",
    color: "bg-green-100",
    textColor: "text-green-700",
    badgeColor: "bg-green-500",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "bg-gray-100",
    textColor: "text-gray-700",
    badgeColor: "bg-gray-500",
  },
  TERMINATED: {
    label: "Đã chấm dứt",
    color: "bg-red-100",
    textColor: "text-red-700",
    badgeColor: "bg-red-500",
  },
};

// Invoice Status
export const INVOICE_STATUS = {
  PENDING: {
    label: "Chờ thanh toán",
    color: "bg-blue-100",
    textColor: "text-blue-700",
    badgeColor: "bg-blue-500",
  },
  COMPLETED: {
    label: "Đã thanh toán",
    color: "bg-green-100",
    textColor: "text-green-700",
    badgeColor: "bg-green-500",
  },
  OVERDUE: {
    label: "Quá hạn",
    color: "bg-red-100",
    textColor: "text-red-700",
    badgeColor: "bg-red-500",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-gray-100",
    textColor: "text-gray-700",
    badgeColor: "bg-gray-500",
  },
};

// Invoice Type
export const INVOICE_TYPE = {
  DEPOSIT: {
    label: "Phiếu cọc",
    color: "#FFB21E",
  },
  MONTHLY_RENT: {
    label: "Tiền thuê hàng tháng",
    color: "#3B82F6",
  },
  EXTRA: {
    label: "Phí phát sinh",
    color: "#EF4444",
  },
  FINAL: {
    label: "Phiếu cuối",
    color: "#8B5CF6",
  },
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100",
    textColor: "text-yellow-700",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "bg-green-100",
    textColor: "text-green-700",
  },
  FAILED: {
    label: "Thất bại",
    color: "bg-red-100",
    textColor: "text-red-700",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-gray-100",
    textColor: "text-gray-700",
  },
};

// Payment Method
export const PAYMENT_METHOD = {
  CASH: { label: "Tiền mặt", icon: "💵" },
  BANK_TRANSFER: { label: "Chuyển khoản", icon: "🏦" },
  MOMO: { label: "MoMo", icon: "📱" },
  ZALOPAY: { label: "ZaloPay", icon: "📱" },
};

// Refund Status
export const REFUND_STATUS = {
  PENDING: {
    label: "Chờ xử lý",
    color: "bg-yellow-100",
    textColor: "text-yellow-700",
  },
  PROCESSING: {
    label: "Đang xử lý",
    color: "bg-blue-100",
    textColor: "text-blue-700",
  },
  COMPLETED: {
    label: "Hoàn tất",
    color: "bg-green-100",
    textColor: "text-green-700",
  },
  FAILED: {
    label: "Thất bại",
    color: "bg-red-100",
    textColor: "text-red-700",
  },
};

// Reconciliation Status
export const RECONCILIATION_STATUS = {
  MATCHED: {
    label: "Khớp",
    color: "bg-green-100",
    textColor: "text-green-700",
    icon: "✓",
  },
  MISMATCH: {
    label: "Không khớp",
    color: "bg-red-100",
    textColor: "text-red-700",
    icon: "✕",
  },
  PENDING: {
    label: "Chờ xử lý",
    color: "bg-yellow-100",
    textColor: "text-yellow-700",
    icon: "⧖",
  },
};

// Transaction Status
export const TRANSACTION_STATUS = {
  SUCCESS: {
    label: "Thành công",
    color: "bg-green-100",
    textColor: "text-green-700",
  },
  FAILED: {
    label: "Thất bại",
    color: "bg-red-100",
    textColor: "text-red-700",
  },
  PENDING: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100",
    textColor: "text-yellow-700",
  },
  MISMATCH: {
    label: "Không khớp",
    color: "bg-orange-100",
    textColor: "text-orange-700",
  },
};

// Transaction Match Status
export const TRANSACTION_MATCH = {
  MATCHED: { label: "Khớp", color: "bg-green-100" },
  UNMATCHED: { label: "Không khớp", color: "bg-red-100" },
  SCANNING: { label: "Đang quét", color: "bg-yellow-100" },
};

// Refund Reason
export const REFUND_REASON = {
  NO_CONTRACT: { label: "Chưa ký HĐ", ratio: 80 },
  EARLY_TERMINATION_SHORT_STAY: { label: "Trả sớm, ở < 6 tháng", ratio: 50 },
  EARLY_TERMINATION_LONG_STAY: { label: "Trả sớm, ở 6+ tháng", ratio: 70 },
  NORMAL_COMPLETION: { label: "Hết hạn HĐ", ratio: 100 },
};

// Charge Category
export const CHARGE_CATEGORY = {
  RENT: { label: "Tiền thuê", color: "#3B82F6" },
  DEPOSIT: { label: "Tiền cọc", color: "#FFB21E" },
  UTILITY: { label: "Tiền tiện ích", color: "#10B981" },
  SERVICE: { label: "Dịch vụ", color: "#8B5CF6" },
  PENALTY: { label: "Phạt vi phạm", color: "#EF4444" },
  OTHER: { label: "Khác", color: "#6B7280" },
};

// Menu Items cho Sidebar
export const ACCOUNTING_MENU = [
  {
    id: 1,
    label: "Dashboard",
    icon: LayoutDashboard,
    path: ACCOUNTING_ROUTES.DASHBOARD,
  },
  {
    id: 2,
    label: "Hợp đồng",
    icon: FileText,
    path: ACCOUNTING_ROUTES.CONTRACTS,
    badge: 23, // Contracts needing billing
  },
  {
    id: 3,
    label: "Phiếu thu",
    icon: Receipt,
    path: ACCOUNTING_ROUTES.INVOICES,
  },
  {
    id: 4,
    label: "Lập phiếu",
    icon: PenTool,
    path: ACCOUNTING_ROUTES.BILLING,
  },
  {
    id: 5,
    label: "Phiếu phát sinh",
    icon: PlusSquare,
    path: ACCOUNTING_ROUTES.EXTRA_INVOICES,
  },
  {
    id: 6,
    label: "Phiếu hoàn cọc",
    icon: Undo2,
    path: ACCOUNTING_ROUTES.REFUNDS,
  },
  {
    id: 7,
    label: "Tra soát giao dịch",
    icon: Search,
    path: ACCOUNTING_ROUTES.TRANSACTIONS,
  },
  {
    id: 8,
    label: "Đối soát tài chính",
    icon: Scale,
    path: ACCOUNTING_ROUTES.RECONCILIATION,
  },
];

// Filter Options
export const INVOICE_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "PENDING", label: "Chờ thanh toán" },
  { value: "COMPLETED", label: "Đã thanh toán" },
  { value: "OVERDUE", label: "Quá hạn" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export const CONTRACT_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "ACTIVE", label: "Hiệu lực" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "TERMINATED", label: "Đã chấm dứt" },
];

export const REFUND_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "FAILED", label: "Thất bại" },
];

// Rental Type Options
export const RENTAL_TYPE_OPTIONS = [
  { value: "studio", label: "Studio" },
  { value: "single", label: "Phòng đơn" },
  { value: "shared_2", label: "Ghép 2 người" },
  { value: "shared_3", label: "Ghép 3 người" },
  { value: "shared_4", label: "Ghép 4 người" },
];

// Floor/Zone Options
export const FLOOR_ZONE_OPTIONS = [
  { value: "1", label: "Tầng 1" },
  { value: "2", label: "Tầng 2" },
  { value: "3", label: "Tầng 3" },
  { value: "4", label: "Tầng 4" },
  { value: "all", label: "Tất cả tầng" },
];

// Date Range Options
export const DATE_RANGE_OPTIONS = [
  { value: "today", label: "Hôm nay" },
  { value: "this_month", label: "Tháng này" },
  { value: "last_month", label: "Tháng trước" },
  { value: "this_quarter", label: "Quý này" },
  { value: "this_year", label: "Năm này" },
  { value: "custom", label: "Tùy chỉnh" },
];

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_OPTIONS: [10, 20, 50, 100],
};

export default {
  ACCOUNTING_ROUTES,
  ACCOUNTING_API,
  CONTRACT_STATUS,
  INVOICE_STATUS,
  INVOICE_TYPE,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  REFUND_STATUS,
  RECONCILIATION_STATUS,
  TRANSACTION_STATUS,
  TRANSACTION_MATCH,
  REFUND_REASON,
  CHARGE_CATEGORY,
  ACCOUNTING_MENU,
  INVOICE_FILTERS,
  CONTRACT_FILTERS,
  REFUND_FILTERS,
  RENTAL_TYPE_OPTIONS,
  FLOOR_ZONE_OPTIONS,
  DATE_RANGE_OPTIONS,
  PAGINATION,
};
