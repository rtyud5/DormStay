// frontend/src/lib/constants.js
export const APP_NAME = "DormiCare";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  rooms: "/rooms",
  roomDetail: "/rooms/:id",
  rentalRequest: "/rental-requests/new",
  requestDetail: "/rental-requests/:id",
  contracts: "/contracts",
  contractDetail: "/contracts/:id",
  // ✅ THÊM: Routes kế toán
  invoices: "/ke-toan/phieu-thu",
  pendingContracts: "/ke-toan/hop-dong-cho-lap",
  reconciliation: "/ke-toan/doi-soat",
  refund: "/ke-toan/hoan-coc",
};

export const STORAGE_KEYS = {
  token: "dormstay_token",
  user: "dormstay_user",
};

export const REQUEST_STATUS = {
  submitted: "submitted",
  reviewing: "reviewing",
  approved: "approved",
  rejected: "rejected",
  depositPending: "deposit_pending",
  depositPaid: "deposit_paid",
};

// ✅ THÊM: Phân quyền vai trò
export const ROLES = {
  KHACH_HANG: "KHACH_HANG",
  NHAN_VIEN: "NHAN_VIEN", // Sale / vận hành
  KE_TOAN: "KE_TOAN", // Kế toán (Financial Operations)
  QUAN_LY: "QUAN_LY", // Quản lý (full access)
};

// Nhóm có quyền truy cập Financial Ops
export const KE_TOAN_ROLES = [ROLES.KE_TOAN, ROLES.QUAN_LY];

// Tất cả nhân viên nội bộ
export const STAFF_ROLES = [ROLES.NHAN_VIEN, ROLES.KE_TOAN, ROLES.QUAN_LY];
