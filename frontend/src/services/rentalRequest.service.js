import api from "./api";

const RentalRequestService = {
  create(payload) {
    return api.post("/rental-requests", payload);
  },
  getDetail(id) {
    return api.get(`/rental-requests/${id}`);
  },
  getList() {
    return api.get("/rental-requests");
  },
  getMyRequests() {
    return api.get("/rental-requests/my");
  },
};

export default RentalRequestService;
