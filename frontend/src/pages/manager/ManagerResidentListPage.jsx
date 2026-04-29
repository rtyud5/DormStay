import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, Home, Eye, Phone } from "lucide-react";
import { getResidents } from "../../services/manager.service";
import { CONTRACT_STATUS, FLOOR_OPTIONS, RENTAL_TYPE_OPTIONS } from "../../constants/manager.constants";
import ManagerStatusBadge from "../../components/manager/ManagerStatusBadge";

export default function ManagerResidentListPage() {
  const navigate = useNavigate();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ floor: "all", rentalType: "all" });

  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = async (overrideFilters) => {
    try {
      setLoading(true);
      const f = overrideFilters ?? filters;
      const res = await getResidents({ ...f, search });
      setResidents(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => loadResidents();

  return (
    <div className="p-8 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[2rem] font-extrabold text-[#111827] mb-2 tracking-tight">
          Hồ sơ cư trú
        </h1>
        <p className="text-gray-500 font-medium">
          Danh sách cư dân đang lưu trú — ấn vào hàng để xem chi tiết thông tin.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[#f4f7fa] rounded-3xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-end">
        {/* Search */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Tìm kiếm
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Tên, số điện thoại, phòng..."
              className="w-full pl-11 pr-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 shadow-sm"
            />
          </div>
        </div>

        {/* Floor filter */}
        <div className="w-44">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Tầng
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <select
              value={filters.floor}
              onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-gray-700 shadow-sm"
            >
              {FLOOR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Rental type filter */}
        <div className="w-44">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Loại thuê
          </label>
          <div className="relative">
            <Home className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <select
              value={filters.rentalType}
              onChange={(e) => setFilters({ ...filters, rentalType: e.target.value })}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-gray-700 shadow-sm"
            >
              {RENTAL_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="px-8 py-3 bg-[#0b2447] text-white rounded-xl hover:bg-blue-900 transition-colors font-bold shadow-md shadow-blue-900/20 flex items-center gap-2 h-12"
        >
          <Search className="w-4 h-4" /> Tìm kiếm
        </button>
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
                  {["Cư dân", "Phòng / Giường", "Tầng", "Loại thuê", "Ngày vào ở", "Tiền thuê", "Trạng thái HĐ", ""].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {residents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-gray-400 text-sm">
                      Không tìm thấy cư dân nào phù hợp
                    </td>
                  </tr>
                ) : (
                  residents.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => navigate(`/manager/residents/${r.id}`)}
                      className="border-b border-gray-50 hover:bg-[#f9fafb] cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {r.avatarInitials}
                          </div>
                          <div>
                            <p className="font-bold text-[#111827] text-sm">{r.customerName}</p>
                            <p className="text-xs text-gray-400">{r.phone || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                          {r.roomDisplay}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 font-medium">{r.floor ? `Tầng ${r.floor}` : "—"}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {r.rentalType === "PHONG" ? "Thuê phòng" : "Thuê giường"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {r.moveInDate ? new Date(r.moveInDate).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-extrabold text-[#111827] text-sm">
                          {(r.baseRent || 0).toLocaleString("vi-VN")}đ
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <ManagerStatusBadge statusMap={CONTRACT_STATUS} statusKey={r.status} />
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/manager/residents/${r.id}`); }}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 hover:text-blue-700 flex items-center justify-center text-gray-500 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 font-medium">
                Hiển thị <span className="text-gray-900 font-bold">{residents.length}</span> cư dân
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
