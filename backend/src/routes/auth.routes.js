const express = require("express");
const AuthController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/login", validate(["email", "password"]), AuthController.login);
router.post("/register", validate(["fullName", "email", "phone", "password"]), AuthController.register);
router.get("/me", authMiddleware, AuthController.me);

module.exports = router;
