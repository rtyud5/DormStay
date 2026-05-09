import api from "./api";

const ContractService = {
  getList() {
    return api.get("/contracts");
  },
  getDetail(id) {
    return api.get(`/contracts/${id}`);
  },
  getInvoices(id) {
    return api.get(`/contracts/${id}/invoices`);
  },
};

export default ContractService;
