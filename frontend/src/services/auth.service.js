import api from "./api";

const AuthService = {
  login(payload) {
    return api.post("/auth/login", payload);
  },
  register(payload) {
    return api.post("/auth/register", payload);
  },
  getMe() {
    return api.get("/auth/me");
  },
};

export default AuthService;
