import api from "./api";

const ProfileService = {
  async updateMe(payload) {
    const res = await api.put("/auth/me", payload);
    return res.data;
  },

  async getMe() {
    const res = await api.get("/auth/me");
    return res.data;
  }
};

export default ProfileService;
