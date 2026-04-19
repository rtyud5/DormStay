import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRightLeft,
  BadgePercent,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Filter,
  Landmark,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  Wallet,
} from "lucide-react";
import { formatCurrency } from "../../utils/accounting.utils";

const REFUND_POLICY_OPTIONS = [
  {
    value: "NO_CONTRACT",
    label: "Đặt cọc nhưng chưa ký hợp đồng",
    ratio: 80,
    description: "Hoàn 80% tiền cọc theo chính sách hủy trước khi ký hợp đồng.",
  },
  {
    value: "EARLY_TERMINATION_SHORT_STAY",
    label: "Đã ký hợp đồng, lưu trú dưới 6 tháng",
    ratio: 50,
    description: "Hoàn 50% tiền cọc khi khách trả sớm và thời gian lưu trú dưới 6 tháng.",
  },
  {
    value: "EARLY_TERMINATION_LONG_STAY",
    label: "Đã ký hợp đồng, lưu trú từ 6 tháng trở lên",
    ratio: 70,
    description: "Hoàn 70% tiền cọc khi khách trả sớm nhưng đã lưu trú từ 6 tháng trở lên.",
  },
  {
    value: "NORMAL_COMPLETION",
    label: "Hết hạn hợp đồng",
    ratio: 100,
    description: "Hoàn 100% tiền cọc cơ bản khi hợp đồng kết thúc đúng hạn.",
  },
];

const LINE_ITEM_CATEGORIES = [
  { value: "TIEN_THUE_CON_NO", label: "Tiền thuê còn nợ" },
  { value: "TIEN_DIEN_NUOC", label: "Tiền điện nước còn nợ" },
  { value: "TIEN_DICH_VU", label: "Tiền dịch vụ còn nợ" },
  { value: "BOI_THUONG_HU_HONG", label: "Bồi thường hư hỏng" },
  { value: "PHAT_VI_PHAM", label: "Phạt vi phạm" },
  { value: "DIEU_CHINH_HOAN_THEM", label: "Điều chỉnh hoàn thêm" },
  { value: "KHAC", label: "Khoản khác" },
];

const WORKFLOW_FILTERS = [
  { value: "ALL", label: "Tất cả" },
  { value: "CHO_DOI_SOAT", label: "Chờ đối soát" },
  { value: "DANG_LAP", label: "Đang lập" },
  { value: "CHO_HANH_DONG", label: "Chờ bước tiếp theo" },
  { value: "DA_CHOT", label: "Đã chốt" },
];

const INITIAL_CASES = [
  {
    id: "REC-DRAFT-240419-01",
    checkoutRequestId: "YCTP-240419-01",
    contractId: "HD-240101-12",
    customerName: "Nguyễn Minh Khang",
    phone: "0907 118 225",
    roomDisplay: "P.302",
    bedDisplay: "Giường G2",
    moveInDate: "2025-08-15",
    checkoutDate: "2026-04-22",
    stayMonths: 8,
    depositAmount: 6000000,
    workflowStatus: "CHO_DOI_SOAT",
    refundReason: "EARLY_TERMINATION_LONG_STAY",
    inspectionStatus: "Đã kiểm tra tài sản",
    roomCondition: "Phòng sạch, tủ quần áo trầy nhẹ, mất 1 chìa khóa phụ.",
    managerNote: "Quản lý đã xác nhận khách trả phòng ngày 22/04 và đồng ý bàn giao sớm trong ngày.",
    lineItems: [
      {
        id: "li-01",
        category: "TIEN_DIEN_NUOC",
        direction: "THU",
        amount: 420000,
        description: "Chốt tiền điện, nước và internet tháng cuối",
      },
      {
        id: "li-02",
        category: "BOI_THUONG_HU_HONG",
        direction: "THU",
        amount: 250000,
        description: "Thay chìa khóa dự phòng bị mất",
      },
    ],
  },
  {
    id: "REC-DRAFT-240419-02",
    checkoutRequestId: "YCTP-240419-02",
    contractId: "HD-231001-05",
    customerName: "Trần Thu Hà",
    phone: "0912 501 119",
    roomDisplay: "P.205",
    bedDisplay: "Giường G1",
    moveInDate: "2024-10-01",
    checkoutDate: "2026-04-25",
    stayMonths: 18,
    depositAmount: 5000000,
    workflowStatus: "DANG_LAP",
    refundReason: "NORMAL_COMPLETION",
    inspectionStatus: "Đã kiểm tra tài sản",
    roomCondition: "Không phát hiện hư hỏng, tài sản bàn giao đủ.",
    managerNote: "Khách cần xác nhận hoàn cọc qua chuyển khoản trong vòng 02 ngày làm việc.",
    lineItems: [
      {
        id: "li-03",
        category: "TIEN_DICH_VU",
        direction: "THU",
        amount: 180000,
        description: "Phí vệ sinh cuối kỳ",
      },
      {
        id: "li-04",
        category: "DIEU_CHINH_HOAN_THEM",
        direction: "CHI",
        amount: 100000,
        description: "Giảm trừ do khách báo hỏng quạt đã được xử lý chậm",
      },
    ],
  },
  {
    id: "REC-DRAFT-240419-03",
    checkoutRequestId: "YCTP-240419-03",
    contractId: "HD-251201-03",
    customerName: "Lê Gia Phúc",
    phone: "0988 624 771",
    roomDisplay: "P.411",
    bedDisplay: "Giường G4",
    moveInDate: "2025-12-10",
    checkoutDate: "2026-04-21",
    stayMonths: 4,
    depositAmount: 4000000,
    workflowStatus: "CHO_HANH_DONG",
    refundReason: "EARLY_TERMINATION_SHORT_STAY",
    inspectionStatus: "Đã kiểm tra tài sản",
    roomCondition: "Vỡ mặt kính bàn học, còn nợ 01 kỳ phí dịch vụ.",
    managerNote: "Khách xin tất toán trong ngày trả phòng. Nếu thiếu cọc thì thu thêm trước khi ký thanh lý.",
    lineItems: [
      {
        id: "li-05",
        category: "TIEN_DICH_VU",
        direction: "THU",
        amount: 350000,
        description: "Phí dịch vụ chưa thanh toán",
      },
      {
        id: "li-06",
        category: "BOI_THUONG_HU_HONG",
        direction: "THU",
        amount: 2100000,
        description: "Thay mặt kính bàn học và xử lý vệ sinh phát sinh",
      },
    ],
  },
];

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "--";

const getPolicy = (reasonValue) =>
  REFUND_POLICY_OPTIONS.find((option) => option.value === reasonValue) || REFUND_POLICY_OPTIONS[3];

const computeFinancialSummary = (depositAmount, refundReason, lineItems) => {
  const policy = getPolicy(refundReason);
  const baseRefund = Math.round((Number(depositAmount || 0) * policy.ratio) / 100);
  const totalCharges = lineItems
    .filter((item) => item.direction === "THU")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalAdjustments = lineItems
    .filter((item) => item.direction === "CHI")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const refundAmount = Math.max(baseRefund - totalCharges + totalAdjustments, 0);
  const additionalPaymentAmount = Math.max(totalCharges - baseRefund - totalAdjustments, 0);

  return {
    policy,
    baseRefund,
    totalCharges,
    totalAdjustments,
    refundAmount,
    additionalPaymentAmount,
  };
};

const createBlankLineItem = () => ({
  id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  category: "KHAC",
  direction: "THU",
  amount: 0,
  description: "",
});

export default function AccountingReconciliationPage() {
  const [records, setRecords] = useState(INITIAL_CASES);
  const [selectedId, setSelectedId] = useState(INITIAL_CASES[0].id);
  const [search, setSearch] = useState("");
  const [workflowFilter, setWorkflowFilter] = useState("ALL");
  const [refundReason, setRefundReason] = useState(INITIAL_CASES[0].refundReason);
  const [lineItems, setLineItems] = useState(INITIAL_CASES[0].lineItems);

  const selectedRecord = useMemo(
    () => records.find((record) => record.id === selectedId) || records[0] || null,
    [records, selectedId],
  );

  useEffect(() => {
    if (!selectedRecord) {
      return;
    }

    setRefundReason(selectedRecord.refundReason);
    setLineItems(selectedRecord.lineItems.map((item) => ({ ...item })));
  }, [selectedRecord]);

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const matchesQuery =
          !search ||
          [record.checkoutRequestId, record.contractId, record.customerName, record.roomDisplay, record.bedDisplay]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search.toLowerCase()));

        const matchesWorkflow = workflowFilter === "ALL" || record.workflowStatus === workflowFilter;
        return matchesQuery && matchesWorkflow;
      }),
    [records, search, workflowFilter],
  );

  const dashboardStats = useMemo(() => {
    const pending = records.filter((record) => record.workflowStatus === "CHO_DOI_SOAT").length;
    const drafting = records.filter((record) => record.workflowStatus === "DANG_LAP").length;
    const finalized = records.filter((record) => record.workflowStatus === "DA_CHOT").length;
    const needsAdditionalPayment = records.filter((record) => {
      const summary = computeFinancialSummary(record.depositAmount, record.refundReason, record.lineItems);
      return summary.additionalPaymentAmount > 0;
    }).length;

    return {
      pending,
      drafting,
      finalized,
      needsAdditionalPayment,
    };
  }, [records]);

  const currentSummary = useMemo(
    () => computeFinancialSummary(selectedRecord?.depositAmount, refundReason, lineItems),
    [lineItems, refundReason, selectedRecord],
  );

  const handleLineItemChange = (lineItemId, key, value) => {
    setLineItems((currentItems) =>
      currentItems.map((item) =>
        item.id === lineItemId
          ? {
              ...item,
              [key]: key === "amount" ? Number(value || 0) : value,
            }
          : item,
      ),
    );
  };

  const handleAddLineItem = () => {
    setLineItems((currentItems) => [...currentItems, createBlankLineItem()]);
  };

  const handleRemoveLineItem = (lineItemId) => {
    setLineItems((currentItems) => currentItems.filter((item) => item.id !== lineItemId));
  };

  const handleResetDraft = () => {
    setRecords(INITIAL_CASES);
    setSelectedId(INITIAL_CASES[0].id);
  };

  const persistSelectedDraft = (nextWorkflowStatus) => {
    if (!selectedRecord) {
      return;
    }

    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === selectedRecord.id
          ? {
              ...record,
              workflowStatus: nextWorkflowStatus,
              refundReason,
              lineItems: lineItems.map((item) => ({ ...item })),
            }
          : record,
      ),
    );
  };

  const selectedStatusTone =
    currentSummary.additionalPaymentAmount > 0
      ? "need-collect"
      : currentSummary.refundAmount > 0
        ? "refund"
        : "balanced";

  return (
    <div className="min-h-screen bg-[#f7f8fa] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.28em] text-[#7c8aa5]">
              Accounting Workspace
            </p>
            <h1 className="mb-3 text-[2rem] font-black leading-none tracking-tight text-[#0b2447] sm:text-[2.3rem] xl:text-[2.5rem]">
              Lập bảng đối soát trả phòng
            </h1>
            <p className="max-w-3xl text-[15px] font-medium leading-7 text-gray-500">
              Giao diện mới tập trung đúng quy trình thanh lý: chọn hồ sơ trả phòng, áp dụng tỷ lệ hoàn cọc, tổng hợp
              khấu trừ, xác định số tiền hoàn lại hoặc số tiền khách phải thanh toán thêm.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <button
              onClick={handleResetDraft}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 font-black text-gray-700 transition-colors hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" />
              Khôi phục giao diện mẫu
            </button>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0b2447] px-6 py-3 font-black text-white shadow-lg shadow-[#0b2447]/15">
              <ShieldCheck className="h-4 w-4" />
              Chưa nối API, đang chốt format nghiệp vụ
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <StatCard
            label="Hồ sơ chờ đối soát"
            value={dashboardStats.pending}
            description="Các yêu cầu trả phòng đã đủ điều kiện để kế toán bắt đầu lập bảng đối soát."
          />
          <StatCard
            label="Đang lập"
            value={dashboardStats.drafting}
            description="Những hồ sơ đang được nhập line item khấu trừ hoặc điều chỉnh."
          />
          <StatCard
            label="Cần thu thêm"
            value={dashboardStats.needsAdditionalPayment}
            description="Số hồ sơ có tổng khấu trừ lớn hơn mức hoàn cọc cơ bản."
            danger
          />
          <StatCard
            label="Đã chốt"
            value={dashboardStats.finalized}
            description="Hồ sơ đã hoàn tất bước đối soát và sẵn sàng chuyển nghiệp vụ tiếp theo."
            dark
          />
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-4xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-full bg-[#f4f7fa] px-5 py-3">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo mã yêu cầu trả phòng, hợp đồng, khách thuê hoặc phòng"
              className="w-full bg-transparent text-sm font-medium text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>

          <label className="inline-flex items-center gap-3 rounded-full border border-gray-200 px-5 py-3 text-sm font-black text-gray-700 transition-colors hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            <select
              value={workflowFilter}
              onChange={(event) => setWorkflowFilter(event.target.value)}
              className="bg-transparent outline-none"
            >
              {WORKFLOW_FILTERS.map((filterOption) => (
                <option key={filterOption.value} value={filterOption.value}>
                  {filterOption.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[0.92fr_1.38fr]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-4xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-50 bg-[#f9fafb] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
                <div>
                  <h2 className="text-[14px] font-black uppercase tracking-widest text-[#0b2447]">
                    Danh sách hồ sơ cần đối soát
                  </h2>
                  <p className="mt-2 text-sm font-medium text-gray-500">
                    Chọn một hồ sơ để lập bảng đối soát chi tiết ở cột bên phải.
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-gray-500">
                  {filteredRecords.length} hồ sơ
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredRecords.length === 0 && (
                  <div className="px-5 py-12 text-sm font-medium text-gray-400 sm:px-8">
                    Không có hồ sơ nào phù hợp với bộ lọc hiện tại.
                  </div>
                )}

                {filteredRecords.map((record) => {
                  const summary = computeFinancialSummary(record.depositAmount, record.refundReason, record.lineItems);
                  const isSelected = record.id === selectedId;

                  return (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => setSelectedId(record.id)}
                      className={`w-full px-5 py-5 text-left transition-colors sm:px-8 sm:py-6 ${isSelected ? "bg-[#f8fbff]" : "hover:bg-[#fafcff]"}`}
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edf3fb] text-sm font-black text-[#0b2447]">
                            {record.customerName
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((word) => word[0])
                              .join("")}
                          </div>

                          <div>
                            <div className="mb-2 flex flex-wrap items-center gap-3">
                              <h3 className="text-[1.02rem] font-black text-[#111827]">{record.customerName}</h3>
                              <StatusBadge status={record.workflowStatus} />
                            </div>
                            <p className="text-sm font-semibold text-gray-500">
                              {record.checkoutRequestId} • {record.contractId}
                            </p>
                            <p className="mt-2 text-sm font-medium text-gray-500">
                              {record.roomDisplay} • {record.bedDisplay} • Trả phòng {formatDate(record.checkoutDate)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="text-right">
                            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                              Kết quả tạm tính
                            </p>
                            <p
                              className={`text-lg font-black ${
                                summary.additionalPaymentAmount > 0 ? "text-[#dc2626]" : "text-[#15803d]"
                              }`}
                            >
                              {summary.additionalPaymentAmount > 0
                                ? `Thu thêm ${formatCurrency(summary.additionalPaymentAmount)}`
                                : `Hoàn ${formatCurrency(summary.refundAmount)}`}
                            </p>
                          </div>
                          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200">
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-4xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-[#0b2447]" />
                <h2 className="text-[13px] font-black uppercase tracking-widest text-[#0b2447]">
                  Luồng thao tác đề xuất
                </h2>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <WorkflowStep
                  step="01"
                  title="Nhận hồ sơ"
                  description="Chọn yêu cầu trả phòng đã kiểm tra tài sản và đã đủ dữ liệu hợp đồng."
                />
                <WorkflowStep
                  step="02"
                  title="Lập đối soát"
                  description="Áp dụng tỷ lệ hoàn cọc, nhập line item khấu trừ và xem ngay kết quả."
                />
                <WorkflowStep
                  step="03"
                  title="Chuyển nghiệp vụ"
                  description="Sau khi chốt sẽ tạo phiếu hoàn cọc hoặc phiếu thanh toán phát sinh."
                />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="overflow-hidden rounded-4xl bg-[#0b2447] text-white shadow-xl shadow-[#0b2447]/15">
              <div className="grid gap-5 px-5 py-6 sm:px-8 sm:py-8 xl:grid-cols-[1.35fr_0.9fr]">
                <div>
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-blue-200">
                    Hồ sơ đang xử lý
                  </p>
                  <h2 className="mb-4 text-[1.5rem] font-black leading-tight sm:text-[1.75rem]">
                    {selectedRecord?.customerName || "Chưa chọn hồ sơ đối soát"}
                  </h2>
                  <div className="grid gap-3 text-sm font-semibold text-blue-100 lg:grid-cols-2">
                    <InfoChip icon={ReceiptText} text={`Yêu cầu: ${selectedRecord?.checkoutRequestId || "--"}`} />
                    <InfoChip icon={Landmark} text={`Hợp đồng: ${selectedRecord?.contractId || "--"}`} />
                    <InfoChip
                      icon={CalendarDays}
                      text={`Ngày trả phòng: ${formatDate(selectedRecord?.checkoutDate)}`}
                    />
                    <InfoChip
                      icon={ArrowRightLeft}
                      text={`${selectedRecord?.roomDisplay || "--"} • ${selectedRecord?.bedDisplay || "--"}`}
                    />
                  </div>
                </div>

                <div className="rounded-[28px] bg-white/10 p-5 backdrop-blur-sm">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-blue-200">
                    Kết luận hiện tại
                  </p>
                  <p className="mb-4 text-[1.8rem] font-black leading-none text-white">
                    {selectedStatusTone === "need-collect"
                      ? formatCurrency(currentSummary.additionalPaymentAmount)
                      : formatCurrency(currentSummary.refundAmount)}
                  </p>
                  <p className="text-sm font-medium leading-6 text-blue-100">
                    {selectedStatusTone === "need-collect"
                      ? "Khách cần thanh toán thêm trước khi hoàn tất thanh lý hợp đồng."
                      : selectedStatusTone === "refund"
                        ? "Sau khấu trừ vẫn còn số dư để thực hiện hoàn cọc cho khách thuê."
                        : "Số tiền cọc và khấu trừ cân bằng, không phát sinh hoàn thêm hoặc thu thêm."}
                  </p>
                </div>
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
              <section className="rounded-4xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <BadgePercent className="h-5 w-5 text-[#0b2447]" />
                  <h2 className="text-[13px] font-black uppercase tracking-widest text-[#0b2447]">
                    Tỷ lệ hoàn cọc cơ bản
                  </h2>
                </div>

                <div className="space-y-3">
                  {REFUND_POLICY_OPTIONS.map((policy) => (
                    <button
                      key={policy.value}
                      type="button"
                      onClick={() => setRefundReason(policy.value)}
                      className={`w-full rounded-[26px] border px-5 py-4 text-left transition-all ${
                        refundReason === policy.value
                          ? "border-[#0b2447] bg-[#edf3fb] shadow-sm"
                          : "border-gray-200 bg-white hover:bg-[#fafcff]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-black text-[#111827]">{policy.label}</p>
                          <p className="mt-2 text-sm font-medium leading-6 text-gray-500">{policy.description}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#0b2447] shadow-sm">
                          {policy.ratio}%
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-4xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-[#0b2447]" />
                  <h2 className="text-[13px] font-black uppercase tracking-widest text-[#0b2447]">Thông tin nền</h2>
                </div>

                <div className="space-y-4">
                  <DetailRow
                    label="Tiền cọc ban đầu"
                    value={formatCurrency(selectedRecord?.depositAmount || 0)}
                    strong
                  />
                  <DetailRow label="Số tháng lưu trú" value={`${selectedRecord?.stayMonths || 0} tháng`} />
                  <DetailRow label="Ngày vào ở" value={formatDate(selectedRecord?.moveInDate)} />
                  <DetailRow label="Trạng thái kiểm tra" value={selectedRecord?.inspectionStatus || "--"} />
                </div>

                <div className="mt-6 rounded-[26px] bg-[#f7f9fc] p-5">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Ghi chú quản lý</p>
                  <p className="text-sm font-medium leading-7 text-gray-600">
                    {selectedRecord?.managerNote || "Chưa có ghi chú quản lý."}
                  </p>
                </div>

                <div className="mt-4 rounded-[26px] border border-dashed border-gray-200 p-5">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Hiện trạng tài sản
                  </p>
                  <p className="text-sm font-medium leading-7 text-gray-600">
                    {selectedRecord?.roomCondition || "Chưa có dữ liệu hiện trạng."}
                  </p>
                </div>
              </section>
            </div>

            <section className="rounded-4xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-50 px-5 py-5 sm:px-8 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-[14px] font-black uppercase tracking-widest text-[#0b2447]">
                    Chi tiết khấu trừ và điều chỉnh
                  </h2>
                  <p className="mt-2 text-sm font-medium text-gray-500">
                    Mỗi dòng thể hiện một khoản khấu trừ hoặc điều chỉnh có lợi cho khách hàng.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0b2447] px-5 py-3 font-black text-white transition-colors hover:bg-[#123365]"
                >
                  <Plus className="h-4 w-4" />
                  Thêm khoản mục
                </button>
              </div>

              <div className="overflow-x-auto px-3 py-4 sm:px-4 lg:px-6">
                <div className="min-w-230 divide-y divide-gray-100 rounded-[28px] border border-gray-100">
                  <div className="grid grid-cols-[1.2fr_0.75fr_0.85fr_1.8fr_70px] gap-3 bg-[#f9fafb] px-5 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">
                    <span>Danh mục</span>
                    <span>Hướng</span>
                    <span>Số tiền</span>
                    <span>Diễn giải</span>
                    <span className="text-center">Xóa</span>
                  </div>

                  {lineItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-[1.2fr_0.75fr_0.85fr_1.8fr_70px] gap-3 px-5 py-4">
                      <select
                        value={item.category}
                        onChange={(event) => handleLineItemChange(item.id, "category", event.target.value)}
                        className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition-colors focus:border-[#0b2447]"
                      >
                        {LINE_ITEM_CATEGORIES.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>

                      <select
                        value={item.direction}
                        onChange={(event) => handleLineItemChange(item.id, "direction", event.target.value)}
                        className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition-colors focus:border-[#0b2447]"
                      >
                        <option value="THU">THU</option>
                        <option value="CHI">CHI</option>
                      </select>

                      <input
                        type="number"
                        min="0"
                        value={item.amount}
                        onChange={(event) => handleLineItemChange(item.id, "amount", event.target.value)}
                        className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition-colors focus:border-[#0b2447]"
                      />

                      <input
                        type="text"
                        value={item.description}
                        onChange={(event) => handleLineItemChange(item.id, "description", event.target.value)}
                        placeholder="Nhập diễn giải nghiệp vụ"
                        className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition-colors focus:border-[#0b2447]"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(item.id)}
                        className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <section className="rounded-4xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <ArrowRightLeft className="h-5 w-5 text-[#0b2447]" />
                  <h2 className="text-[13px] font-black uppercase tracking-widest text-[#0b2447]">
                    Kết quả đối soát tạm tính
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <ResultCard
                    label="Tiền cọc ban đầu"
                    value={formatCurrency(selectedRecord?.depositAmount || 0)}
                    subtle
                  />
                  <ResultCard
                    label={`Mức hoàn cơ bản (${currentSummary.policy.ratio}%)`}
                    value={formatCurrency(currentSummary.baseRefund)}
                    accent="blue"
                  />
                  <ResultCard label="Tổng khấu trừ" value={formatCurrency(currentSummary.totalCharges)} accent="red" />
                  <ResultCard
                    label="Điều chỉnh trả thêm cho khách"
                    value={formatCurrency(currentSummary.totalAdjustments)}
                    accent="green"
                  />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[28px] bg-[#eff8f2] p-6">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#15803d]">
                      Số tiền hoàn lại
                    </p>
                    <p className="text-[2rem] font-black leading-none text-[#15803d]">
                      {formatCurrency(currentSummary.refundAmount)}
                    </p>
                    <p className="mt-3 text-sm font-medium leading-6 text-[#166534]">
                      Áp dụng khi phần cọc còn dư sau khi trừ hết các khoản phát sinh.
                    </p>
                  </div>

                  <div className="rounded-[28px] bg-[#fff3f2] p-6">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#dc2626]">
                      Số tiền cần thu thêm
                    </p>
                    <p className="text-[2rem] font-black leading-none text-[#dc2626]">
                      {formatCurrency(currentSummary.additionalPaymentAmount)}
                    </p>
                    <p className="mt-3 text-sm font-medium leading-6 text-[#991b1b]">
                      Áp dụng khi các khoản khấu trừ lớn hơn mức hoàn cọc cơ bản.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-4xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#0b2447]" />
                  <h2 className="text-[13px] font-black uppercase tracking-widest text-[#0b2447]">
                    Hành động nghiệp vụ
                  </h2>
                </div>

                <div className="space-y-4">
                  <ActionButton
                    title="Lưu bản nháp đối soát"
                    description="Ghi nhận lại tỷ lệ hoàn cọc và danh sách line item đang nhập."
                    onClick={() => persistSelectedDraft("DANG_LAP")}
                    tone="secondary"
                  />
                  <ActionButton
                    title="Chốt kết quả đối soát"
                    description="Khóa số liệu tạm tính để chuyển qua bước hoàn cọc hoặc thu thêm."
                    onClick={() => persistSelectedDraft("DA_CHOT")}
                    tone="primary"
                  />
                  <ActionButton
                    title={
                      currentSummary.additionalPaymentAmount > 0
                        ? "Sẵn sàng tạo phiếu thanh toán phát sinh"
                        : "Sẵn sàng tạo phiếu hoàn cọc"
                    }
                    description={
                      currentSummary.additionalPaymentAmount > 0
                        ? "Sau khi nối API mới, nút này sẽ sinh nghiệp vụ thu thêm cho khách thuê."
                        : "Sau khi nối API mới, nút này sẽ sinh phiếu hoàn cọc từ kết quả đối soát đã chốt."
                    }
                    onClick={() => persistSelectedDraft("CHO_HANH_DONG")}
                    tone="accent"
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, description, dark = false, danger = false }) {
  if (dark) {
    return (
      <div className="relative overflow-hidden rounded-4xl bg-[#0b2447] p-6 text-white shadow-xl shadow-[#0b2447]/20 sm:p-8">
        <p className="relative z-10 mb-3 text-[10px] font-black uppercase tracking-widest text-blue-200">{label}</p>
        <div className="relative z-10 text-[2.4rem] font-black leading-none">{value}</div>
        <p className="relative z-10 mt-4 text-sm font-medium text-blue-100">{description}</p>
      </div>
    );
  }

  return (
    <div className="rounded-4xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      <div className={`text-[2.4rem] font-black leading-none ${danger ? "text-[#dc2626]" : "text-[#0b2447]"}`}>
        {value}
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500">{description}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const toneMap = {
    CHO_DOI_SOAT: "bg-[#fff7ed] text-[#b45309]",
    DANG_LAP: "bg-[#eff6ff] text-[#1d4ed8]",
    CHO_HANH_DONG: "bg-[#fef3c7] text-[#92400e]",
    DA_CHOT: "bg-[#ecfdf3] text-[#15803d]",
  };

  const labelMap = {
    CHO_DOI_SOAT: "Chờ đối soát",
    DANG_LAP: "Đang lập",
    CHO_HANH_DONG: "Chờ bước tiếp theo",
    DA_CHOT: "Đã chốt",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest ${toneMap[status] || "bg-gray-100 text-gray-600"}`}
    >
      {labelMap[status] || status}
    </span>
  );
}

function InfoChip({ icon: Icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-3 sm:px-4">
      <Icon className="h-4 w-4 text-blue-200" />
      <span className="truncate">{text}</span>
    </div>
  );
}

function WorkflowStep({ step, title, description }) {
  return (
    <div className="rounded-[26px] border border-gray-100 bg-[#fafbfd] p-5">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#7c8aa5]">Bước {step}</p>
      <p className="mb-2 text-lg font-black text-[#0b2447]">{title}</p>
      <p className="text-sm font-medium leading-6 text-gray-500">{description}</p>
    </div>
  );
}

function DetailRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-3 last:border-0 last:pb-0">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className={`text-right text-sm font-bold ${strong ? "text-[#0b2447]" : "text-[#111827]"}`}>{value}</span>
    </div>
  );
}

function ResultCard({ label, value, accent = "default", subtle = false }) {
  const accentStyles = {
    default: "bg-[#f8fafc] text-[#0f172a]",
    blue: "bg-[#eff6ff] text-[#1d4ed8]",
    red: "bg-[#fff1f2] text-[#dc2626]",
    green: "bg-[#ecfdf3] text-[#15803d]",
  };

  return (
    <div
      className={`rounded-[28px] p-6 ${subtle ? "border border-gray-100 bg-white" : accentStyles[accent] || accentStyles.default}`}
    >
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-gray-400">{label}</p>
      <p className="text-[1.7rem] font-black leading-none">{value}</p>
    </div>
  );
}

function ActionButton({ title, description, onClick, tone = "secondary" }) {
  const toneStyles = {
    primary: "bg-[#0b2447] text-white hover:bg-[#123365]",
    secondary: "bg-white text-[#0b2447] border border-gray-200 hover:bg-gray-50",
    accent: "bg-[#e8f4ea] text-[#166534] hover:bg-[#ddf0e0]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[26px] px-5 py-4 text-left transition-colors ${toneStyles[tone] || toneStyles.secondary}`}
    >
      <p className="font-black">{title}</p>
      <p className="mt-2 text-sm font-medium leading-6 opacity-80">{description}</p>
    </button>
  );
}
