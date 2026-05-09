const { supabase } = require("../config/supabase");

const TABLE_NAME = "hoa_don";

const InvoiceModel = {
  async listByUserId(userId) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async listByContractId(contractId) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq("ma_hop_dong", contractId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

module.exports = InvoiceModel;
