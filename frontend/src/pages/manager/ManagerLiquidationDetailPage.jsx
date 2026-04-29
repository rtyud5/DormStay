import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, XCircle, CheckCircle2, Clock, AlertCircle,
  FileText, Building2, User, CreditCard, Shield, Banknote
} from "lucide-react";
import { getLiquidationDetail, performLiquidation } from "../../services/manager.service";

const CHECKLIST_ITEMS = [
  { id: "keys", label: "Thu hồi Chìa khóa & Thẻ từ", description: "02 chìa cơ, 01 thẻ từ thang máy" },
  { id: "bills", label: "Thanh toán công nợ cuối kỳ", description: "Điện, nước, internet đến ngày bàn giao" },
  { id: "deposit", label: "Quyết toán tiền cọc", description: "Khấu trừ hư hại (nếu có) và hoàn trả" },
  { id: "clean", label: "Xác nhận vệ sinh phòng", description: "Phòng đã được dọn sạch sẽ, không rác thải" },
];

export default function ManagerLiquidationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getLiquidationDetail(id);
      setData(res?.data ?? null);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (checkId) => {
    setCheckedItems(prev => ({ ...prev, [checkId]: !prev[checkId] }));
  };

  const allChecked = CHECKLIST_ITEMS.every(c => checkedItems[c.id]);

  const handleLiquidate = async () => {
    if (!allChecked) return;
    try {
      setSubmitting(true);
      const res = await performLiquidation(Number(id), {});
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
          <p className="text-gray-500 font-medium">Không tìm thấy thông tin thanh lý</p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-[#0b2447] text-white rounded-xl font-bold">Quay lại</button>
        </div>
      </div>
    );
  }

  const d = data;
  const isCompleted = d.checkoutStatus === "HOAN_TAT";
  const canLiquidate = !isCompleted && d.liquidationReady;

  return (
    <div className="p-6 lg:p-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl lg:text-2xl font-extrabold text-[#0b2447] tracking-tight">Thanh lý hợp đồng</h1>
      </div>

      {/* Top Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Contract Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-blue-500" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thông tin hợp đồng</p>
          </div>
          <p className="text-xs text-gray-400 mb-1">Mã hợp đồng</p>
          <p className="text-2xl font-extrabold text-[#0b2447] mb-3">#{d.contractIdDisplay}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400">Ngày bắt đầu</span>
              <p className="font-bold text-gray-800">{d.contractStartDate ? new Date(d.contractStartDate).toLocaleDateString("vi-VN") : "—"}</p>
            </div>
            <div>
              <span className="text-gray-400">Ngày kết thúc</span>
              <p className="font-bold text-gray-800">{d.contractEndDate ? new Date(d.contractEndDate).toLocaleDateString("vi-VN") : "—"}</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-blue-500" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Khách hàng</p>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {d.customerName?.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join("") || "?"}
            </div>
            <div>
              <p className="font-bold text-[#0b2447]">{d.customerName}</p>
              <p className="text-xs text-gray-400">{d.customerPhone || "—"}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Căn cước công dân</p>
          <p className="text-sm font-bold text-gray-800">{d.customerCccd || "—"}</p>
        </div>

        {/* Room Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-blue-500" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phòng & Vị trí</p>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Số phòng</p>
              <p className="text-3xl font-extrabold text-[#0b2447]">{d.roomDisplay?.replace("Phòng ", "")}</p>
            </div>
            {d.roomType && (
              <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                {d.roomType}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {d.building ? `${d.building} — ` : ""}Tầng {d.floor}
            {d.bedDisplay ? ` — ${d.bedDisplay}` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Process Steps */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              ⚙️ Trạng thái quy trình thanh lý
            </p>
            <div className="flex items-center gap-0">
              {[
                { label: "Kiểm toán (Audit)", sub: d.auditDone ? "Đã hoàn tất" : "Chưa kiểm tra", done: d.auditDone },
                { label: "Biên bản bàn giao", sub: d.inspectionDone ? "Đã ký xác nhận" : "Chưa lập", done: d.inspectionDone },
                { label: "Tài chính (Refund/Coll.)", sub: d.financialDone ? "Đã hoàn tất" : "Chờ đối soát cuối", done: d.financialDone },
              ].map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex-1 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}>
                      {step.done ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${step.done ? "text-green-700" : "text-gray-600"}`}>{step.label}</p>
                      <p className="text-[10px] text-gray-400 truncate">{step.sub}</p>
                    </div>
                  </div>
                  {idx < 2 && (
                    <div className={`w-8 h-0.5 mx-1 flex-shrink-0 ${step.done ? "bg-green-300" : "bg-gray-200"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Danh mục kiểm tra bắt buộc</p>
            <div className="space-y-4">
              {CHECKLIST_ITEMS.map((item) => {
                const checked = checkedItems[item.id] || isCompleted;
                return (
                  <button
                    key={item.id}
                    onClick={() => !isCompleted && toggleCheck(item.id)}
                    disabled={isCompleted}
                    className="w-full flex items-start gap-4 text-left group"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      checked
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-300 group-hover:bg-gray-200"
                    }`}>
                      {checked ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${checked ? "text-gray-800" : "text-gray-600"}`}>{item.label}</p>
                      <p className="text-xs text-gray-400">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-700 mb-1">GHI CHÚ QUAN TRỌNG</p>
                <p className="text-xs text-red-600 leading-relaxed">
                  Đảm bảo tất cả các mục trên được kiểm tra thực tế trước khi nhấn nút xác nhận. Việc thanh lý là hành động không thể hoàn tác trong chu kỳ thanh toán này.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — 1/3 */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="bg-gradient-to-br from-[#0b2447] to-blue-800 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/20">
            <p className="text-[10px] font-black text-blue-200/80 uppercase tracking-widest mb-4">Tổng kết tài chính</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-200/80">Tiền cọc giữ chỗ:</span>
                <span className="font-bold">{(d.depositAmount || 0).toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200/80">Công nợ tồn đọng:</span>
                <span className="font-bold text-red-300">-{(d.unpaidAmount || 0).toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200/80">Phí hư hại (nếu có):</span>
                <span className="font-bold text-red-300">-{(d.inspectionDeduction || 0).toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="w-full h-px bg-white/20" />
              <div className="flex justify-between items-center">
                <span className="text-blue-200/80 font-bold">Số tiền hoàn trả:</span>
                <span className="text-3xl font-black text-green-300">
                  {(d.finalRefundAmount || 0).toLocaleString("vi-VN")}đ
                </span>
              </div>
              {d.additionalPaymentAmount > 0 && (
                <div className="flex justify-between items-center bg-red-500/20 rounded-xl px-3 py-2 -mx-1">
                  <span className="text-red-200 text-xs font-bold">Cần thanh toán thêm:</span>
                  <span className="text-red-300 font-extrabold">{d.additionalPaymentAmount.toLocaleString("vi-VN")}đ</span>
                </div>
              )}
            </div>
          </div>

          {/* Refund Method */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Phương thức hoàn tiền</p>
            {d.bankAccount ? (
              <div className="bg-[#f4f7fa] rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Chuyển khoản ngân hàng</p>
                    <p className="text-xs text-gray-400">{d.bankName} — {d.bankAccount?.slice(0, 4)}****{d.bankAccount?.slice(-3)}</p>
                  </div>
                </div>
                {d.bankAccountHolder && (
                  <p className="text-xs text-gray-500">Chủ TK: {d.bankAccountHolder}</p>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 rounded-2xl p-4 text-center">
                <p className="text-xs text-yellow-700 font-medium">Chưa có thông tin tài khoản ngân hàng</p>
              </div>
            )}
          </div>

          {/* Confirm Button */}
          {!isCompleted && (
            <div>
              <button
                onClick={handleLiquidate}
                disabled={!allChecked || !canLiquidate || submitting}
                className={`w-full py-4 rounded-2xl font-extrabold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                  allChecked && canLiquidate
                    ? "bg-[#0b2447] text-white hover:bg-blue-900 shadow-blue-900/20"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                {submitting ? "Đang xử lý..." : "Xác nhận thanh lý hợp đồng"}
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed px-4">
                {canLiquidate
                  ? "Bằng cách nhấn xác nhận, hệ thống sẽ kết thúc hợp đồng và trả phòng / giường về trạng thái trống."
                  : "Cần có biên bản kiểm tra và đối soát kế toán đã chốt trước khi thanh lý hợp đồng."}
              </p>
            </div>
          )}

          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-green-700">Đã hoàn tất thanh lý</p>
              <p className="text-xs text-green-600 mt-1">Hợp đồng đã được chốt đối soát</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
