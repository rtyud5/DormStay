const ContractModel = require("../models/contract.model");
const InvoiceModel = require("../models/invoice.model");

const ContractService = {
  async getList() {
    return ContractModel.list();
  },

  async getDetail(id) {
    const contract = await ContractModel.getById(id);
    const invoices = await InvoiceModel.list();

    return {
      ...contract,
      invoices: invoices.filter((item) => item.contract_id === id),
    };
  },
};

module.exports = ContractService;
