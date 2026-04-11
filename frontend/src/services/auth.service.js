import { supabase } from "../lib/supabase";
import api from "./api";

const AuthService = {
  /**
   * Đăng nhập qua backend để nhận token + user có `vai_tro` từ bảng `ho_so`
   * (đồng bộ với GuestRoute / chuyển hướng theo role).
   */
  async login(payload) {
    const { data: body } = await api.post("/auth/login", {
      email: payload.email?.trim(),
      password: payload.password,
    });
    if (!body?.success) {
      const err = new Error(body?.message || "Đăng nhập thất bại");
      err.response = { data: body };
      throw err;
    }
    return body.data;
  },

  async register(payload) {
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName,
          phone: payload.phone,
          cccd: payload.cccd,
          dob: payload.dob,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async verifyOtp(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },
};

export default AuthService;
