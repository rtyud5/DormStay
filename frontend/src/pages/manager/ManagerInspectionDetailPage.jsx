import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, XCircle, CheckCircle2, AlertCircle, Plus, Trash2,
  FileDown, Save, ClipboardCheck, Wrench, Package
} from "lucide-react";
import { getInspectionDetail, createInspectionReport } from "../../services/manager.service";

const CONDITION_OPTIONS = [
  { value: "Bình thường", color: "bg-green-500" },
  { value: "Hư hỏng", color: "bg-red-500" },
  { value: "Mất", color: "bg-gray-700" },
  { value: "Cần vệ sinh", color: "bg-yellow-500" },
];

export default function ManagerInspectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getInspectionDetail(id);
      const d = res?.data ?? null;
      setData(d);

      if (d) {
        if (d.inspection?.items?.length > 0) {
          // Already inspected — load existing items
          setItems(d.inspection.items.map(i => ({ ...i, _key: i.id || Date.now() + Math.random() })));
        } else if (d.roomAssets?.length > 0) {
          // Pre-populate from room assets
          setItems(d.roomAssets.map(a => ({
            _key: a.id,
            assetId: a.id,
            assetCode: a.assetCode,
            assetName: a.assetName,
            category: a.category,
            condition: "Bình thường",
            compensation: 0,
            defaultCompensation: a.defaultCompensation,
            note: "",
          })));
        } else {
          setItems([{ _key: Date.now(), assetName: "", condition: "Bình thường", compensation: 0, note: "" }]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = data?.inspectionStatus === "DA_KIEM_TRA";
  const totalDeduction = items.reduce((s, i) => s + (Number(i.compensation) || 0), 0);
  const totalItems = items.length;
  const normalItems = items.filter(i => i.condition === "Bình thường").length;
  const damagedItems = items.filter(i => i.condition !== "Bình thường").length;

  const addItem = () => setItems(prev => [...prev, { _key: Date.now(), assetName: "", condition: "Bình thường", compensation: 0, note: "" }]);
  const removeItem = (key) => setItems(prev => prev.filter(i => i._key !== key));
  const updateItem = (key, field, value) => {
    setItems(prev => prev.map(i => {
      if (i._key !== key) return i;
      const updated = { ...i, [field]: value };
      // Auto-fill compensation when condition changes to damaged
      if (field === "condition" && value !== "Bình thường" && i.defaultCompensation && !i.compensation) {
        updated.compensation = i.defaultCompensation;
      }
      if (field === "condition" && value === "Bình thường") {
        updated.compensation = 0;
      }
      return updated;
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await createInspectionReport({
        checkoutRequestId: Number(id),
        items: items.map(i => ({
          assetId: i.assetId,
          assetName: i.assetName,
          condition: i.condition,
          compensation: Number(i.compensation) || 0,
        })),
        totalDeduction,
        note,
      });
      if (res.success) {
        navigate(-1);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-[#0b2447] rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black tracking-widest text-[#0b2447] uppercase animate-pulse">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle className="w-16 h-16 text-gray-300 mx-auto" />
          <p className="text-gray-500 font-medium">Không tìm thấy yêu cầu kiểm tra</p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-[#0b2447] text-white rounded-xl font-bold">Quay lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl lg:text-2xl font-extrabold text-[#0b2447] tracking-tight">
          {isReadOnly ? "Chi tiết biên bản kiểm tra" : "Lập Biên Bản Kiểm Tra"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Info Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Thông tin hợp đồng</p>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <p className="text-2xl font-extrabold text-[#0b2447] mb-2">{data.contractIdDisplay}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs">Khách thuê</span>
                    <p className="font-bold text-gray-800">{data.customerName}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">Phòng / Giường</span>
                    <p className="font-bold text-gray-800">{data.roomDisplay}{data.bedDisplay ? ` — ${data.bedDisplay}` : ""}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">Ngày bắt đầu</span>
                    <p className="font-bold text-gray-800">{data.moveInDate ? new Date(data.moveInDate).toLocaleDateString("vi-VN") : "—"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">Ngày kiểm tra</span>
                    <p className="font-bold text-gray-800">
                      {data.inspection?.inspectedAt 
                        ? new Date(data.inspection.inspectedAt).toLocaleDateString("vi-VN")
                        : new Date().toLocaleDateString("vi-VN") + " (Hôm nay)"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Asset Checklist */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-blue-500" /> Danh mục kiểm tra tài sản
              </p>
              {!isReadOnly && (
                <button onClick={addItem} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  <Plus className="w-4 h-4" /> Thêm tài sản
                </button>
              )}
            </div>

            <div className="space-y-4">
              {items.map((item) => {
                const isDamaged = item.condition !== "Bình thường";
                return (
                  <div key={item._key} className={`rounded-2xl border ${isDamaged ? "border-red-200 bg-red-50/30" : "border-gray-100 bg-white"} p-5 transition-all`}>
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Icon + Name */}
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-12 h-12 rounded-xl ${isDamaged ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600"} flex items-center justify-center flex-shrink-0`}>
                          {item.category === "Điện" ? <Wrench className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          {isReadOnly ? (
                            <>
                              <p className="font-bold text-gray-800">{item.assetName}</p>
                              {item.assetCode && <p className="text-xs text-gray-400">Mã TS: {item.assetCode}</p>}
                            </>
                          ) : (
                            <input
                              value={item.assetName}
                              onChange={(e) => updateItem(item._key, "assetName", e.target.value)}
                              placeholder="Tên tài sản"
                              className="w-full px-3 py-2 bg-[#f4f7fa] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}
                        </div>
                      </div>

                      {/* Condition buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {CONDITION_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            disabled={isReadOnly}
                            onClick={() => updateItem(item._key, "condition", opt.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                              item.condition === opt.value
                                ? `${opt.color} text-white shadow-md`
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            } ${isReadOnly ? "cursor-default" : "cursor-pointer"}`}
                          >
                            {opt.value}
                          </button>
                        ))}
                      </div>

                      {/* Compensation */}
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phí bồi thường</span>
                          {isReadOnly ? (
                            <p className={`text-base font-extrabold ${item.compensation > 0 ? "text-red-600" : "text-gray-800"}`}>
                              {(item.compensation || 0).toLocaleString("vi-VN")}
                            </p>
                          ) : (
                            <input
                              type="number"
                              value={item.compensation}
                              onChange={(e) => updateItem(item._key, "compensation", Number(e.target.value))}
                              className="w-28 px-3 py-2 bg-[#f4f7fa] rounded-xl text-sm font-bold text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}
                        </div>
                        {!isReadOnly && (
                          <button onClick={() => removeItem(item._key)} className="text-red-400 hover:text-red-600 transition-colors mt-4">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Note row */}
                    {!isReadOnly && (
                      <div className="mt-3 flex items-center gap-4">
                        <input
                          value={item.note || ""}
                          onChange={(e) => updateItem(item._key, "note", e.target.value)}
                          placeholder="Ghi chú chi tiết..."
                          className="flex-1 px-3 py-2 bg-[#f4f7fa] rounded-xl text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-700 mb-1">Lưu ý quan trọng</p>
                <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside leading-relaxed">
                  <li>Phí bồi thường dựa trên bảng giá niêm yết.</li>
                  <li>Hợp đồng kết thúc cần kiểm tra kỹ ổ cắm điện.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — 1/3 */}
        <div className="space-y-6">
          {/* Total Cost Card */}
          <div className="bg-gradient-to-br from-[#0b2447] to-blue-800 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/20">
            <p className="text-[10px] font-black text-blue-200/80 uppercase tracking-widest mb-2">Tổng chi phí dự kiến</p>
            <p className="text-4xl font-black mb-6">{totalDeduction.toLocaleString("vi-VN")} <span className="text-lg">VNĐ</span></p>

            {!isReadOnly && (
              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3.5 bg-white text-[#0b2447] rounded-2xl font-extrabold hover:bg-gray-100 transition-colors disabled:opacity-60 shadow-lg"
                >
                  {submitting ? "Đang lưu..." : "Hoàn tất biên bản"}
                </button>
                <button className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-2xl font-bold hover:bg-white/20 transition-colors">
                  <Save className="w-4 h-4 inline mr-2" />Lưu nháp
                </button>
              </div>
            )}

            {isReadOnly && (
              <button className="w-full py-3.5 bg-white text-[#0b2447] rounded-2xl font-extrabold hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2">
                <FileDown className="w-4 h-4" /> Xuất Biên Bản PDF
              </button>
            )}
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-500" /> Tóm tắt kiểm tra
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Tổng số mục kiểm tra</span>
                <span className="font-extrabold text-gray-800">{totalItems}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Tình trạng bình thường</span>
                <span className="font-extrabold text-green-600">{normalItems}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Số mục hư hỏng/mất</span>
                <span className="font-extrabold text-red-600">{damagedItems > 0 ? `0${damagedItems}`.slice(-2) : "00"}</span>
              </div>
            </div>

            {/* Damaged items breakdown */}
            {damagedItems > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 italic mb-2">Chi tiết hư hại:</p>
                <div className="space-y-2">
                  {items.filter(i => i.condition !== "Bình thường").map((item) => (
                    <div key={item._key} className="flex justify-between text-xs">
                      <span className="text-gray-600">{item.assetName} ({item.condition})</span>
                      <span className="font-bold text-gray-800">
                        {(item.compensation || 0).toLocaleString("vi-VN")} VNĐ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tenant Signature (placeholder) */}
          {isReadOnly && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Xác nhận từ khách thuê</p>
              <div className="aspect-[4/3] bg-[#f9fafb] rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                <p className="text-sm text-gray-400 font-medium">Ký tên tại đây</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
