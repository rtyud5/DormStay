/**
 * Constants cho Module Sale
 * Routes, menu, breadcrumbs, status maps và option lists.
 */

export const SALE_ROUTES = {
  HOME: "/",
  DASHBOARD: "/sale/dashboard",
  RENTAL_REQUESTS: "/sale/rental-requests",
  RENTAL_REQUEST_NEW: "/sale/checkout-requests/new",
  CHECKOUT_REQUEST_NEW: "/sale/checkout-requests/new",
  RENTAL_REQUEST_DETAIL: (id) => `/sale/rental-requests/${id}`,
  CUSTOMERS: "/sale/customers",
  CONTRACTS: "/sale/contracts",
  CHECKOUT_REQUESTS: "/sale/checkout-requests",
};

export const SALE_BREADCRUMB_MAP = {
  "/sale/dashboard": "Dashboard",
  "/sale/rental-requests/new": "Ghi nhận yêu cầu thuê",
  "/sale/rental-requests": "Yêu cầu thuê",
  "/sale/customers": "Khách hàng",
  "/sale/contracts": "Hợp đồng",
  "/sale/checkout-requests/new": "Ghi nhận yêu cầu trả phòng",
  "/sale/checkout-requests": "Yêu cầu trả phòng",
};

export const RENTAL_REQUEST_STATUS = {
  MOI_TAO: { label: "Mới tạo", color: "bg-blue-100", textColor: "text-blue-700", dot: "bg-blue-500" },
  DANG_XU_LY: { label: "Đang xử lý", color: "bg-amber-100", textColor: "text-amber-700", dot: "bg-amber-500" },
  CHO_THANH_TOAN: { label: "Chờ thanh toán", color: "bg-orange-100", textColor: "text-orange-700", dot: "bg-orange-500" },
  DA_XAC_NHAN: { label: "Đã xác nhận", color: "bg-emerald-100", textColor: "text-emerald-700", dot: "bg-emerald-500" },
  TU_CHOI: { label: "Từ chối", color: "bg-rose-100", textColor: "text-rose-700", dot: "bg-rose-500" },
  TAM_DUNG: { label: "Tạm dừng", color: "bg-slate-100", textColor: "text-slate-600", dot: "bg-slate-400" },
};

export const RENTAL_REQUEST_STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "MOI_TAO", label: "Mới tạo" },
  { value: "DANG_XU_LY", label: "Đang xử lý" },
  { value: "CHO_THANH_TOAN", label: "Chờ thanh toán" },
  { value: "DA_XAC_NHAN", label: "Đã xác nhận" },
  { value: "TU_CHOI", label: "Từ chối" },
  { value: "TAM_DUNG", label: "Tạm dừng" },
];

export const RENTAL_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả loại thuê" },
  { value: "PHONG", label: "Thuê phòng" },
  { value: "GIUONG", label: "Thuê giường" },
];

export const SALE_CONTRACT_STATUS = {
  HIEU_LUC: { label: "Hiệu lực", color: "bg-emerald-100", textColor: "text-emerald-700", dot: "bg-emerald-500" },
  CHO_THANH_LY: { label: "Chờ thanh lý", color: "bg-amber-100", textColor: "text-amber-700", dot: "bg-amber-500" },
  TAM_DUNG: { label: "Tạm dừng", color: "bg-slate-100", textColor: "text-slate-600", dot: "bg-slate-400" },
  CHAM_DUT: { label: "Chấm dứt", color: "bg-rose-100", textColor: "text-rose-700", dot: "bg-rose-500" },
};

export const CONTRACT_STATUS_OPTIONS = [
  { value: "all", label: "Tất cả hợp đồng" },
  { value: "HIEU_LUC", label: "Hiệu lực" },
  { value: "CHO_THANH_LY", label: "Chờ thanh lý" },
  { value: "TAM_DUNG", label: "Tạm dừng" },
  { value: "CHAM_DUT", label: "Chấm dứt" },
];

export const CHECKOUT_STATUS = {
  CHO_XU_LY: { label: "Chờ xử lý", color: "bg-amber-100", textColor: "text-amber-700", dot: "bg-amber-500" },
  DANG_KIEM_TRA: { label: "Đang kiểm tra", color: "bg-blue-100", textColor: "text-blue-700", dot: "bg-blue-500" },
  DA_KIEM_TRA: { label: "Đã kiểm tra", color: "bg-violet-100", textColor: "text-violet-700", dot: "bg-violet-500" },
  DA_THANH_LY: { label: "Đã thanh lý", color: "bg-emerald-100", textColor: "text-emerald-700", dot: "bg-emerald-500" },
  HUY: { label: "Đã hủy", color: "bg-slate-100", textColor: "text-slate-600", dot: "bg-slate-400" },
};

export const CHECKOUT_STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "CHO_XU_LY", label: "Chờ xử lý" },
  { value: "DANG_KIEM_TRA", label: "Đang kiểm tra" },
  { value: "DA_KIEM_TRA", label: "Đã kiểm tra" },
  { value: "DA_THANH_LY", label: "Đã thanh lý" },
  { value: "HUY", label: "Đã hủy" },
];

export const CHECKOUT_REASON_OPTIONS = [
  { value: "Hết nhu cầu lưu trú", label: "Hết nhu cầu lưu trú" },
  { value: "Chuyển chỗ ở", label: "Chuyển chỗ ở" },
  { value: "Kết thúc kỳ học / công tác", label: "Kết thúc kỳ học / công tác" },
  { value: "Vấn đề tài chính", label: "Vấn đề tài chính" },
  { value: "Lý do khác", label: "Lý do khác" },
];
