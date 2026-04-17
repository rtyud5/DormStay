const ACCOUNTANT_ROLE = "KE_TOAN";

export function canAccessAccounting(role) {
  return String(role || "").toUpperCase() === ACCOUNTANT_ROLE;
}

export function getDefaultRouteByRole(role) {
  if (String(role || "").toUpperCase() === ACCOUNTANT_ROLE) {
    return "/accounting/dashboard";
  }

  return "/dashboard";
}
