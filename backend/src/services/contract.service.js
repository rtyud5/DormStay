const ContractModel = require("../models/contract.model");
const InvoiceModel = require("../models/invoice.model");

const ContractService = {
  async getList(userId) {
    return ContractModel.listByUserId(userId);
  },

  async getDetail(id, userId) {
    const contract = await ContractModel.getById(id);
    if (!contract || contract.ho_so?.ma_nguoi_dung_xac_thuc !== userId) return null;

    const invoices = await InvoiceModel.listByContractId(id, userId);

    return {
      ...contract,
      invoices,
    };
  },

  async getInvoices(contractId, userId) {
    return InvoiceModel.listByContractId(contractId);
  },
};

module.exports = ContractService;
