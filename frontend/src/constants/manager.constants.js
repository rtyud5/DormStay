/**
 * Constants cho Module Quản Lý Vận Hành
 * Routes, API paths, status maps, enums
 */

import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FileSignature,
  BedDouble,
} from "lucide-react";

// ==================== ROUTES ====================
export const MANAGER_ROUTES = {
  DASHBOARD: "/manager/dashboard",
  RESIDENTS: "/manager/residents",
  RESIDENT_DETAIL: "/manager/residents/:id",
  INSPECTIONS: "/manager/inspections",
  LIQUIDATIONS: "/manager/liquidations",
  ROOMS: "/manager/rooms",
};

// ==================== API PATHS ====================
export const MANAGER_API = {
  BASE: "/api/manager",
  DASHBOARD: "/api/manager/dashboard",
  RESIDENTS: "/api/manager/residents",
  INSPECTIONS: "/api/manager/inspections",
  LIQUIDATIONS: "/api/manager/liquidations",
  ROOMS: "/api/manager/rooms",
  BEDS: "/api/manager/beds",
};

// ==================== STATUS MAPS ====================

// Hop dong
export const CONTRACT_STATUS = {
  HIEU_LUC: {
    label: "Hiệu lực",
    color: "bg-green-100",
    textColor: "text-green-700",
    dot: "bg-green-500",
  },
  HET_HAN: {
    label: "Hết hạn",
    color: "bg-gray-100",
    textColor: "text-gray-600",
    dot: "bg-gray-400",
  },
  CHAM_DUT: {
    label: "Đã chấm dứt",
    color: "bg-red-100",
    textColor: "text-red-700",
    dot: "bg-red-500",
  },
  CHO_THANH_LY: {
    label: "Chờ thanh lý",
    color: "bg-orange-100",
    textColor: "text-orange-700",
    dot: "bg-orange-500",
  },
};

// Phong
export const ROOM_STATUS = {
  TRONG: {
    label: "Trống",
    color: "bg-emerald-100",
    textColor: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  DANG_O: {
    label: "Đang ở",
    color: "bg-blue-100",
    textColor: "text-blue-700",
    dot: "bg-blue-500",
  },
  DANG_COC: {
    label: "Đang cọc",
    color: "bg-yellow-100",
    textColor: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  BAO_TRI: {
    label: "Bảo trì",
    color: "bg-red-100",
    textColor: "text-red-700",
    dot: "bg-red-500",
  },
  DONG_CUA: {
    label: "Đóng cửa",
    color: "bg-gray-100",
    textColor: "text-gray-600",
    dot: "bg-gray-400",
  },
};

// Giuong
export const BED_STATUS = {
  TRONG: {
    label: "Trống",
    color: "bg-emerald-100",
    textColor: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  DA_THUE: {
    label: "Đã thuê",
    color: "bg-blue-100",
    textColor: "text-blue-700",
    dot: "bg-blue-500",
  },
  DA_COC: {
    label: "Đã cọc",
    color: "bg-yellow-100",
    textColor: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  BAO_TRI: {
    label: "Bảo trì",
    color: "bg-red-100",
    textColor: "text-red-700",
    dot: "bg-red-500",
  },
};

// Yeu cau tra phong
export const CHECKOUT_REQUEST_STATUS = {
  CHO_XU_LY: {
    label: "Chờ xử lý",
    color: "bg-yellow-100",
    textColor: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  DANG_KIEM_TRA: {
    label: "Đang kiểm tra",
    color: "bg-blue-100",
    textColor: "text-blue-700",
    dot: "bg-blue-500",
  },
  DA_KIEM_TRA: {
    label: "Đã kiểm tra",
    color: "bg-purple-100",
    textColor: "text-purple-700",
    dot: "bg-purple-500",
  },
  DA_THANH_LY: {
    label: "Đã thanh lý",
    color: "bg-green-100",
    textColor: "text-green-700",
    dot: "bg-green-500",
  },
  HUY: {
    label: "Đã hủy",
    color: "bg-gray-100",
    textColor: "text-gray-600",
    dot: "bg-gray-400",
  },
};

// Doi soat tai chinh (Liquidation)
export const LIQUIDATION_STATUS = {
  CHO_CHOT: {
    label: "Chờ chốt",
    color: "bg-yellow-100",
    textColor: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  DA_CHOT: {
    label: "Đã chốt",
    color: "bg-green-100",
    textColor: "text-green-700",
    dot: "bg-green-500",
  },
  HOAN_TAT: {
    label: "Hoàn tất",
    color: "bg-gray-100",
    textColor: "text-gray-600",
    dot: "bg-gray-400",
  },
};

// Bien ban kiem tra (Inspection)
export const INSPECTION_STATUS = {
  CHO_KIEM_TRA: {
    label: "Chờ kiểm tra",
    color: "bg-yellow-100",
    textColor: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  DANG_KIEM_TRA: {
    label: "Đang kiểm tra",
    color: "bg-blue-100",
    textColor: "text-blue-700",
    dot: "bg-blue-500",
  },
  DA_KIEM_TRA: {
    label: "Đã kiểm tra",
    color: "bg-green-100",
    textColor: "text-green-700",
    dot: "bg-green-500",
  },
};

// ==================== MENU ====================
export const MANAGER_MENU = [
  {
    id: 1,
    label: "Dashboard",
    icon: LayoutDashboard,
    path: MANAGER_ROUTES.DASHBOARD,
  },
  {
    id: 2,
    label: "Hồ sơ cư trú",
    icon: Users,
    path: MANAGER_ROUTES.RESIDENTS,
  },
  {
    id: 3,
    label: "Kiểm tra phòng",
    icon: ClipboardCheck,
    path: MANAGER_ROUTES.INSPECTIONS,
  },
  {
    id: 4,
    label: "Thanh lý hợp đồng",
    icon: FileSignature,
    path: MANAGER_ROUTES.LIQUIDATIONS,
  },
  {
    id: 5,
    label: "Quản lý phòng / giường",
    icon: BedDouble,
    path: MANAGER_ROUTES.ROOMS,
  },
];

// ==================== BREADCRUMB MAP ====================
export const BREADCRUMB_MAP = {
  "/manager/dashboard": "Dashboard",
  "/manager/residents": "Hồ sơ cư trú",
  "/manager/inspections": "Kiểm tra phòng",
  "/manager/liquidations": "Thanh lý hợp đồng",
  "/manager/rooms": "Quản lý phòng / giường",
};

// ==================== FILTER OPTIONS ====================
export const FLOOR_OPTIONS = [
  { value: "all", label: "Tất cả tầng" },
  { value: "1", label: "Tầng 1" },
  { value: "2", label: "Tầng 2" },
  { value: "3", label: "Tầng 3" },
  { value: "4", label: "Tầng 4" },
  { value: "5", label: "Tầng 5" },
];

export const RENTAL_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "PHONG", label: "Thuê phòng" },
  { value: "GIUONG", label: "Thuê giường" },
];

export const GENDER_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "Nam", label: "Nam" },
  { value: "Nữ", label: "Nữ" },
  { value: "Nam/Nữ", label: "Nam / Nữ" },
];

export const ROOM_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả loại" },
  { value: "KTX_4", label: "KTX 4 giường" },
  { value: "KTX_6", label: "KTX 6 giường" },
  { value: "KTX_8", label: "KTX 8 giường" },
  { value: "PHONG_DOI", label: "Phòng đôi" },
  { value: "PHONG_DON", label: "Phòng đơn" },
];

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_OPTIONS: [10, 20, 50],
};

export default {
  MANAGER_ROUTES,
  MANAGER_API,
  CONTRACT_STATUS,
  ROOM_STATUS,
  BED_STATUS,
  CHECKOUT_REQUEST_STATUS,
  LIQUIDATION_STATUS,
  INSPECTION_STATUS,
  MANAGER_MENU,
  BREADCRUMB_MAP,
  FLOOR_OPTIONS,
  RENTAL_TYPE_OPTIONS,
  GENDER_OPTIONS,
  ROOM_TYPE_OPTIONS,
  PAGINATION,
};
