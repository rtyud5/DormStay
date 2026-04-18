const ACCOUNTANT_ROLE = "KE_TOAN";
const MANAGER_ROLE = "QUAN_LY";

export function canAccessAccounting(role) {
  return String(role || "").toUpperCase() === ACCOUNTANT_ROLE;
}

export function canAccessManager(role) {
  return String(role || "").toUpperCase() === MANAGER_ROLE;
}

export function getDefaultRouteByRole(role) {
  const normalized = String(role || "").toUpperCase();
  if (normalized === ACCOUNTANT_ROLE) return "/accounting/dashboard";
  if (normalized === MANAGER_ROLE) return "/manager/dashboard";
  return "/dashboard";
}
