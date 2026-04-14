export const APP_NAME = "DormStay";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  rooms: "/rooms",
  roomDetail: "/rooms/:id",
  rentalRequest: "/rental-requests/new",
  requestDetail: "/rental-requests/:id",
  contracts: "/contracts",
  contractDetail: "/contracts/:id",
};

export const STORAGE_KEYS = {
  token: "dormstay_token",
  user: "dormstay_user",
};

export const REQUEST_STATUS = {
  submitted: "submitted",
  reviewing: "reviewing",
  approved: "approved",
  rejected: "rejected",
  depositPending: "deposit_pending",
  depositPaid: "deposit_paid",
};
