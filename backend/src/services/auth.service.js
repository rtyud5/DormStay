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

  async getMe() {
    return {
      id: "demo-user-001",
      email: "customer@example.com",
      fullName: "Demo Customer",
      role: "customer",
    };
  },
};

module.exports = AuthService;
