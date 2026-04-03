const supabase = require("../config/supabase");

const TABLE_NAME = "rooms";

const RoomModel = {
  async list() {
    if (!supabase) {
      return [
        { id: "room-101", name: "Phong 101", price: 3500000, type: "studio", status: "available" },
        { id: "room-201", name: "Phong 201", price: 1800000, type: "dorm", status: "available" },
      ];
    }

    const { data, error } = await supabase.from(TABLE_NAME).select("*");
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    if (!supabase) {
      return { id, name: `Phong ${id}`, price: 3500000, type: "studio", status: "available" };
    }

    const { data, error } = await supabase.from(TABLE_NAME).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },
};

module.exports = RoomModel;
