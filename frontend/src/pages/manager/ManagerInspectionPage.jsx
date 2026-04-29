import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, ClipboardList } from "lucide-react";
import { getInspections } from "../../services/manager.service";
import {
  CHECKOUT_REQUEST_STATUS,
  FLOOR_OPTIONS,
} from "../../constants/manager.constants";
import ManagerStatusBadge from "../../components/manager/ManagerStatusBadge";

const STATUS_FILTER_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "CHO_XU_LY", label: "Chờ kiểm tra" },
  { value: "DANG_KIEM_TRA", label: "Đang kiểm tra" },
  { value: "DA_KIEM_TRA", label: "Đã kiểm tra" },
  { value: "DA_THANH_LY", label: "Đã thanh lý" },
];

export default function ManagerInspectionPage() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [statusTab, setStatusTab] = useState("all");
  const [floor, setFloor] = useState("all");
  const [search, setSearch] = useState("");


  useEffect(() => {
    loadData();
  }, [statusTab, floor]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getInspections({ status: statusTab, floor, search });
      setInspections(res.data || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => loadData();

  const pendingCount = inspections.filter((i) =>
    ["CHO_XU_LY", "DANG_KIEM_TRA"].includes(i.checkoutStatus)
  ).length;

  return (
    <div className="p-8 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[2rem] font-extrabold text-[#111827] mb-2 tracking-tight">
            Kiểm tra phòng
          </h1>
          <p className="text-gray-500 font-medium">
            Lập biên bản kiểm tra tài sản khi cư dân có yêu cầu trả phòng.
          </p>
        </div>
        {/* Counter badge */}
        <div className="bg-[#0b2447] rounded-2xl px-6 py-4 flex items-center gap-4 self-start md:self-auto">
          <div>
            <p className="text-[10px] font-black text-blue-200/80 uppercase tracking-widest">
              Cần xử lý
            </p>
            <p className="text-3xl font-black text-white">{pendingCount}</p>
          </div>
          <ClipboardList className="w-8 h-8 text-white/30" />
        </div>
      </div>

      {/* Status Tabs + Filters */}
      <div className="bg-[#f4f7fa] rounded-3xl p-6 mb-8 space-y-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusTab(tab.value)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                statusTab === tab.value
                  ? "bg-[#0b2447] text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sub-filters */}
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Tên cư dân, mã HĐ, phòng..."
                className="w-full pl-11 pr-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 shadow-sm"
              />
            </div>
          </div>
          <div className="w-48">
            <div className="relative">
              <Building2 className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-gray-700 shadow-sm"
              >
                {FLOOR_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-[#0b2447] text-white rounded-xl hover:bg-blue-900 transition-colors font-bold h-12"
          >
            Lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-[#0b2447] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Mã HĐ", "Cư dân", "Phòng / Giường", "Ngày YC", "Lý do", "Trạng thái", "Thao tác"].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inspections.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-gray-400 text-sm">
                      Không có yêu cầu nào
                    </td>
                  </tr>
                ) : (
                  inspections.map((item) => {
                    const canInspect = ["CHO_XU_LY", "DANG_KIEM_TRA"].includes(item.checkoutStatus);
                    return (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-[#f9fafb] transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-extrabold text-[#0b2447] text-xs">{item.contractId}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {item.avatarInitials}
                            </div>
                            <span className="font-bold text-[#111827] text-sm">{item.customerName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 font-medium">
                          {item.roomDisplay}{item.bedDisplay ? ` — ${item.bedDisplay}` : ""}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {new Date(item.requestDate).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 max-w-[160px] truncate">{item.reason}</td>
                        <td className="px-5 py-4">
                          <ManagerStatusBadge statusMap={CHECKOUT_REQUEST_STATUS} statusKey={item.checkoutStatus} />
                        </td>
                        <td className="px-5 py-4">
                          {canInspect ? (
                            <button
                              onClick={() => navigate(`/manager/inspections/${item.id}`)}
                              className="px-4 py-2 bg-[#0b2447] text-white rounded-xl text-xs font-bold hover:bg-blue-900 transition-colors shadow-sm"
                            >
                              Lập biên bản
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/manager/inspections/${item.id}`)}
                              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                            >
                              Xem chi tiết
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 font-medium">
                Hiển thị <span className="text-gray-900 font-bold">{inspections.length}</span> yêu cầu
              </p>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
