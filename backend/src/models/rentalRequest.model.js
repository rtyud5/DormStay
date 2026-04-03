const supabase = require("../config/supabase");
const { createRequestCode } = require("../utils/helpers");

const TABLE_NAME = "rental_requests";

const RentalRequestModel = {
  async list() {
    if (!supabase) {
      return [
        { id: "request-001", request_code: "REQ-001", status: "submitted", room_id: "room-101" },
      ];
    }

    const { data, error } = await supabase.from(TABLE_NAME).select("*");
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    if (!supabase) {
      return { id, request_code: "REQ-001", status: "deposit_pending", room_id: "room-101" };
    }

    const { data, error } = await supabase.from(TABLE_NAME).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const enrichedPayload = {
      request_code: createRequestCode(),
      status: "submitted",
      ...payload,
    };

    if (!supabase) {
      return { id: `request-${Date.now()}`, ...enrichedPayload };
    }

    const { data, error } = await supabase.from(TABLE_NAME).insert(enrichedPayload).select("*").single();
    if (error) throw error;
    return data;
  },
};

module.exports = RentalRequestModel;
