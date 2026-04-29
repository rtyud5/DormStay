const { AppError } = require("../utils/errors");
const { hasAnyRole } = require("../utils/roleUtils");

const MANAGER_ACCESS_ROLES = ["ADMIN", "NHAN_VIEN", "QUAN_LY"];

function requireManagerAccess(req, res, next) {
  if (!req.user || !hasAnyRole(req.user.role, MANAGER_ACCESS_ROLES)) {
    return next(new AppError("Forbidden - manager access required", 403));
  }

  return next();
}

module.exports = {
  requireManagerAccess,
};
