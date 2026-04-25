import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Eye } from "lucide-react";
import { getSaleRentalRequests } from "../../services/sale.service";
import {
  RENTAL_REQUEST_STATUS,
  RENTAL_REQUEST_STATUS_OPTIONS,
  RENTAL_TYPE_OPTIONS,
} from "../../constants/sale.constants";
import SaleStatusBadge from "../../components/sale/SaleStatusBadge";

export default function SaleRentalRequestsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    trang_thai: "all",
    loai_muc_tieu: "all",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSaleRentalRequests(filters);
      setData(res.data || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-8 lg:p-10 max-w-[1500px] mx-auto bg-[#f9fafb] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[2rem] font-extrabold text-[#1a3a5c] tracking-tight mb-2">
          Yêu cầu thuê
        </h1>
        <p className="text-gray-500">Danh sách tất cả yêu cầu thuê phòng / giường từ khách hàng.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-[11px] w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tên, SĐT, mã yêu cầu..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filters.trang_thai}
            onChange={(e) => setFilters((f) => ({ ...f, trang_thai: e.target.value }))}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {RENTAL_REQUEST_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={filters.loai_muc_tieu}
            onChange={(e) => setFilters((f) => ({ ...f, loai_muc_tieu: e.target.value }))}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {RENTAL_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-auto">
          {total} kết quả
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-[#1a3a5c] rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-[#f8fafc]">
                {["Mã YC", "Khách hàng", "Phòng / Giường", "Loại thuê", "Tiền cọc", "Ngày tạo", "Trạng thái", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    Không có yêu cầu nào
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr
                    key={row.rawId}
                    onClick={() => navigate(`/sale/rental-requests/${row.rawId}`)}
                    className="border-b border-gray-50 hover:bg-[#f9fafb] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-4">
                      <span className="font-extrabold text-[#1a3a5c] text-xs">{row.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {row.ho_ten?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{row.ho_ten}</p>
                          <p className="text-xs text-gray-400">{row.so_dien_thoai}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 font-medium">{row.roomName}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {row.loai_muc_tieu === "PHONG" ? "Thuê phòng" : "Thuê giường"}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-gray-800">{row.so_tien_dat_coc_fmt}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{row.date}</td>
                    <td className="px-4 py-4">
                      <SaleStatusBadge statusMap={RENTAL_REQUEST_STATUS} statusKey={row.trang_thai} />
                    </td>
                    <td className="px-4 py-4">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eef3f9] text-[#1a3a5c] rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Xem
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}