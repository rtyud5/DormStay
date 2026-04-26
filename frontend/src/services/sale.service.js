import api from "./api";

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? null;
}

function listPayload(payload) {
  if (!payload) return { data: [], total: 0 };
  if (Array.isArray(payload.items)) {
    return { data: payload.items, total: payload.total ?? payload.items.length };
  }
  if (Array.isArray(payload)) return { data: payload, total: payload.length };
  return { data: [], total: 0 };
}

export async function getSaleDashboard() {
  const response = await api.get("/sale/dashboard");
  return { data: unwrap(response) };
}

export async function getSaleRentalRequests(filters = {}) {
  const response = await api.get("/sale/rental-requests", { params: filters });
  return listPayload(unwrap(response));
}

export async function getSaleRentalRequestDetail(id) {
  const response = await api.get(`/sale/rental-requests/${id}`);
  return { data: unwrap(response) };
}

export async function processSaleRentalRequest(id, payload) {
  const response = await api.post(`/sale/rental-requests/${id}/process`, payload);
  return { data: unwrap(response) };
}

export async function getSaleCustomers(filters = {}) {
  const response = await api.get("/sale/customers", { params: filters });
  return listPayload(unwrap(response));
}

export async function getSaleCustomerDetail(id) {
  const response = await api.get(`/sale/customers/${id}`);
  return { data: unwrap(response) };
}

export async function getSaleContracts(filters = {}) {
  const response = await api.get("/sale/contracts", { params: filters });
  return listPayload(unwrap(response));
}

export async function getSaleContractDetail(id) {
  const response = await api.get(`/sale/contracts/${id}`);
  return { data: unwrap(response) };
}

export async function getSaleCheckoutRequests(filters = {}) {
  const response = await api.get("/sale/checkout-requests", { params: filters });
  return listPayload(unwrap(response));
}

export async function createCheckoutRequest(payload) {
  const response = await api.post("/sale/checkout-requests", payload);
  return { data: unwrap(response) };
}

export async function updateCheckoutRequestTime(id, payload) {
  const response = await api.put(`/sale/checkout-requests/${id}/reschedule`, payload);
  return { data: unwrap(response) };
}
