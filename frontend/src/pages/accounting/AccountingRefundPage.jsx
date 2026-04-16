import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Calendar, User, Banknote, Landmark, Wallet, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import {
  getRefunds,
  getRefundDetail,
  createRefund,
  updateRefund,
  getReconciliationDetail,
} from "../../services/accounting.service";
import { formatCurrency } from "../../utils/accounting.utils";

export default function AccountingRefundPage() {
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState("TRANSFER");
  const [refund, setRefund] = useState(null);
  const [reconciliation, setReconciliation] = useState(null);
  const [form, setForm] = useState({ beneficiaryName: "", refundAmount: 0, status: "PENDING" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadRefundData = async () => {
      try {
        setLoading(true);

        if (location.state?.refundId) {
          const detailResponse = await getRefundDetail(location.state.refundId);
          hydrateRefund(detailResponse.data);
          return;
        }

        if (location.state?.reconciliationId) {
          const reconciliationResponse = await getReconciliationDetail(location.state.reconciliationId);
          const detail = reconciliationResponse.data;
          setReconciliation(detail);
          setRefund(null);
          setForm({
            beneficiaryName: detail?.customerName || "",
            refundAmount: detail?.refundAmount || 0,
            status: "PENDING",
          });
          return;
        }

        const listResponse = await getRefunds({ limit: 1 });
        const firstRefund = listResponse.data?.[0];
        if (firstRefund?.id) {
          const detailResponse = await getRefundDetail(firstRefund.id);
          hydrateRefund(detailResponse.data);
        } else {
          setRefund(null);
          setReconciliation(null);
        }
      } catch (error) {
        console.error("Error loading refund data:", error);
        setRefund(null);
        setReconciliation(null);
      } finally {
        setLoading(false);
      }
    };

    loadRefundData();
  }, [location.state?.refundId, location.state?.reconciliationId]);

  const hydrateRefund = (detail) => {
    setRefund(detail || null);
    setReconciliation(detail?.reconciliation || null);
    setForm({
      beneficiaryName: detail?.beneficiaryName || detail?.customerName || "",
      refundAmount: detail?.refundAmount || 0,
      status: detail?.status || "PENDING",
    });
  };

  const handleSave = async (nextStatus) => {
    try {
      setSaving(true);

      if (refund?.id) {
        const response = await updateRefund(refund.id, {
          beneficiaryName: form.beneficiaryName,
          refundAmount: Number(form.refundAmount) || 0,
          status: nextStatus,
        });
        hydrateRefund(response.data);
      } else if (location.state?.reconciliationId) {
        const response = await createRefund({
          reconciliationId: location.state.reconciliationId,
          beneficiaryName: form.beneficiaryName,
          refundAmount: Number(form.refundAmount) || 0,
          status: nextStatus,
        });
        hydrateRefund(response.data);
      }
    } catch (error) {
      console.error("Error saving refund voucher:", error);
      window.alert("Không thể lưu phiếu hoàn cọc. Kiểm tra console để xem chi tiết.");
    } finally {
      setSaving(false);
    }
  };

  const activeSource = refund || reconciliation;

  return (
    <div className="p-8 lg:p-10 max-w-350 mx-auto bg-[#f9fafb] min-h-screen">
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-10 border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-[2.2rem] font-extrabold text-[#0b2447] tracking-tight leading-none mb-3">
            Lập phiếu hoàn cọc
          </h1>
          <p className="text-gray-500 font-medium">
            Cập nhật người thụ hưởng và phát hành phiếu hoàn cọc trực tiếp qua API backend.
          </p>
        </div>
        <button
          onClick={() => handleSave("PENDING")}
          disabled={saving || loading || !activeSource}
          className="flex items-center justify-center gap-2 px-8 py-3.5 mt-8 xl:mt-4 bg-white border border-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-sm self-start xl:self-auto disabled:opacity-60"
        >
          Lưu bản nháp
        </button>
      </div>

      {loading && <div className="py-16 text-center text-gray-400 font-medium">Đang tải dữ liệu phiếu hoàn cọc...</div>}
      {!loading && !activeSource && (
        <div className="py-16 text-center text-gray-400 font-medium">
          Chưa có dữ liệu hoàn cọc hoặc đối soát để xử lý.
        </div>
      )}

      {!loading && activeSource && (
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          <div className="flex-1 space-y-6 w-full">
            <div className="bg-white rounded-4xl shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-[#f9fafb]">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#0b2447]" strokeWidth={2.5} />
                  <h2 className="text-[14px] font-black tracking-widest text-[#0b2447] uppercase">
                    Thông tin đối tượng
                  </h2>
                </div>
                <span className="bg-gray-200 px-3 py-1 rounded-full text-[11px] font-black text-gray-600 tracking-widest">
                  ID: {refund?.id || reconciliation?.id || "--"}
                </span>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                <InfoBlock label="Tên khách hàng" value={activeSource.customerName || "--"} highlight />
                <InfoBlock label="Mã hợp đồng" value={activeSource.contractId || "--"} highlight />
                <InfoBlock label="Người thụ hưởng" value={form.beneficiaryName || "--"} />
                <InfoBlock label="Trạng thái" value={refund?.status || form.status || "PENDING"} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MoneyCard label="Tiền cọc ban đầu" value={activeSource.originalDeposit || 0} tone="light" />
              <MoneyCard label="Số tiền hoàn thực tế" value={Number(form.refundAmount) || 0} tone="dark" />
            </div>

            <div className="bg-white rounded-4xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="w-5 h-5 text-[#0b2447]" strokeWidth={2.5} />
                <h2 className="text-[14px] font-black tracking-widest text-[#0b2447] uppercase">
                  Thông tin thanh toán
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <MethodButton
                  value="TRANSFER"
                  active={paymentMethod}
                  setActive={setPaymentMethod}
                  icon={Landmark}
                  label="Chuyển khoản"
                />
                <MethodButton
                  value="CASH"
                  active={paymentMethod}
                  setActive={setPaymentMethod}
                  icon={Banknote}
                  label="Tiền mặt"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Tên người nhận">
                  <input
                    value={form.beneficiaryName}
                    onChange={(event) => setForm((prev) => ({ ...prev, beneficiaryName: event.target.value }))}
                    className="w-full bg-[#f4f7fa] border-none rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-800 outline-none"
                  />
                </Field>
                <Field label="Số tiền hoàn">
                  <input
                    type="number"
                    value={form.refundAmount}
                    onChange={(event) => setForm((prev) => ({ ...prev, refundAmount: event.target.value }))}
                    className="w-full bg-[#f4f7fa] border-none rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-800 outline-none"
                  />
                </Field>
              </div>
            </div>
          </div>

          <div className="w-full xl:w-95 shrink-0 sticky top-10 flex flex-col gap-6">
            <div className="bg-white rounded-4xl p-8 shadow-xl shadow-gray-200/50 border border-gray-50 flex flex-col gap-6">
              <SummaryRow label="Tiền cọc gốc" value={formatCurrency(activeSource.originalDeposit || 0)} />
              <SummaryRow
                label="Tổng khấu trừ"
                value={formatCurrency(activeSource.deductedAmount || 0)}
                accent="text-[#e02424]"
              />
              <div className="h-px w-full bg-gray-100"></div>
              <div className="flex items-end justify-between">
                <p className="font-black text-[13px] text-gray-900 uppercase tracking-widest pb-1">Tổng hoàn</p>
                <p className="font-black text-[2.2rem] text-[#0b2447] tracking-tight leading-none">
                  {formatCurrency(Number(form.refundAmount) || 0)}
                </p>
              </div>

              <button
                onClick={() => handleSave("COMPLETED")}
                disabled={saving}
                className="w-full bg-[#0b2447] text-white py-4 mt-2 rounded-[1.25rem] font-black text-[15px] shadow-lg shadow-[#0b2447]/20 hover:bg-[#0a1e3b] transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" /> Phát hành phiếu chi
              </button>

              <p className="text-center text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2 leading-relaxed">
                Trạng thái phiếu hoàn cọc sẽ được cập nhật trực tiếp trên backend sau khi xác nhận.
              </p>
            </div>

            <button className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-700 transition-colors py-4 font-bold text-sm">
              <XCircle className="w-4 h-4" /> Hủy bỏ phiên làm việc
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-10 right-10 w-14 h-14 bg-[#0b2447] rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer hover:scale-110 transition-transform">
        <HelpCircle className="w-6 h-6" />
      </div>
    </div>
  );
}

function InfoBlock({ label, value, highlight = false }) {
  return (
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <p
        className={`${highlight ? "font-extrabold text-[#111827] text-[1.4rem] leading-none" : "font-medium text-gray-700 text-lg leading-none"}`}
      >
        {value}
      </p>
    </div>
  );
}

function MoneyCard({ label, value, tone }) {
  if (tone === "dark") {
    return (
      <div className="bg-[#0b2447] rounded-4xl p-8 shadow-xl shadow-[#0b2447]/20 flex flex-col justify-center relative overflow-hidden text-white">
        <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-4">{label}</p>
        <span className="text-[2.5rem] font-extrabold tracking-tighter text-white leading-none">
          {formatCurrency(value)}
        </span>
        <div className="flex items-center gap-2 text-blue-200/80 mt-4">
          <Calendar className="w-4 h-4" />
          <span className="text-[11px] font-bold">Dữ liệu lấy từ phiếu hoàn cọc hoặc bảng đối soát.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-4xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{label}</p>
      <span className="text-[2.5rem] font-extrabold tracking-tighter text-[#0b2447] leading-none">
        {formatCurrency(value)}
      </span>
      <div className="flex items-center gap-2 text-gray-400 mt-4">
        <Calendar className="w-4 h-4" />
        <span className="text-[11px] font-bold">Số liệu đồng bộ từ backend kế toán.</span>
      </div>
    </div>
  );
}

function MethodButton({ value, active, setActive, icon: Icon, label }) {
  return (
    <button
      onClick={() => setActive(value)}
      className={`p-4 rounded-full flex items-center justify-center gap-3 transition-colors font-bold text-[14px] border-2 ${active === value ? "bg-[#f4f7fa] border-[#0b2447] text-[#0b2447]" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
    >
      <Icon className="w-5 h-5" strokeWidth={2} />
      {label}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, accent = "text-gray-800" }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="font-semibold text-gray-500">{label}:</span>
      <span className={`font-bold ${accent}`}>{value}</span>
    </div>
  );
}
