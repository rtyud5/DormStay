import api from "./api";

const ContractService = {
  getList() {
    return api.get("/contracts");
  },
  getDetail(id) {
    return api.get(`/contracts/${id}`);
  },
};

export default ContractService;
