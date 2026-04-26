import React, { useEffect, useState, useCallback } from "react";
import { Search, UserCheck, UserX } from "lucide-react";
import { getSaleCustomers } from "../../services/sale.service";

export default function SaleCustomersPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSaleCustomers({ search });
      setData(res.data || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-8 lg:p-10 max-w-[1500px] mx-auto bg-[#f9fafb] min-h-screen">
      <div className="mb-8">
        <h1 className="text-[2rem] font-extrabold text-[#1a3a5c] tracking-tight mb-2">Khách hàng</h1>
        <p className="text-gray-500">Danh sách khách hàng đã đăng ký trên hệ thống.</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-[11px] w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tên, email, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-auto">
          {total} khách hàng
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
                {["Khách hàng", "Email", "Số điện thoại", "Yêu cầu", "Hợp đồng", "Ngày tạo"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Không có khách hàng nào</td></tr>
              ) : (
                data.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-[#f9fafb] transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {c.initials || "?"}
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{c.ho_ten}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{c.email}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{c.so_dien_thoai}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 font-bold">{c.so_yeu_cau}</td>
                    <td className="px-4 py-4">
                      {c.has_active_contract ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                          <UserCheck className="w-3 h-3" /> Đang thuê
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                          <UserX className="w-3 h-3" /> Chưa thuê
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{c.created_at}</td>
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