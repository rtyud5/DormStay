import api from "./api";

const unwrapListResponse = (response) => {
  const payload = response?.data?.data ?? {};
  return {
    success: response?.data?.success ?? false,
    data: payload.items || [],
    total: payload.total || 0,
    message: response?.data?.message || "",
  };
};

const unwrapDetailResponse = (response) => ({
  success: response?.data?.success ?? false,
  data: response?.data?.data ?? null,
  message: response?.data?.message || "",
});

export const getSaleDashboard = async () => {
  const res = await api.get("/sale/dashboard");
  return {
    success: res?.data?.success ?? false,
    data: res?.data?.data ?? { kpi: {}, recentRequests: [] },
    message: res?.data?.message || "",
  };
};

export const getSaleRentalRequests = async (filters = {}) => {
  const res = await api.get("/sale/rental-requests", { params: filters });
  return unwrapListResponse(res);
};

export const getSaleRentalRequestDetail = async (id) => {
  const res = await api.get(`/sale/rental-requests/${id}`);
  return unwrapDetailResponse(res);
};

export const processSaleRentalRequest = async (id, payload) => {
  const res = await api.post(`/sale/rental-requests/${id}/process`, payload);
  return res?.data ?? { success: false, data: null };
};

export const getSaleCustomers = async (filters = {}) => {
  const res = await api.get("/sale/customers", { params: filters });
  return unwrapListResponse(res);
};

export const getSaleContracts = async (filters = {}) => {
  const res = await api.get("/sale/contracts", { params: filters });
  return unwrapListResponse(res);
};

export const getSaleContractDetail = async (id) => {
  const res = await api.get(`/sale/contracts/${id}`);
  return unwrapDetailResponse(res);
};

export const getSaleCheckoutRequests = async (filters = {}) => {
  const res = await api.get("/sale/checkout-requests", { params: filters });
  return unwrapListResponse(res);
};

export const createSaleCheckoutRequest = async (payload) => {
  const res = await api.post("/sale/checkout-requests", payload);
  return res?.data ?? { success: false, data: null };
};

export const updateCheckoutRequestTime = async (id, payload) => {
  const res = await api.put(`/sale/checkout-requests/${id}/reschedule`, payload);
  return res?.data ?? { success: false, data: null };
};

export const createCheckoutRequest = createSaleCheckoutRequest;
export const getSaleDashboardKPI = getSaleDashboard;

const saleService = {
  getSaleDashboard,
  getSaleRentalRequests,
  getSaleRentalRequestDetail,
  processSaleRentalRequest,
  getSaleCustomers,
  getSaleContracts,
  getSaleContractDetail,
  getSaleCheckoutRequests,
  createSaleCheckoutRequest,
  updateCheckoutRequestTime,
};

export default saleService;
