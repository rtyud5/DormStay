// backend/src/routes/auth.routes.js
const express = require("express");
const AuthController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const router = express.Router();

// Public
router.post("/login", validate(["email", "password"]), AuthController.login);
router.post("/register", validate(["fullName", "email", "phone", "password"]), AuthController.register);

// Cần đăng nhập
router.get("/me", authMiddleware, AuthController.me);
// Temporarily comment put /me to fix crash (add back after controller fix)
// router.put("/me", authMiddleware, AuthController.updateMe);

// Chỉ QUAN_LY — tạo tài khoản nhân viên
router.post(
  "/staff",
  authMiddleware,
  requireRole(["QUAN_LY"]),
  validate(["fullName", "email", "password", "vai_tro"]),
  AuthController.createStaff,
);

module.exports = router;
