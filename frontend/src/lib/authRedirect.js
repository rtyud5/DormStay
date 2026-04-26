const ACCOUNTANT_ROLE = "KE_TOAN";
const MANAGER_ROLE = "QUAN_LY";
const SALE_ROLE = "SALE";

export function canAccessAccounting(role) {
  return String(role || "").toUpperCase() === ACCOUNTANT_ROLE;
}

export function canAccessManager(role) {
  return String(role || "").toUpperCase() === MANAGER_ROLE;
}

export function canAccessSale(role) {
  return String(role || "").toUpperCase() === SALE_ROLE;
}

export function getDefaultRouteByRole(role) {
  const normalized = String(role || "").toUpperCase();
  if (normalized === ACCOUNTANT_ROLE) return "/accounting/dashboard";
  if (normalized === MANAGER_ROLE) return "/manager/dashboard";
  if (normalized === SALE_ROLE) return "/sale/dashboard";
  return "/dashboard";
}
