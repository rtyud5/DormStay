import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, CalendarClock, ClipboardList, FileSignature, Users, BadgeCheck, Clock3 } from "lucide-react";
import { getSaleDashboard } from "../../services/sale.service";
import { SALE_ROUTES, CHECKOUT_STATUS } from "../../constants/sale.constants";
import SaleStatusBadge from "../../components/sale/SaleStatusBadge";

const KPI_CARD_STYLE = [
  { key: "totalPendingRequests", title: "Yêu cầu đang chờ", icon: ClipboardList, accent: "bg-[#0b2447]", hint: "Cần xử lý sớm" },
  { key: "pendingCheckouts", title: "Trả phòng chờ xử lý", icon: CalendarClock, accent: "bg-[#2563eb]", hint: "Sẵn sàng cho quản lý" },
  { key: "activeContracts", title: "Hợp đồng hiệu lực", icon: FileSignature, accent: "bg-[#16a34a]", hint: "Đang lưu trú" },
  { key: "totalCustomers", title: "Khách hàng", icon: Users, accent: "bg-[#7c3aed]", hint: "Đã đăng ký" },
  { key: "approvedThisMonth", title: "Đã duyệt tháng này", icon: BadgeCheck, accent: "bg-[#0f766e]", hint: "Theo dõi tăng trưởng" },
  { key: "rejectedThisMonth", title: "Từ chối tháng này", icon: Clock3, accent: "bg-[#dc2626]", hint: "Cần lưu ý" },
];

export default function SaleDashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getSaleDashboard();
        if (mounted) setDashboard(res?.data ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const kpi = dashboard?.kpi || {};
  const recentRequests = dashboard?.recentRequests || [];

  const pendingRate = useMemo(() => {
    const total = Number(kpi.totalRequests || 0);
    const pending = Number(kpi.totalPendingRequests || 0);
    if (!total) return 0;
    return Math.round((pending / total) * 100);
  }, [kpi.totalRequests, kpi.totalPendingRequests]);

  if (loading) {
    return (
      <div className="p-8 lg:p-10 max-w-[1500px] mx-auto bg-[#f9fafb] min-h-screen">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-[#0b2447] rounded-full animate-spin mx-auto" />
            <p className="text-[10px] font-black tracking-widest text-[#0b2447] uppercase animate-pulse">
              Đang tải tổng quan sale...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-10 max-w-[1500px] mx-auto bg-[#f9fafb] min-h-screen">
      <div className="mb-10">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-[2.2rem] font-extrabold text-[#0b2447] tracking-tight leading-none">
              Tổng quan Sale
            </h1>
            <p className="text-gray-500 font-medium max-w-2xl">
              Theo dõi yêu cầu thuê, khách hàng, hợp đồng và luồng trả phòng theo thời gian thực.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(SALE_ROUTES.RENTAL_REQUESTS)}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-[#0b2447] rounded-full font-bold hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ClipboardList className="w-4 h-4" /> Yêu cầu thuê
            </button>
            <button
              onClick={() => navigate(SALE_ROUTES.CHECKOUT_REQUEST_NEW)}
              className="flex items-center gap-2 px-5 py-3 bg-[#0b2447] text-white rounded-full font-bold hover:bg-[#081a33] transition-colors shadow-md shadow-[#0b2447]/20"
            >
              <CalendarClock className="w-4 h-4" /> Ghi nhận trả phòng
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        {KPI_CARD_STYLE.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              onClick={() => {
                if (card.key === "pendingCheckouts") navigate(SALE_ROUTES.CHECKOUT_REQUESTS);
                else if (card.key === "activeContracts") navigate(SALE_ROUTES.CONTRACTS);
                else if (card.key === "totalCustomers") navigate(SALE_ROUTES.CUSTOMERS);
                else navigate(SALE_ROUTES.RENTAL_REQUESTS);
              }}
              className="text-left bg-white rounded-[1.75rem] border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400 mb-2">{card.title}</p>
                  <p className="text-[2rem] font-extrabold text-[#0b2447] leading-none">{kpi[card.key] ?? 0}</p>
                  <p className="text-sm text-gray-500 mt-3">{card.hint}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${card.accent} text-white flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 bg-white rounded-[1.75rem] border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-[#0b2447]">Phân bổ trạng thái</h2>
              <p className="text-sm text-gray-500">Tỷ lệ yêu cầu theo trạng thái hiện tại.</p>
            </div>
            <SaleStatusBadge statusKey="CHO_XU_LY" statusMap={CHECKOUT_STATUS} />
          </div>

          <div className="space-y-4">
            {Object.entries(kpi.requestsByStatus || {}).map(([key, value]) => {
              const pct = Math.max(0, Math.min(100, Math.round((Number(value || 0) / Math.max(Number(kpi.totalRequests || 1), 1)) * 100)));
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-gray-700">{CHECKOUT_STATUS[key]?.label || key}</span>
                    <span className="text-sm font-black text-gray-600">{value || 0}</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#0b2447]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl bg-[#f8fafc] border border-gray-100 p-5">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.22em] mb-3">Tỷ lệ cần xử lý</p>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-extrabold text-[#0b2447]">{pendingRate}%</p>
                <p className="text-sm text-gray-500 mt-2">Số yêu cầu đang chờ xử lý trên tổng số yêu cầu</p>
              </div>
              <div className="w-28 h-28 rounded-full border-[10px] border-[#e2e8f0] flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#0b2447] text-white flex items-center justify-center text-lg font-extrabold">
                  {pendingRate}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 bg-white rounded-[1.75rem] border border-gray-100 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-[#0b2447]">Yêu cầu gần đây</h2>
              <p className="text-sm text-gray-500">Các yêu cầu thuê mới nhất cần theo dõi.</p>
            </div>
            <button
              onClick={() => navigate(SALE_ROUTES.RENTAL_REQUESTS)}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0b2447] hover:text-[#2563eb]"
            >
              Xem tất cả <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-[#f8fafc]">
                  {["Mã", "Khách hàng", "Phòng", "Ngày", "Trạng thái"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center text-gray-400">
                      Chưa có dữ liệu yêu cầu gần đây
                    </td>
                  </tr>
                ) : (
                  recentRequests.map((req) => (
                    <tr key={req.rawId} className="border-b border-gray-50 hover:bg-[#f9fafb] transition-colors">
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-[#0b2447] text-xs">{req.id}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            {req.ho_ten?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{req.ho_ten}</p>
                            <p className="text-xs text-gray-400">{req.loai_muc_tieu === "PHONG" ? "Thuê phòng" : "Thuê giường"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{req.roomName}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{req.date}</td>
                      <td className="px-4 py-4">
                        <SaleStatusBadge statusKey={req.trang_thai} statusMap={CHECKOUT_STATUS} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
