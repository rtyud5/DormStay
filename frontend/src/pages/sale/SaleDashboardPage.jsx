import React, { useEffect, useState } from "react";
import { ArrowUpRight, Clock3, Users, FileText, DoorOpen, BadgeCheck } from "lucide-react";
import { getSaleDashboard } from "../../services/sale.service";

const cards = [
  { key: "totalPendingRequests", label: "Yêu cầu đang chờ", icon: FileText },
  { key: "totalCustomers", label: "Khách hàng", icon: Users },
  { key: "activeContracts", label: "Hợp đồng hiệu lực", icon: BadgeCheck },
  { key: "pendingCheckouts", label: "Yêu cầu trả phòng", icon: DoorOpen },
  { key: "approvedThisMonth", label: "Đã duyệt trong tháng", icon: ArrowUpRight },
  { key: "rejectedThisMonth", label: "Từ chối trong tháng", icon: Clock3 },
];

export default function SaleDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getSaleDashboard();
        if (mounted) setDashboard(res?.data || null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const kpi = dashboard?.kpi || {};
  const recentRequests = dashboard?.recentRequests || [];

  return (
    <div className="p-8 lg:p-10 max-w-[1500px] mx-auto bg-[#f9fafb] min-h-screen">
      <div className="mb-8">
        <h1 className="text-[2rem] font-extrabold text-[#1a3a5c] tracking-tight mb-2">Dashboard Sale</h1>
        <p className="text-gray-500">Theo dõi yêu cầu thuê, khách hàng, hợp đồng và yêu cầu trả phòng.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-[#1a3a5c] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            {cards.map(({ key, label, icon: Icon }) => (
              <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-50 text-[#1a3a5c] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                <p className="text-3xl font-extrabold text-[#0b2447]">{kpi[key] ?? 0}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-[#0b2447] uppercase tracking-widest">Yêu cầu gần đây</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentRequests.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">Chưa có dữ liệu.</div>
              ) : (
                recentRequests.map((item) => (
                  <div key={item.rawId} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-gray-900">{item.id}</p>
                      <p className="text-sm text-gray-500">{item.ho_ten} • {item.roomName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">Trạng thái</p>
                      <p className="text-sm font-bold text-[#1a3a5c]">{item.trang_thai}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
