/**
 * Manager Service — API Calls
 * Tất cả các request liên quan đến module Quản lý Vận hành
 */

import api from "./api";
import {
  mockResidents,
  mockInspections,
  mockLiquidations,
  mockRooms,
  mockDashboardKPI,
} from "../mockdata/manager.mockdata";

const USE_MOCK = import.meta.env.VITE_USE_MANAGER_MOCK === "true";

// ==================== HELPERS ====================
const getInitials = (fullName = "") =>
  fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");

const sleep = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// ==================== DASHBOARD ====================

export const getManagerDashboardKPI = async () => {
  if (USE_MOCK) {
    await sleep();
    return { success: true, data: mockDashboardKPI };
  }
  const res = await api.get("/manager/dashboard");
  return res?.data ?? { success: false, data: null };
};

export const getRecentCheckoutRequests = async () => {
  if (USE_MOCK) {
    await sleep();
    return {
      success: true,
      data: mockInspections.filter((i) =>
        ["CHO_XU_LY", "DANG_KIEM_TRA"].includes(i.checkoutStatus)
      ),
    };
  }
  const res = await api.get("/manager/checkout-requests/recent");
  return res?.data ?? { success: false, data: [] };
};

// ==================== RESIDENTS ====================

export const getResidents = async (filters = {}) => {
  if (USE_MOCK) {
    await sleep();
    let data = [...mockResidents];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          r.roomDisplay.toLowerCase().includes(q) ||
          r.phone.includes(q)
      );
    }
    if (filters.floor && filters.floor !== "all") {
      data = data.filter((r) => r.floor === filters.floor);
    }
    if (filters.rentalType && filters.rentalType !== "all") {
      data = data.filter((r) => r.rentalType === filters.rentalType);
    }

    return { success: true, data, total: data.length };
  }

  const res = await api.get("/manager/residents", { params: filters });
  const payload = res?.data?.data ?? {};
  return {
    success: res?.data?.success ?? false,
    data: (payload.items || []).map((r) => ({
      ...r,
      avatarInitials: r.avatarInitials || getInitials(r.customerName),
    })),
    total: payload.total || 0,
  };
};

export const getResidentDetail = async (contractId) => {
  if (USE_MOCK) {
    await sleep(200);
    const found = mockResidents.find((r) => r.id === contractId);
    return { success: !!found, data: found ?? null };
  }
  const res = await api.get(`/manager/residents/${contractId}`);
  return res?.data ?? { success: false, data: null };
};

// ==================== INSPECTIONS ====================

export const getInspections = async (filters = {}) => {
  if (USE_MOCK) {
    await sleep();
    let data = [...mockInspections];

    if (filters.status && filters.status !== "all") {
      data = data.filter((i) => i.checkoutStatus === filters.status);
    }
    if (filters.floor && filters.floor !== "all") {
      data = data.filter((i) => i.floor === filters.floor);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (i) =>
          i.customerName.toLowerCase().includes(q) ||
          i.contractId.toLowerCase().includes(q) ||
          i.roomDisplay.toLowerCase().includes(q)
      );
    }

    return { success: true, data, total: data.length };
  }

  const res = await api.get("/manager/inspections", { params: filters });
  const payload = res?.data?.data ?? {};
  return {
    success: res?.data?.success ?? false,
    data: payload.items || [],
    total: payload.total || 0,
  };
};

export const getInspectionDetail = async (checkoutRequestId) => {
  if (USE_MOCK) {
    await sleep(200);
    const found = mockInspections.find((i) => i.id === checkoutRequestId);
    return { success: !!found, data: found ?? null };
  }
  const res = await api.get(`/manager/inspections/${checkoutRequestId}`);
  return res?.data ?? { success: false, data: null };
};

export const createInspectionReport = async (data) => {
  if (USE_MOCK) {
    await sleep(500);
    // Update mock status
    const target = mockInspections.find((i) => i.id === data.checkoutRequestId);
    if (target) {
      target.checkoutStatus = "DA_KIEM_TRA";
      target.inspectionStatus = "DA_KIEM_TRA";
      target.inspection = {
        id: `BBKT-${Date.now()}`,
        inspectedBy: "Quản lý hệ thống",
        inspectedAt: new Date().toISOString(),
        totalDeduction: data.items?.reduce((s, i) => s + (i.compensation || 0), 0) ?? 0,
        items: data.items || [],
      };
    }
    return { success: true, data: target, message: "Lập biên bản kiểm tra thành công" };
  }
  const res = await api.post("/manager/inspections", data);
  return res?.data ?? { success: false };
};

// ==================== LIQUIDATIONS ====================

export const getLiquidations = async (filters = {}) => {
  if (USE_MOCK) {
    await sleep();
    let data = [...mockLiquidations];

    if (filters.status && filters.status !== "all") {
      data = data.filter((l) => l.liquidationStatus === filters.status);
    }
    if (filters.floor && filters.floor !== "all") {
      data = data.filter((l) => l.floor === filters.floor);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (l) =>
          l.customerName.toLowerCase().includes(q) ||
          l.contractId.toLowerCase().includes(q) ||
          l.roomDisplay.toLowerCase().includes(q)
      );
    }

    return { success: true, data, total: data.length };
  }

  const res = await api.get("/manager/liquidations", { params: filters });
  const payload = res?.data?.data ?? {};
  return {
    success: res?.data?.success ?? false,
    data: payload.items || [],
    total: payload.total || 0,
  };
};

export const getLiquidationDetail = async (liquidationId) => {
  if (USE_MOCK) {
    await sleep(200);
    const found = mockLiquidations.find((l) => l.id === liquidationId);
    return { success: !!found, data: found ?? null };
  }
  const res = await api.get(`/manager/liquidations/${liquidationId}`);
  return res?.data ?? { success: false, data: null };
};

export const performLiquidation = async (liquidationId, payload) => {
  if (USE_MOCK) {
    await sleep(600);
    const target = mockLiquidations.find((l) => l.id === liquidationId);
    if (target) {
      target.liquidationStatus = "DA_CHOT";
      Object.assign(target, payload);
    }
    return { success: true, data: target, message: "Thanh lý hợp đồng thành công" };
  }
  const res = await api.post(`/manager/liquidations/${liquidationId}/perform`, payload);
  return res?.data ?? { success: false };
};

// ==================== ROOMS ====================

export const getRoomsOverview = async (filters = {}) => {
  if (USE_MOCK) {
    await sleep();
    let data = [...mockRooms];

    if (filters.floor && filters.floor !== "all") {
      data = data.filter((r) => r.floor === filters.floor);
    }
    if (filters.status && filters.status !== "all") {
      data = data.filter((r) => r.status === filters.status);
    }
    if (filters.gender && filters.gender !== "all") {
      data = data.filter((r) => r.gender === filters.gender);
    }
    if (filters.roomType && filters.roomType !== "all") {
      data = data.filter((r) => r.roomType === filters.roomType);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter((r) => r.displayId.toLowerCase().includes(q));
    }

    return {
      success: true,
      data,
      total: data.length,
      stats: {
        total: mockRooms.length,
        occupied: mockRooms.filter((r) => r.status === "DANG_O").length,
        reserved: mockRooms.filter((r) => r.status === "DANG_COC").length,
        empty: mockRooms.filter((r) => r.status === "TRONG").length,
        maintenance: mockRooms.filter((r) => r.status === "BAO_TRI").length,
      },
    };
  }

  const res = await api.get("/manager/rooms", { params: filters });
  const payload = res?.data?.data ?? {};
  return {
    success: res?.data?.success ?? false,
    data: payload.items || [],
    total: payload.total || 0,
    stats: payload.stats || {},
  };
};

export const getRoomDetail = async (roomId) => {
  if (USE_MOCK) {
    await sleep(200);
    const found = mockRooms.find((r) => r.id === roomId);
    return { success: !!found, data: found ?? null };
  }
  const res = await api.get(`/manager/rooms/${roomId}`);
  return res?.data ?? { success: false, data: null };
};

export const updateRoomStatus = async (roomId, statusData) => {
  if (USE_MOCK) {
    await sleep(400);
    const target = mockRooms.find((r) => r.id === roomId);
    if (target) Object.assign(target, statusData);
    return { success: true, data: target, message: "Cập nhật trạng thái phòng thành công" };
  }
  const res = await api.put(`/manager/rooms/${roomId}/status`, statusData);
  return res?.data ?? { success: false };
};

export const updateBedStatus = async (roomId, bedId, statusData) => {
  if (USE_MOCK) {
    await sleep(300);
    const room = mockRooms.find((r) => r.id === roomId);
    const bed = room?.beds?.find((b) => b.id === bedId);
    if (bed) Object.assign(bed, statusData);
    return { success: true, data: bed, message: "Cập nhật trạng thái giường thành công" };
  }
  const res = await api.put(`/manager/rooms/${roomId}/beds/${bedId}/status`, statusData);
  return res?.data ?? { success: false };
};
