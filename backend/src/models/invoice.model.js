const { supabase } = require("../config/supabase");

const TABLE_NAME = "invoices";

const InvoiceModel = {
  async list() {
    if (!supabase) {
      return [
        { id: "invoice-001", contract_id: "contract-001", amount: 5200000, status: "pending" },
        { id: "invoice-002", contract_id: "contract-001", amount: 3500000, status: "paid" },
      ];
    }

    const { data, error } = await supabase.from(TABLE_NAME).select("*");
    if (error) throw error;
    return data || [];
  },
};

module.exports = InvoiceModel;
