const supabase = require("../config/supabase");

const TABLE_NAME = "contracts";

const ContractModel = {
  async list() {
    if (!supabase) {
      return [
        { id: "contract-001", code: "HD-001", status: "active", room_id: "room-101" },
      ];
    }

    const { data, error } = await supabase.from(TABLE_NAME).select("*");
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    if (!supabase) {
      return { id, code: "HD-001", status: "active", room_id: "room-101", deposit_amount: 2000000 };
    }

    const { data, error } = await supabase.from(TABLE_NAME).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },
};

module.exports = ContractModel;
