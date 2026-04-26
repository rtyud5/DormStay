import React, { useEffect, useState, useCallback } from "react";
import { Search, Filter, Plus, Clock } from "lucide-react";
import {
  getSaleCheckoutRequests,
  updateCheckoutRequestTime,
} from "../../services/sale.service";
import { CHECKOUT_STATUS, CHECKOUT_STATUS_OPTIONS } from "../../constants/sale.constants";
import SaleStatusBadge from "../../components/sale/SaleStatusBadge.jsx";

export default function SaleCheckoutRequestsPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", trang_thai: "all" });

  // Reschedule modal
  const [editRow, setEditRow] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editNote, setEditNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSaleCheckoutRequests(filters);
      setData(res.data || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleReschedule = async () => {
    if (!editRow || !editDate) return;
    setSaving(true);
    try {
      await updateCheckoutRequestTime(editRow.id, {
        ngay_yeu_cau_tra_phong: editDate,
        gio_ban_giao: editTime || null,
        ly_do: editNote || editRow.ly_do,
      });
      setEditRow(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 lg:p-10 max-w-[1500px] mx-auto bg-[#f9fafb] min-h-screen">
      <div className="mb-8">
        <h1 className="text-[2rem] font-extrabold text-[#1a3a5c] tracking-tight mb-2">
          Yêu cầu trả phòng
        </h1>
        <p className="text-gray-500">Quản lý và đổi lịch yêu cầu trả phòng từ khách hàng.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-[11px] w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tên khách, mã HĐ..."
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
            {CHECKOUT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-auto">
          {total} yêu cầu
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
                {["Mã HĐ", "Khách hàng", "Phòng", "Ngày trả phòng", "Giờ bàn giao", "Lý do", "Trạng thái", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">Không có yêu cầu nào</td></tr>
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
                    <td className="px-4 py-4 text-sm text-gray-700 font-bold">{row.ngay_yeu_cau}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{row.gio_ban_giao}</td>
                    <td className="px-4 py-4 text-sm text-gray-500 max-w-[150px] truncate">{row.ly_do}</td>
                    <td className="px-4 py-4">
                      <SaleStatusBadge statusMap={CHECKOUT_STATUS} statusKey={row.trang_thai} />
                    </td>
                    <td className="px-4 py-4">
                      {row.trang_thai === "CHO_XU_LY" && (
                        <button
                          onClick={() => {
                            setEditRow(row);
                            setEditDate("");
                            setEditTime("");
                            setEditNote("");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eef3f9] text-[#1a3a5c] rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" /> Đổi lịch
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Reschedule Modal */}
      {editRow && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-extrabold text-[#1a3a5c] mb-1">Đổi lịch trả phòng</h2>
            <p className="text-sm text-gray-500 mb-5">{editRow.contractId} · {editRow.ho_ten}</p>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Ngày trả phòng mới *</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Giờ bàn giao</label>
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Lý do / ghi chú</label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Lý do đổi lịch..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleReschedule}
                disabled={!editDate || saving}
                className="flex-1 py-3 bg-[#1a3a5c] text-white rounded-xl font-bold text-sm hover:bg-[#142d47] transition-colors disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Xác nhận đổi lịch"}
              </button>
              <button
                onClick={() => setEditRow(null)}
                className="px-5 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
              >
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}