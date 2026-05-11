import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import PageHeader from "../components/common/PageHeader";
import { formatCurrency, formatDate } from "../lib/format";
import ContractService from "../services/contract.service";
import PaymentService from "../services/payment.service";
import PayOS from "./PayOS";

const STATUS_META = {
  DA_THANH_LY: { label: "Đã thanh lý", className: "bg-slate-700 text-white" },
  DA_CHOT: { label: "Đã chốt", className: "bg-emerald-600 text-white" },
  DANG_XU_LY: { label: "Đang xử lý", className: "bg-blue-600 text-white" },
  CHO_DOI_SOAT: { label: "Chờ đối soát", className: "bg-amber-500 text-white" },
  CHUA_BAT_DAU: { label: "Chưa bắt đầu", className: "bg-slate-400 text-white" },
};

const PAYMENT_META = {
  CHO_THANH_TOAN: { label: "Chờ thanh toán", className: "bg-amber-100 text-amber-700 ring-amber-200" },
  DA_THANH_TOAN: { label: "Đã thanh toán", className: "bg-emerald-100 text-emerald-700 ring-emerald-200" },
  CHO_HOAN: { label: "Chờ hoàn", className: "bg-amber-100 text-amber-700 ring-amber-200" },
  DANG_XU_LY: { label: "Đang xử lý", className: "bg-blue-100 text-blue-700 ring-blue-200" },
  DA_HOAN: { label: "Đã hoàn", className: "bg-emerald-100 text-emerald-700 ring-emerald-200" },
};

function Badge({ value, metaMap, fallbackClassName = "bg-slate-100 text-slate-700 ring-slate-200" }) {
  const key = String(value || "").toUpperCase();
  const meta = metaMap[key] || { label: key || "Chưa cập nhật", className: fallbackClassName };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ring-1 ${meta.className}`}>{meta.label}</span>;
}

function SummaryTile({ label, value, tone = "slate" }) {
  const toneMap = {
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    rose: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <div className={`inline-flex rounded-xl px-3 py-2 text-sm font-black ${toneMap[tone]}`}>{value}</div>
    </div>
  );
}

function LiquidationCard({ item, onPay, activePaymentId, onClosePayment, onPaymentLinkCreated, onPaymentSuccess }) {
  const settlement = item.settlementVoucher || null;
  const refund = item.refundVoucher || null;
  const settlementStatus = String(settlement?.status || settlement?.trang_thai || "").toUpperCase();
  const refundStatus = String(refund?.status || refund?.trang_thai || "").toUpperCase();
  const paymentOpen =
    Boolean(settlement) &&
    activePaymentId === item.contractId &&
    item.additionalPaymentAmount > 0 &&
    settlementStatus !== "DA_THANH_TOAN";
  const unpaidAmount = Number(item.additionalPaymentAmount || 0);

  return (
    <Card
      title={`Hợp đồng #${item.contractId}`}
      description={`${item.customerName} · ${item.roomDisplay}${item.bedDisplay ? ` · ${item.bedDisplay}` : ""}`}
      actions={<Badge value={item.liquidationStatus} metaMap={STATUS_META} />}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <SummaryTile label="Tiền cọc gốc" value={formatCurrency(item.originalDeposit || 0)} tone="slate" />
        <SummaryTile label={`% được hoàn (${item.refundPolicy?.label || "Chính sách"})`} value={`${item.refundPolicy?.ratio || 0}%`} tone="blue" />
        <SummaryTile label="Hoàn trước khấu trừ" value={formatCurrency(item.baseRefund || 0)} tone="emerald" />
        <SummaryTile label="Khấu hao / phí trừ" value={formatCurrency(item.totalCharges || 0)} tone="amber" />
        <SummaryTile label="Điều chỉnh cộng/trừ" value={formatCurrency(item.totalAdjustments || 0)} tone="rose" />
        <SummaryTile label="Hoàn thực nhận" value={formatCurrency(item.refundAmount || 0)} tone="emerald" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Khấu hao / hư hại</p>
            <span className="text-[11px] font-bold text-slate-400">{item.inspectionItems?.length || 0} mục</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Tài sản</th>
                  <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Tình trạng</th>
                  <th className="px-3 py-2 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Khấu hao / phí trừ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(item.inspectionItems || []).length > 0 ? (
                  item.inspectionItems.map((row) => (
                    <tr key={row.id}>
                      <td className="px-3 py-2 font-semibold text-slate-700">{row.assetName}</td>
                      <td className="px-3 py-2 text-slate-500">{row.condition || "--"}</td>
                      <td className="px-3 py-2 text-right font-bold text-rose-600">
                        {formatCurrency(row.compensationAmount || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-center text-sm text-slate-400">
                      Chưa có biên bản khấu hao.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Các dòng đối soát</p>
            <span className="text-[11px] font-bold text-slate-400">{item.lineItems?.length || 0} mục</span>
          </div>
          <div className="space-y-2">
            {(item.lineItems || []).length > 0 ? (
              item.lineItems.map((row) => (
                <div key={row.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{row.category?.replace(/_/g, " ") || "Khác"}</p>
                    <p className="text-xs text-slate-400">{row.description || row.sourceType || "--"}</p>
                  </div>
                  <div className="text-right">
                    <span className={`mb-1 inline-flex rounded-full px-2 py-1 text-[10px] font-black uppercase ${row.direction === "THU" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {row.direction}
                    </span>
                    <p className={`text-sm font-black ${row.direction === "THU" ? "text-rose-600" : "text-emerald-600"}`}>
                      {formatCurrency(row.amount || 0)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-center text-sm text-slate-400">
                Chưa có dòng đối soát.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Thông tin thanh lý</p>
            <Badge value={item.reconciliation?.status || item.liquidationStatus} metaMap={STATUS_META} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Ngày vào ở</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{formatDate(item.moveInDate)}</p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Ngày thanh lý</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{formatDate(item.checkoutDate)}</p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Thời gian lưu trú</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{item.stayMonths || 0} tháng</p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Điểm thanh lý</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{item.contractEndDate ? formatDate(item.contractEndDate) : "--"}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Chính sách hoàn cọc</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{item.refundPolicy?.label || "--"}</p>
            <p className="mt-1 text-sm text-slate-600">
              Hoàn {item.refundPolicy?.ratio || 0}% từ cọc gốc. Số tiền cơ sở: {formatCurrency(item.baseRefund || 0)}.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">Kết quả tài chính</p>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Cọc gốc</span>
              <strong>{formatCurrency(item.originalDeposit || 0)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Khấu hao / phí trừ</span>
              <strong className="text-rose-600">{formatCurrency(item.totalCharges || 0)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Điều chỉnh</span>
              <strong className="text-emerald-600">{formatCurrency(item.totalAdjustments || 0)}</strong>
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Hoàn thực nhận</span>
              <strong className="text-lg text-emerald-700">{formatCurrency(item.refundAmount || 0)}</strong>
            </div>
            {unpaidAmount > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2">
                <span className="font-semibold text-amber-700">Cần thanh toán thêm</span>
                <strong className="text-amber-700">{formatCurrency(unpaidAmount)}</strong>
              </div>
            )}
          </div>

          {refund && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Phiếu hoàn cọc</p>
                <Badge value={refundStatus} metaMap={PAYMENT_META} />
              </div>
              <p className="text-lg font-black text-emerald-700">{formatCurrency(refund.refundAmount || refund.so_tien_hoan || 0)}</p>
              <p className="mt-2 text-sm text-emerald-800">
                Liên hệ Zalo DormStay để xác nhận thông tin nhận tiền và hoàn tất hoàn cọc.
              </p>
            </div>
          )}

          {item.additionalPaymentAmount > 0 && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-amber-700">Phiếu phát sinh</p>
                <Badge value={settlementStatus || "CHO_THANH_TOAN"} metaMap={PAYMENT_META} />
              </div>
              <p className="text-lg font-black text-amber-700">{formatCurrency(item.additionalPaymentAmount || 0)}</p>
              <p className="mt-2 text-sm text-amber-800">
                Khoản này cần thanh toán để hoàn tất thanh lý.
              </p>
              {settlement ? (
                settlementStatus !== "DA_THANH_TOAN" ? (
                  !paymentOpen ? (
                    <button
                      type="button"
                      onClick={() => onPay(item.contractId)}
                      className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                    >
                      Thanh toán phát sinh
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onClosePayment()}
                      className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                    >
                      Đóng thanh toán
                    </button>
                  )
                ) : (
                  <p className="mt-3 rounded-xl bg-emerald-100 px-4 py-3 text-center text-sm font-bold text-emerald-700">
                    Đã thanh toán phát sinh.
                  </p>
                )
              ) : (
                <p className="mt-3 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-600">
                  Chờ kế toán tạo phiếu phát sinh.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {paymentOpen && item.additionalPaymentAmount > 0 && settlementStatus !== "DA_THANH_TOAN" && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Thanh toán phát sinh</p>
              <p className="text-sm font-semibold text-slate-700">Phiếu #{settlement?.id || settlement?.ma_phieu_tt_phat_sinh || item.contractId}</p>
            </div>
            <button
              type="button"
              onClick={onClosePayment}
              className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-red-500"
              title="Đóng"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <PayOS
            amount={item.additionalPaymentAmount/1000}
            amountLabel="Số tiền phát sinh:"
            description={`Thanh toan phat sinh HD ${item.contractId}`}
            existingCheckoutUrl={settlement?.checkoutUrl}
            onPaymentLinkCreated={onPaymentLinkCreated}
            onSuccess={onPaymentSuccess}
            onCancel={onClosePayment}
          />
        </div>
      )}
    </Card>
  );
}

export default function LiquidationPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [activePaymentId, setActivePaymentId] = useState(null);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await ContractService.getLiquidations();
      setItems(res.data.data || []);
    } catch (error) {
      console.error("Failed to load liquidation page", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchStatus =
        status === "ALL" ||
        (status === "CAN_THANH_TOAN"
          ? Number(item.additionalPaymentAmount || 0) > 0 && String(item.settlementVoucher?.status || "").toUpperCase() !== "DA_THANH_TOAN"
          : status === "CHO_HOAN"
            ? Number(item.refundAmount || 0) > 0 && String(item.refundVoucher?.status || "").toUpperCase() !== "DA_HOAN"
            : status === "DA_THANH_LY"
              ? String(item.liquidationStatus || "").toUpperCase() === "DA_THANH_LY"
              : true);

      const matchSearch =
        !keyword ||
        [item.contractId, item.customerName, item.roomDisplay, item.bedDisplay]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));

      return matchStatus && matchSearch;
    });
  }, [items, search, status]);

  const summary = useMemo(
    () => ({
      total: filteredItems.length,
      needPayment: filteredItems.filter(
        (item) => Number(item.additionalPaymentAmount || 0) > 0 && String(item.settlementVoucher?.status || "").toUpperCase() !== "DA_THANH_TOAN",
      ).length,
      needRefund: filteredItems.filter(
        (item) => Number(item.refundAmount || 0) > 0 && String(item.refundVoucher?.status || "").toUpperCase() !== "DA_HOAN",
      ).length,
      completed: filteredItems.filter((item) => String(item.liquidationStatus || "").toUpperCase() === "DA_THANH_LY").length,
    }),
    [filteredItems],
  );

  const handlePay = (contractId) => {
    setActivePaymentId(contractId);
  };

  const handleClosePayment = () => {
    setActivePaymentId(null);
  };

  const handlePaymentLinkCreated = (contractId, payload) => {
    setItems((prev) =>
      prev.map((item) =>
        item.contractId === contractId
          ? {
              ...item,
              settlementVoucher: item.settlementVoucher
                ? { ...item.settlementVoucher, checkoutUrl: payload.checkoutUrl, paymentLinkId: payload.paymentLinkId }
                : { checkoutUrl: payload.checkoutUrl, paymentLinkId: payload.paymentLinkId },
            }
          : item,
      ),
    );
  };

  const handlePaymentSuccess = async (item) => {
    try {
      await PaymentService.paySettlementVoucher({
        voucherId: item.settlementVoucher?.id || item.settlementVoucher?.ma_phieu_tt_phat_sinh,
        so_tien: item.additionalPaymentAmount,
        phuong_thuc: "PAYOS",
        paymentLinkId: item.settlementVoucher?.paymentLinkId || null,
      });
      setActivePaymentId(null);
      await loadItems();
      window.alert("Thanh toán phát sinh thành công.");
    } catch (error) {
      console.error("Pay settlement failed", error);
      window.alert("Thanh toán đã ghi nhận. Tải lại trang để kiểm tra trạng thái.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center font-bold text-slate-500">Đang tải thanh lý hợp đồng...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6 pb-12 font-sans">
        <PageHeader title="Thanh lý hợp đồng" description="Phiếu phát sinh và phiếu hoàn cọc sẽ nằm ở đây." />
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
          <p className="text-xl font-black text-slate-900">Chưa có hồ sơ thanh lý</p>
          <p className="mt-3 text-sm text-slate-500">Khi Manager xác nhận thanh lý, dữ liệu sẽ hiện tại đây.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      <PageHeader
        title="Thanh lý hợp đồng"
        description="Xem chi tiết khấu hao, % được hoàn, phiếu hoàn cọc và phiếu phát sinh."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryTile label="Tổng hồ sơ" value={summary.total} tone="slate" />
        <SummaryTile label="Cần thanh toán" value={summary.needPayment} tone="amber" />
        <SummaryTile label="Cần hoàn cọc" value={summary.needRefund} tone="emerald" />
        <SummaryTile label="Đã thanh lý" value={summary.completed} tone="blue" />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã HĐ, phòng, giường, tên khách..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none ring-0 focus:border-slate-400"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "ALL", label: "Tất cả" },
            { key: "CAN_THANH_TOAN", label: "Cần thanh toán" },
            { key: "CHO_HOAN", label: "Chờ hoàn" },
            { key: "DA_THANH_LY", label: "Đã thanh lý" },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setStatus(opt.key)}
              className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
                status === opt.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {filteredItems.map((item) => (
          <div key={item.contractId} id={`contract-${item.contractId}`}>
            <LiquidationCard
              item={item}
              onPay={handlePay}
              activePaymentId={activePaymentId}
              onClosePayment={handleClosePayment}
              onPaymentLinkCreated={(payload) => handlePaymentLinkCreated(item.contractId, payload)}
              onPaymentSuccess={() => handlePaymentSuccess(item)}
            />
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-black text-slate-900">Không có hồ sơ phù hợp</p>
        </div>
      )}

      <div className="rounded-[32px] border border-slate-800 bg-[#1E293B] p-8 text-white shadow-2xl">
        <h2 className="mb-3 text-[24px] font-black">Cách đọc thanh lý</h2>
        <p className="text-sm leading-relaxed text-slate-200">
          Khấu hao là khoản bị trừ khỏi cọc gốc. Tỷ lệ hoàn cho biết phần cọc còn lại sau khi áp chính sách thời gian lưu trú.
          Nếu có phiếu phát sinh, thanh toán ngay trong trang này. Nếu có phiếu hoàn cọc, chỉ cần kiểm tra số tiền và liên hệ Zalo DormStay.
        </p>
      </div>
    </div>
  );
}
