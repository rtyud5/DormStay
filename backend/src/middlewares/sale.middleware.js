const { AppError } = require("../utils/errors");
const { hasAnyRole } = require("../utils/roleUtils");

// Định nghĩa các role được quyền truy cập module Sale
const SALE_ACCESS_ROLES = ["ADMIN", "NHAN_VIEN", "SALE"]; 

function requireSaleAccess(req, res, next) {
  if (!req.user || !hasAnyRole(req.user.role, SALE_ACCESS_ROLES)) {
    return next(new AppError("Forbidden - Cần quyền truy cập phân hệ Sale", 403));
  }
  return next();
}

module.exports = {
  requireSaleAccess,
};