// src/constants/sale.constants.js

const makeStatus = (label, className) => ({ label, className });

export const RENTAL_REQUEST_STATUS = {
  MOI_TAO: makeStatus("Mới tạo", "bg-sky-100 text-sky-700 ring-sky-200"),
  DANG_XU_LY: makeStatus("Đang xử lý", "bg-amber-100 text-amber-700 ring-amber-200"),
  CHO_THANH_TOAN: makeStatus("Chờ thanh toán", "bg-orange-100 text-orange-700 ring-orange-200"),
  DA_COC: makeStatus("Đã cọc", "bg-indigo-100 text-indigo-700 ring-indigo-200"),
  DA_XAC_NHAN: makeStatus("Đã xác nhận", "bg-emerald-100 text-emerald-700 ring-emerald-200"),
  TU_CHOI: makeStatus("Từ chối", "bg-rose-100 text-rose-700 ring-rose-200"),
  TAM_DUNG: makeStatus("Tạm dừng", "bg-slate-100 text-slate-700 ring-slate-200"),
};

export const RENTAL_REQUEST_STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "MOI_TAO", label: RENTAL_REQUEST_STATUS.MOI_TAO.label },
  { value: "DANG_XU_LY", label: RENTAL_REQUEST_STATUS.DANG_XU_LY.label },
  { value: "CHO_THANH_TOAN", label: RENTAL_REQUEST_STATUS.CHO_THANH_TOAN.label },
  { value: "DA_COC", label: RENTAL_REQUEST_STATUS.DA_COC.label },
  { value: "DA_XAC_NHAN", label: RENTAL_REQUEST_STATUS.DA_XAC_NHAN.label },
  { value: "TU_CHOI", label: RENTAL_REQUEST_STATUS.TU_CHOI.label },
  { value: "TAM_DUNG", label: RENTAL_REQUEST_STATUS.TAM_DUNG.label },
];

export const RENTAL_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả loại" },
  { value: "PHONG", label: "Thuê phòng" },
  { value: "GIUONG", label: "Thuê giường" },
];

export const SALE_CONTRACT_STATUS = {
  HIEU_LUC: makeStatus("Hiệu lực", "bg-emerald-100 text-emerald-700 ring-emerald-200"),
  TAM_NGUNG: makeStatus("Tạm ngưng", "bg-amber-100 text-amber-700 ring-amber-200"),
  HET_HAN: makeStatus("Hết hạn", "bg-slate-100 text-slate-700 ring-slate-200"),
  CHO_THANH_LY: makeStatus("Chờ thanh lý", "bg-orange-100 text-orange-700 ring-orange-200"),
  DA_THANH_LY: makeStatus("Đã thanh lý", "bg-indigo-100 text-indigo-700 ring-indigo-200"),
};

export const CONTRACT_STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "HIEU_LUC", label: SALE_CONTRACT_STATUS.HIEU_LUC.label },
  { value: "TAM_NGUNG", label: SALE_CONTRACT_STATUS.TAM_NGUNG.label },
  { value: "HET_HAN", label: SALE_CONTRACT_STATUS.HET_HAN.label },
  { value: "CHO_THANH_LY", label: SALE_CONTRACT_STATUS.CHO_THANH_LY.label },
  { value: "DA_THANH_LY", label: SALE_CONTRACT_STATUS.DA_THANH_LY.label },
];

export const CHECKOUT_STATUS = {
  CHO_XU_LY: makeStatus("Chờ xử lý", "bg-yellow-100 text-yellow-700 ring-yellow-200"),
  DANG_KIEM_TRA: makeStatus("Đang kiểm tra", "bg-blue-100 text-blue-700 ring-blue-200"),
  DA_KIEM_TRA: makeStatus("Đã kiểm tra", "bg-purple-100 text-purple-700 ring-purple-200"),
  DA_THANH_LY: makeStatus("Đã thanh lý", "bg-emerald-100 text-emerald-700 ring-emerald-200"),
  HUY: makeStatus("Đã hủy", "bg-slate-100 text-slate-700 ring-slate-200"),
};

export const CHECKOUT_STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "CHO_XU_LY", label: CHECKOUT_STATUS.CHO_XU_LY.label },
  { value: "DANG_KIEM_TRA", label: CHECKOUT_STATUS.DANG_KIEM_TRA.label },
  { value: "DA_KIEM_TRA", label: CHECKOUT_STATUS.DA_KIEM_TRA.label },
  { value: "DA_THANH_LY", label: CHECKOUT_STATUS.DA_THANH_LY.label },
  { value: "HUY", label: CHECKOUT_STATUS.HUY.label },
];

export const SALE_MENU = [
  { id: "dashboard", label: "Dashboard", path: "/sale/dashboard" },
  { id: "requests", label: "Yêu cầu thuê", path: "/sale/rental-requests" },
  { id: "customers", label: "Khách hàng", path: "/sale/customers" },
  { id: "contracts", label: "Hợp đồng", path: "/sale/contracts" },
  { id: "checkout", label: "Yêu cầu trả phòng", path: "/sale/checkout-requests" },
];
