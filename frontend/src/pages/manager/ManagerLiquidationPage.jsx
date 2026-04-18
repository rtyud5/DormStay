import React, { useState, useEffect } from "react";
import { Search, Building2, AlertTriangle, FileCheck2, X } from "lucide-react";
import { getLiquidations, performLiquidation } from "../../services/manager.service";
import {
  LIQUIDATION_STATUS,
  INSPECTION_STATUS,
  FLOOR_OPTIONS,
} from "../../constants/manager.constants";
import ManagerStatusBadge from "../../components/manager/ManagerStatusBadge";

const STATUS_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "CHO_CHOT", label: "Chờ xử lý" },
  { value: "DA_CHOT", label: "Đã chốt" },
  { value: "HOAN_TAT", label: "Hoàn tất" },
];

export default function ManagerLiquidationPage() {
  const [liquidations, setLiquidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState("all");
  const [floor, setFloor] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusTab, floor]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getLiquidations({ status: statusTab, floor, search });
      setLiquidations(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleLiquidate = async (liquidationId) => {
    try {
      setSubmitting(true);
      const res = await performLiquidation(liquidationId, { liquidationStatus: "DA_CHOT" });
      if (res.success) {
        setShowDetail(false);
        setSelected(null);
        loadData();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = liquidations.filter((l) => l.liquidationStatus === "CHO_CHOT").length;
  const completedThisWeek = liquidations.filter((l) => l.liquidationStatus === "DA_CHOT").length;
  const totalRefund = liquidations.reduce((s, l) => s + (l.estimatedRefund || 0), 0);

  return (
    <div className="p-8 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[2rem] font-extrabold text-[#111827] mb-2 tracking-tight">
          Thanh lý hợp đồng
        </h1>
        <p className="text-gray-500 font-medium">
          Danh sách hợp đồng có yêu cầu trả phòng — thực hiện đối soát và thanh lý.
        </p>
      </div>

      {/* Status Tabs + Filters */}
      <div className="bg-[#f4f7fa] rounded-3xl p-6 mb-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
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

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadData()}
              placeholder="Tên cư dân, mã HĐ, phòng..."
              className="w-full pl-11 pr-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 shadow-sm"
            />
          </div>
          <div className="w-48 relative">
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
          <button
            onClick={loadData}
            className="px-6 py-3 bg-[#0b2447] text-white rounded-xl hover:bg-blue-900 transition-colors font-bold h-12"
          >
            Lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden mb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-[#0b2447] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Mã HĐ", "Cư dân", "Phòng / Giường", "Ngày kết thúc", "Kiểm tra TS", "Đối soát", "Thao tác"].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {liquidations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-gray-400 text-sm">
                      Không có hợp đồng nào cần thanh lý
                    </td>
                  </tr>
                ) : (
                  liquidations.map((item) => {
                    const canLiquidate =
                      item.inspectionStatus === "DA_KIEM_TRA" &&
                      item.liquidationStatus === "CHO_CHOT";
                    return (
                      <tr
                        key={item.id}
                        onClick={() => { setSelected(item); setShowDetail(true); }}
                        className="border-b border-gray-50 hover:bg-[#f9fafb] cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-4">
                          <span className="font-extrabold text-[#0b2447] text-xs">{item.contractId}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {item.avatarInitials}
                            </div>
                            <div>
                              <span className="font-bold text-[#111827] text-sm block">{item.customerName}</span>
                              <span className="text-xs text-gray-400">{item.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 font-medium">
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                            {item.roomDisplay}{item.bedDisplay ? ` — ${item.bedDisplay}` : ""}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {new Date(item.contractEndDate).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-5 py-4">
                          <ManagerStatusBadge statusMap={INSPECTION_STATUS} statusKey={item.inspectionStatus ?? "CHO_KIEM_TRA"} />
                        </td>
                        <td className="px-5 py-4">
                          <ManagerStatusBadge statusMap={LIQUIDATION_STATUS} statusKey={item.liquidationStatus} />
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(item);
                              setShowDetail(true);
                            }}
                            disabled={!canLiquidate}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                              canLiquidate
                                ? "bg-[#0b2447] text-white hover:bg-blue-900"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {item.liquidationStatus === "CHO_CHOT" && item.inspectionStatus !== "DA_KIEM_TRA"
                              ? "Chờ kiểm tra"
                              : item.liquidationStatus === "CHO_CHOT"
                              ? "Thanh lý"
                              : "Đã xử lý"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 font-medium">
                Hiển thị <span className="text-gray-900 font-bold">{liquidations.length}</span> hợp đồng
              </p>
            </div>
          </>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-orange-200 p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">CẦN CHÚ Ý</p>
            <p className="text-sm font-bold text-orange-700">
              Có {pendingCount} hợp đồng chờ thanh lý
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">ĐÃ THANH LÝ</p>
            <p className="text-3xl font-black text-gray-900">{completedThisWeek}</p>
            <p className="text-xs text-gray-400">hợp đồng hoàn tất</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-black">đ</span>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">HOÀN CỌC DỰ TÍNH</p>
            <p className="text-2xl font-black text-gray-900">
              {(totalRefund / 1_000_000).toFixed(1)}M
            </p>
            <p className="text-xs text-gray-400">tổng tiền hoàn cọc</p>
          </div>
        </div>
      </div>

      {/* Liquidation Detail Modal */}
      {showDetail && selected && (
        <LiquidationDetailModal
          record={selected}
          onClose={() => { setShowDetail(false); setSelected(null); }}
          onLiquidate={() => handleLiquidate(selected.id)}
          submitting={submitting}
        />
      )}
    </div>
  );
}

function LiquidationDetailModal({ record: r, onClose, onLiquidate, submitting }) {
  const canLiquidate = r.inspectionStatus === "DA_KIEM_TRA" && r.liquidationStatus === "CHO_CHOT";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 flex items-center justify-between px-8 py-5 z-10 rounded-t-3xl">
          <div>
            <h2 className="text-lg font-extrabold text-[#0b2447]">Chi tiết thanh lý</h2>
            <p className="text-xs text-gray-400 mt-0.5">{r.contractId} — {r.customerName}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Info grid */}
          <div className="bg-[#f4f7fa] rounded-2xl p-5 grid grid-cols-2 gap-4 text-sm">
            {[
              ["Phòng / Giường", `${r.roomDisplay}${r.bedDisplay ? ` — ${r.bedDisplay}` : ""}`],
              ["Ngày kết thúc HĐ", new Date(r.contractEndDate).toLocaleDateString("vi-VN")],
              ["Kiểm tra tài sản", r.inspectionStatus ?? "Chưa kiểm tra"],
              ["Trạng thái đối soát", r.liquidationStatus],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="font-bold text-[#111827]">{value}</p>
              </div>
            ))}
          </div>

          {/* Financial summary */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Tóng kết tài chính</p>
            <div className="space-y-3">
              {[
                { label: "Tiền cọc ban đầu", value: r.depositAmount, color: "text-gray-900" },
                { label: "Khấu trừ tài sản hỏng", value: -r.inspectionDeduction, color: "text-red-600" },
                { label: "Dự kiến hoàn lại", value: r.estimatedRefund, color: "text-green-700 font-black text-xl" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm font-medium text-gray-600">{item.label}</span>
                  <span className={`text-sm font-bold ${item.color}`}>
                    {item.value >= 0 ? "+" : ""}{Math.abs(item.value).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              ))}
            </div>
          </div>

          {r.note && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <p className="text-xs font-black text-yellow-700 uppercase tracking-widest mb-1">Ghi chú</p>
              <p className="text-sm text-yellow-800">{r.note}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
              Đóng
            </button>
            {canLiquidate && (
              <button
                onClick={onLiquidate}
                disabled={submitting}
                className="flex-1 py-3 bg-[#0b2447] text-white rounded-xl font-bold hover:bg-blue-900 transition-colors disabled:opacity-60 shadow-md shadow-blue-900/20"
              >
                {submitting ? "Đang xử lý..." : "Xác nhận thanh lý"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
