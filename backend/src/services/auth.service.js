const UserModel = require("../models/user.model");

const AuthService = {
  async login(payload) {
    const user = {
      id: "demo-user-001",
      email: payload.email,
      fullName: "Demo Customer",
      role: "customer",
    };

    return {
      token: "demo-token-123456",
      user,
    };
  },

  async register(payload) {
    const user = await UserModel.create({
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone,
    });

    return user;
  },

  async getMe(reqUser) {
    return {
      id: reqUser.id,
      email: reqUser.email,
      fullName: reqUser.profile?.full_name || "Unknown",
      role: reqUser.role,
      phone: reqUser.profile?.phone || "",
    };
  },
};

module.exports = AuthService;
