// 🔐 Only ADMIN and KE_TOAN (accounting staff) can access accounting APIs
// NHAN_VIEN (sales/manager) should NOT access sensitive financial data
const ACCOUNTING_ACCESS_ROLES = ["ADMIN", "KE_TOAN"];

const ROLE_ALIASES = {
  customer: "KHACH_HANG",
  khach_hang: "KHACH_HANG",
  user: "KHACH_HANG",
  staff: "NHAN_VIEN",
  employee: "NHAN_VIEN",
  nhan_vien: "NHAN_VIEN",
  admin: "ADMIN",
  accounting: "KE_TOAN",
  accountant: "KE_TOAN",
  ke_toan: "KE_TOAN",
  sale: "SALE",
  nhan_vien_sale: "SALE",
};

function normalizeRole(role = "") {
  const normalized = String(role || "").trim();
  if (!normalized) return "KHACH_HANG";

  const lowerCaseRole = normalized.toLowerCase();
  return ROLE_ALIASES[lowerCaseRole] || normalized.toUpperCase();
}

function hasAnyRole(role, allowedRoles = []) {
  const normalizedRole = normalizeRole(role);
  return allowedRoles.map(normalizeRole).includes(normalizedRole);
}

module.exports = {
  ACCOUNTING_ACCESS_ROLES,
  normalizeRole,
  hasAnyRole,
};
