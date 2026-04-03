export const APP_NAME = "DormiCare Starter";

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
  token: "dormicare_token",
  user: "dormicare_user",
};

export const REQUEST_STATUS = {
  submitted: "submitted",
  reviewing: "reviewing",
  approved: "approved",
  rejected: "rejected",
  depositPending: "deposit_pending",
  depositPaid: "deposit_paid",
};
