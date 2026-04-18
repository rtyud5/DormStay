import React, { useState, useEffect } from "react";
import { Search, Building2, Calendar, ClipboardList, X, Plus, Trash2 } from "lucide-react";
import { getInspections, createInspectionReport } from "../../services/manager.service";
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
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [statusTab, setStatusTab] = useState("all");
  const [floor, setFloor] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // For inspection form dialog
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const openForm = (record) => {
    setSelected(record);
    setShowForm(true);
  };

  const handleSubmitReport = async (data) => {
    try {
      setSubmitting(true);
      const res = await createInspectionReport({
        checkoutRequestId: selected.id,
        ...data,
      });
      if (res.success) {
        setShowForm(false);
        setSelected(null);
        loadData();
      }
    } finally {
      setSubmitting(false);
    }
  };

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
                              onClick={() => openForm(item)}
                              className="px-4 py-2 bg-[#0b2447] text-white rounded-xl text-xs font-bold hover:bg-blue-900 transition-colors shadow-sm"
                            >
                              Lập biên bản
                            </button>
                          ) : (
                            <button
                              onClick={() => openForm(item)}
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

      {/* Inspection Form Modal */}
      {showForm && selected && (
        <InspectionFormModal
          record={selected}
          onClose={() => { setShowForm(false); setSelected(null); }}
          onSubmit={handleSubmitReport}
          submitting={submitting}
        />
      )}
    </div>
  );
}

function InspectionFormModal({ record, onClose, onSubmit, submitting }) {
  const [items, setItems] = useState(
    record.inspection?.items?.map((i) => ({ ...i })) ?? [
      { id: Date.now(), assetName: "", condition: "Tốt", compensation: 0 },
    ]
  );
  const [note, setNote] = useState(record.note ?? "");
  const isReadOnly = record.checkoutStatus === "DA_KIEM_TRA";

  const totalDeduction = items.reduce((s, i) => s + Number(i.compensation || 0), 0);

  const addItem = () =>
    setItems((prev) => [...prev, { id: Date.now(), assetName: "", condition: "Tốt", compensation: 0 }]);

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id, field, value) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const handleSubmit = () => {
    onSubmit({ items, note, totalDeduction });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 flex items-center justify-between px-8 py-5 z-10 rounded-t-3xl">
          <div>
            <h2 className="text-lg font-extrabold text-[#0b2447]">
              {isReadOnly ? "Chi tiết biên bản kiểm tra" : "Lập biên bản kiểm tra"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {record.customerName} — {record.roomDisplay}{record.bedDisplay ? ` / ${record.bedDisplay}` : ""}
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Request info */}
          <div className="bg-[#f4f7fa] rounded-2xl p-5 grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-400 text-xs">Mã HĐ:</span><p className="font-bold text-[#0b2447]">{record.contractId}</p></div>
            <div><span className="text-gray-400 text-xs">Ngày yêu cầu:</span><p className="font-bold">{new Date(record.requestDate).toLocaleDateString("vi-VN")}</p></div>
            <div><span className="text-gray-400 text-xs">Lý do:</span><p className="font-bold">{record.reason}</p></div>
            <div><span className="text-gray-400 text-xs">Giờ bàn giao:</span><p className="font-bold">{record.handoverTime}</p></div>
          </div>

          {/* Asset items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Danh sách tài sản</p>
              {!isReadOnly && (
                <button onClick={addItem} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  <Plus className="w-4 h-4" /> Thêm tài sản
                </button>
              )}
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
                  <input
                    readOnly={isReadOnly}
                    value={item.assetName}
                    onChange={(e) => updateItem(item.id, "assetName", e.target.value)}
                    placeholder="Tên tài sản"
                    className="col-span-4 px-3 py-2.5 bg-[#f4f7fa] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  />
                  <select
                    disabled={isReadOnly}
                    value={item.condition}
                    onChange={(e) => updateItem(item.id, "condition", e.target.value)}
                    className="col-span-4 px-3 py-2.5 bg-[#f4f7fa] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-60"
                  >
                    {["Tốt", "Trầy xước nhẹ", "Hỏng nhẹ", "Bị vỡ", "Mất"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    readOnly={isReadOnly}
                    type="number"
                    value={item.compensation}
                    onChange={(e) => updateItem(item.id, "compensation", Number(e.target.value))}
                    placeholder="Bồi thường (đ)"
                    className="col-span-3 px-3 py-2.5 bg-[#f4f7fa] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  />
                  {!isReadOnly && (
                    <button onClick={() => removeItem(item.id)} className="col-span-1 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total deduction */}
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-center justify-between">
            <span className="text-sm font-bold text-orange-700">Tổng ước tính khấu trừ</span>
            <span className="text-xl font-black text-orange-600">
              {totalDeduction.toLocaleString("vi-VN")}đ
            </span>
          </div>

          {/* Note */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Ghi chú
            </label>
            <textarea
              readOnly={isReadOnly}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Nhập ghi chú nếu cần..."
              className="w-full px-4 py-3 bg-[#f4f7fa] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-60"
            />
          </div>

          {/* Actions */}
          {!isReadOnly && (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 bg-[#0b2447] text-white rounded-xl font-bold hover:bg-blue-900 transition-colors disabled:opacity-60 shadow-md shadow-blue-900/20"
              >
                {submitting ? "Đang lưu..." : "Xác nhận lập biên bản"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
