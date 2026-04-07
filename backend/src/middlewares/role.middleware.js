// backend/src/middlewares/role.middleware.js

/**
 * Danh sách vai trò hợp lệ trong hệ thống
 *
 * KHACH_HANG  - Khách thuê phòng
 * NHAN_VIEN   - Nhân viên sale / vận hành
 * KE_TOAN     - Nhân viên kế toán (Financial Ops)
 * QUAN_LY     - Quản lý cấp cao (full access)
 */
const VALID_ROLES = ["KHACH_HANG", "NHAN_VIEN", "KE_TOAN", "QUAN_LY"];

/**
 * Middleware kiểm tra vai trò
 * Phải dùng SAU authMiddleware
 *
 * @param {string[]} allowedRoles
 * @example
 *   router.get('/', authMiddleware, requireRole(['KE_TOAN', 'QUAN_LY']), controller)
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Chưa xác thực. Vui lòng đăng nhập.",
      });
    }

    if (!allowedRoles.includes(req.user.vai_tro)) {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
        message: `Bạn không có quyền thực hiện thao tác này.`,
        required_roles: allowedRoles,
        your_role: req.user.vai_tro,
      });
    }

    return next();
  };
}

module.exports = { requireRole, VALID_ROLES };
