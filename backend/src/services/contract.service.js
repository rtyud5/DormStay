const ContractModel = require("../models/contract.model");
const InvoiceModel = require("../models/invoice.model");

const ContractService = {
  async getList(userId) {
    return ContractModel.listByUserId(userId);
  },

  async getDetail(id, userId) {
    const contract = await ContractModel.getById(id);
    if (!contract) return null;

    // Check if the contract belongs to the user (optional check here since model should handle it)
    const invoices = await InvoiceModel.listByUserId(userId);

    return {
      ...contract,
      invoices: invoices.filter((item) => item.ma_hop_dong === id),
    };
  },
};

module.exports = ContractService;
