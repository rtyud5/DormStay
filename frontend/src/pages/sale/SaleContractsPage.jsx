import React, { useEffect, useState, useCallback } from "react";
import { Search, Filter } from "lucide-react";
import { getSaleContracts } from "../../services/sale.service";
import {
  SALE_CONTRACT_STATUS,
  CONTRACT_STATUS_OPTIONS,
  RENTAL_TYPE_OPTIONS,
} from "../../constants/sale.constants";
import SaleStatusBadge from "../../components/sale/SaleStatusBadge";

export default function SaleContractsPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", trang_thai: "all" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSaleContracts(filters);
      setData(res.data || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-8 lg:p-10 max-w-[1500px] mx-auto bg-[#f9fafb] min-h-screen">
      <div className="mb-8">
        <h1 className="text-[2rem] font-extrabold text-[#1a3a5c] tracking-tight mb-2">Hợp đồng</h1>
        <p className="text-gray-500">Danh sách tất cả hợp đồng thuê phòng / giường.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-[11px] w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tên, mã HĐ, phòng..."
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
            {CONTRACT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-auto">{total} hợp đồng</span>
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
                {["Mã HĐ", "Khách hàng", "Phòng / Giường", "Ngày vào ở", "Ngày kết thúc", "Giá thuê", "Trạng thái"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">Không có hợp đồng nào</td></tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-[#f9fafb] transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-extrabold text-[#1a3a5c] text-xs">{row.contractId}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {row.initials}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{row.ho_ten}</p>
                          <p className="text-xs text-gray-400">{row.so_dien_thoai}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 font-medium">{row.roomDisplay}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{row.ngay_vao_o}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{row.ngay_ket_thuc}</td>
                    <td className="px-4 py-4 text-sm font-bold text-gray-800">{row.gia_thue}</td>
                    <td className="px-4 py-4">
                      <SaleStatusBadge statusMap={SALE_CONTRACT_STATUS} statusKey={row.trang_thai} />
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