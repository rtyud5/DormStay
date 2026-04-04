const { supabase } = require("../config/supabase");

const TABLE_NAME = "payments";

const PaymentModel = {
  async list() {
    if (!supabase) {
      return [
        { id: "payment-001", invoice_id: "invoice-001", amount: 5200000, status: "success" },
      ];
    }

    const { data, error } = await supabase.from(TABLE_NAME).select("*");
    if (error) throw error;
    return data || [];
  },

  async create(payload) {
    const enrichedPayload = {
      status: "success",
      paid_at: new Date().toISOString(),
      ...payload,
    };

    if (!supabase) {
      return { id: `payment-${Date.now()}`, ...enrichedPayload };
    }

    const { data, error } = await supabase.from(TABLE_NAME).insert(enrichedPayload).select("*").single();
    if (error) throw error;
    return data;
  },
};

module.exports = PaymentModel;
