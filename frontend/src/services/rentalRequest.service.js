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
  savePayOSInfo(maYeuCauThue, payOSData) {
    return api.post("/rental-requests/save-payos-info", {
      maYeuCauThue,
      ...payOSData
    });
  },
};

export default RentalRequestService;
