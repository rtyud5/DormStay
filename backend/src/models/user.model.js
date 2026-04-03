const supabase = require("../config/supabase");

const TABLE_NAME = "users";

const UserModel = {
  async list() {
    if (!supabase) return [];
    const { data, error } = await supabase.from(TABLE_NAME).select("*");
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    if (!supabase) return null;
    const { data, error } = await supabase.from(TABLE_NAME).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async getByEmail(email) {
    if (!supabase) return null;
    const { data, error } = await supabase.from(TABLE_NAME).select("*").eq("email", email).maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    if (!supabase) return { id: "demo-user-001", ...payload };
    const { data, error } = await supabase.from(TABLE_NAME).insert(payload).select("*").single();
    if (error) throw error;
    return data;
  },
};

module.exports = UserModel;
