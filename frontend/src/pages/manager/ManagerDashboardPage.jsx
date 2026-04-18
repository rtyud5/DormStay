import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BedDouble,
  ClipboardCheck,
  FileSignature,
  AlertTriangle,
  ChevronRightCircle,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { getManagerDashboardKPI, getRecentCheckoutRequests } from "../../services/manager.service";
import { MANAGER_ROUTES, CHECKOUT_REQUEST_STATUS } from "../../constants/manager.constants";
import ManagerKpiCard from "../../components/manager/ManagerKpiCard";
import ManagerStatusBadge from "../../components/manager/ManagerStatusBadge";

export default function ManagerDashboardPage() {
  const navigate = useNavigate();
  const [kpi, setKpi] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [kpiRes, reqRes] = await Promise.allSettled([
          getManagerDashboardKPI(),
          getRecentCheckoutRequests(),
        ]);
        if (kpiRes.status === "fulfilled") setKpi(kpiRes.value?.data);
        if (reqRes.status === "fulfilled") setRecentRequests(reqRes.value?.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-[#0b2447] rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black tracking-widest text-[#0b2447] uppercase animate-pulse">
            Đang tải tổng quan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-10 max-w-[1500px] mx-auto bg-[#f9fafb] min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-[2.2rem] font-extrabold text-[#0b2447] tracking-tight leading-none mb-3">
              Tổng quan hệ thống
            </h1>
            <p className="text-gray-500 font-medium">
              Theo dõi tình trạng phòng, cư dân và các yêu cầu vận hành theo thời gian thực.
            </p>
          </div>
          <button
            onClick={() => navigate(MANAGER_ROUTES.ROOMS)}
            className="flex items-center gap-2 px-6 py-3.5 bg-[#0b2447] text-white rounded-full font-bold hover:bg-blue-900 transition-colors shadow-md shadow-blue-900/20 self-start md:self-auto"
          >
            <BedDouble className="w-4 h-4" /> Quản lý phòng
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <ManagerKpiCard
          isPrimary
          title="TỔNG CƯ DÂN"
          value={kpi?.totalResidents ?? 0}
          icon={<Users className="w-6 h-6 text-white/30" />}
          subtext="Đang lưu trú"
          change={kpi?.newResidentsThisMonth > 0 ? 1 : 0}
          changePercent={kpi?.newResidentsThisMonth}
          changeColor="text-green-600"
          bgChangeColor="bg-green-100"
          onClick={() => navigate(MANAGER_ROUTES.RESIDENTS)}
        />

        <ManagerKpiCard
          title="PHÒNG ĐANG Ở"
          value={kpi?.occupiedRooms ?? 0}
          icon={<BedDouble className="w-4 h-4" />}
          subtext={`Trống: ${kpi?.emptyRooms ?? 0} phòng`}
          onClick={() => navigate(MANAGER_ROUTES.ROOMS)}
        />

        <ManagerKpiCard
          title="YÊU CẦU TRẢ PHÒNG"
          value={kpi?.pendingCheckoutRequests ?? 0}
          icon={<ClipboardCheck className="w-4 h-4" />}
          subtext="Đang chờ xử lý"
          change={1}
          changePercent={kpi?.checkoutRequestsThisWeek ?? 0}
          changeColor="text-orange-600"
          bgChangeColor="bg-orange-100"
          onClick={() => navigate(MANAGER_ROUTES.INSPECTIONS)}
        />

        <ManagerKpiCard
          title="HĐ SẮP HẾT HẠN"
          value={kpi?.contractsExpiringSoon ?? 0}
          icon={<FileSignature className="w-4 h-4" />}
          subtext="Trong 30 ngày tới"
          change={-1}
          changePercent={5}
          changeColor="text-red-600"
          bgChangeColor="bg-red-100"
          onClick={() => navigate(MANAGER_ROUTES.LIQUIDATIONS)}
        />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Room Status Distribution */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
          <h3 className="text-[13px] font-black tracking-widest text-[#0b2447] uppercase mb-6 flex items-center gap-3">
            <BedDouble className="w-5 h-5" /> TÌNH TRẠNG PHÒNG
          </h3>
          <div className="space-y-4">
            {[
              { label: "Đang ở", value: kpi?.occupiedRooms ?? 0, color: "bg-blue-500" },
              { label: "Trống", value: kpi?.emptyRooms ?? 0, color: "bg-emerald-500" },
              { label: "Bảo trì", value: kpi?.maintenanceRooms ?? 0, color: "bg-red-500" },
            ].map((item) => {
              const pct = Math.round(((item.value) / Math.max(kpi?.totalRooms ?? 1, 1)) * 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[13px] font-bold text-gray-700">{item.label} ({item.value})</span>
                    <span className="text-[13px] font-black text-gray-600">{pct}%</span>
                  </div>
                  <div className="w-full bg-[#f4f7fa] h-2.5 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#0b2447] rounded-[2rem] shadow-xl shadow-[#0b2447]/20 p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          <h3 className="text-[13px] font-black tracking-widest text-blue-200/80 uppercase mb-6 flex items-center gap-3 relative z-10">
            <ArrowUpRight className="w-5 h-5" /> THAO TÁC NHANH
          </h3>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {[
              { label: "Hồ sơ cư trú", route: MANAGER_ROUTES.RESIDENTS, color: "text-blue-300", bg: "bg-blue-400/20" },
              { label: "Kiểm tra phòng", route: MANAGER_ROUTES.INSPECTIONS, color: "text-orange-300", bg: "bg-orange-400/20" },
              { label: "Thanh lý HĐ", route: MANAGER_ROUTES.LIQUIDATIONS, color: "text-purple-300", bg: "bg-purple-400/20" },
              { label: "Quản lý phòng", route: MANAGER_ROUTES.ROOMS, color: "text-[#0b2447]", bg: "bg-white", isLight: true },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.route)}
                className={`${
                  item.isLight
                    ? "bg-white hover:bg-gray-100 text-[#0b2447] shadow-lg"
                    : "bg-white/10 hover:bg-white/20 border border-white/10 text-white"
                } rounded-2xl p-4 flex flex-col items-center justify-center gap-2 group transition-colors`}
              >
                <span className={`text-[11px] font-black uppercase tracking-wider text-center leading-tight ${item.isLight ? "text-[#0b2447]" : "text-white"}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-40 h-40 bg-blue-50 rounded-tl-full -z-0" />
          <div className="relative z-10">
            <h3 className="text-[13px] font-black tracking-widest text-[#0b2447] uppercase mb-6 flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#1a56db]" /> TÓNG KẾT TUẦN
            </h3>
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  CƯ DÂN MỚI THÁNG NÀY
                </p>
                <p className="text-3xl font-black text-gray-900">{kpi?.newResidentsThisMonth ?? 0}</p>
              </div>
              <div className="w-full h-px bg-gray-100" />
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-800 mb-0.5">Cần xử lý gấp</p>
                  <p className="text-[11px] text-gray-500">
                    {kpi?.pendingCheckoutRequests ?? 0} yêu cầu trả phòng chưa kiểm tra
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Checkout Requests */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-2">
        <div className="px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#f4f7fa] flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4 text-[#1a56db]" />
            </div>
            <h3 className="text-[13px] font-black tracking-widest text-[#0b2447] uppercase">
              Yêu cầu trả phòng gần đây
            </h3>
          </div>
          <button
            onClick={() => navigate(MANAGER_ROUTES.INSPECTIONS)}
            className="text-[11px] font-black tracking-widest uppercase text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            Tất cả <ChevronRightCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="px-2 pb-2">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Mã HĐ", "Cư dân", "Phòng / Giường", "Ngày yêu cầu", "Lý do", "Trạng thái"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                    Không có yêu cầu nào đang chờ xử lý 🎉
                  </td>
                </tr>
              ) : (
                recentRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => navigate(MANAGER_ROUTES.INSPECTIONS)}
                    className="border-b border-gray-50 hover:bg-[#f9fafb] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-4">
                      <span className="font-extrabold text-[#0b2447] text-xs">{req.contractId}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                          {req.avatarInitials}
                        </div>
                        <span className="font-bold text-[#111827] text-sm">{req.customerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 font-medium">
                      {req.roomDisplay}{req.bedDisplay ? ` — ${req.bedDisplay}` : ""}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(req.requestDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{req.reason}</td>
                    <td className="px-4 py-4">
                      <ManagerStatusBadge
                        statusMap={CHECKOUT_REQUEST_STATUS}
                        statusKey={req.checkoutStatus}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
