const { AppError } = require("../utils/errors");
const { ACCOUNTING_ACCESS_ROLES, hasAnyRole } = require("../utils/roleUtils");

function requireAccountingAccess(req, res, next) {
  if (!req.user || !hasAnyRole(req.user.role, ACCOUNTING_ACCESS_ROLES)) {
    return next(new AppError("Forbidden - accounting access required", 403));
  }

  return next();
}

module.exports = {
  requireAccountingAccess,
};
