const { supabase } = require("../config/supabase");

const TABLE_NAME = "ho_so";

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

  async update(id, payload) {
    if (!supabase) return { id, ...payload };
    
    console.log("Supabase upserting profile for ID:", id, "with data:", payload);
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .upsert({ 
         ...payload, 
         ma_nguoi_dung_xac_thuc: id,
         updated_at: new Date().toISOString() 
      }, { onConflict: 'ma_nguoi_dung_xac_thuc' })
      .select("*")
      .single();
      
    if (error) {
      console.error("Supabase upsert error:", error);
      throw error;
    }
    
    return data;
  },
};

module.exports = UserModel;
