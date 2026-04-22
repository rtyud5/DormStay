import React, { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  ArrowRightLeft,
  CalendarDays,
  ClipboardList,
  Landmark,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  createAdditionalPaymentVoucherFromReconciliation,
  createReconciliationDraft,
  createRefundVoucherFromReconciliation,
  finalizeReconciliation,
  getReconciliationWorkItemDetail,
  getReconciliationWorkItems,
  previewReconciliation,
  updateReconciliationDraft,
} from "../../services/accounting.service";
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

const SIDEBAR_FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "CHO_DOI_SOAT", label: "Chờ đối soát" },
  { value: "DANG_XU_LY", label: "Đang xử lý" },
  { value: "CAN_THU_THEM", label: "Cần thu thêm" },
  { value: "HOAN_TAT", label: "Hoàn tất" },
];

const SIDEBAR_GROUP_ORDER = ["CHO_DOI_SOAT", "DANG_XU_LY", "CAN_THU_THEM", "HOAN_TAT"];

const SIDEBAR_GROUP_LABELS = {
  CHO_DOI_SOAT: "Chờ đối soát",
  DANG_XU_LY: "Đang xử lý",
  CAN_THU_THEM: "Cần thu thêm",
  HOAN_TAT: "Hoàn tất",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "--";

const getPolicy = (reasonValue) => REFUND_POLICY_OPTIONS.find((option) => option.value === reasonValue) || null;

const computeFinancialSummary = (depositAmount, refundReason, lineItems) => {
  const policy = getPolicy(refundReason);
  const ratio = policy?.ratio || 0;
  const baseRefund = Math.round((Number(depositAmount || 0) * ratio) / 100);
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
  category: "KHAC",
  direction: "THU",
  amount: 0,
  description: "",
  sourceType: null,
  sourceId: null,
});

const cloneLineItems = (items = []) =>
  items.map((item) => ({
    category: item.category || "KHAC",
    direction: item.direction || "THU",
    amount: Number(item.amount || 0),
    description: item.description || "",
    sourceType: item.sourceType || null,
    sourceId: item.sourceId || null,
  }));

const buildInspectionSummary = (inspectionItems = []) => {
  if (!inspectionItems.length) {
    return "Chưa có dữ liệu hiện trạng.";
  }

  return inspectionItems
    .map((item) => {
      const compensation = Number(item.compensationAmount || 0);
      return compensation > 0
        ? `${item.assetName}: ${item.condition} (${formatCurrency(compensation)})`
        : `${item.assetName}: ${item.condition}`;
    })
    .join(" • ");
};

export default function AccountingReconciliationPage() {
  const [records, setRecords] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [previewSummary, setPreviewSummary] = useState(null);
  const [savingAction, setSavingAction] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const {
    control,
    register,
    reset,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      refundReason: "",
      lineItems: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
    keyName: "fieldKey",
  });

  const watchedRefundReason = watch("refundReason");
  const watchedLineItems = watch("lineItems") || [];

  const hydrateSelectedRecord = (detail) => {
    setSelectedRecord(detail || null);

    const nextLineItems = detail?.lineItems?.length
      ? detail.lineItems
      : detail?.suggestedLineItems?.length
        ? detail.suggestedLineItems
        : [];

    reset({
      refundReason: detail?.refundReason || "",
      lineItems: cloneLineItems(nextLineItems),
    });
    setPreviewSummary(null);
  };

  const loadWorkItems = async (preferredSelectedId = null) => {
    try {
      setLoadingRecords(true);
      setStatusMessage("");

      const response = await getReconciliationWorkItems();
      const items = response.data || [];
      setRecords(items);

      if (preferredSelectedId) {
        setSelectedContractId(preferredSelectedId);
      }
    } catch (error) {
      console.error("Error loading reconciliation work items:", error);
      setRecords([]);
      setSelectedContractId(null);
      hydrateSelectedRecord(null);
      setStatusMessage("Không thể tải danh sách hồ sơ đối soát từ backend.");
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    loadWorkItems();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearchKeyword(searchKeyword.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchKeyword]);

  const filteredRecords = useMemo(() => {
    const matchesFilter = (record) => {
      const isProcessing = record.workflowStatus === "DANG_LAP" || record.workflowStatus === "CHO_HANH_DONG";
      const needsAdditionalPayment = Number(record.additionalPaymentAmount || 0) > 0;

      if (filterStatus === "ALL") return true;
      if (filterStatus === "CHO_DOI_SOAT") return record.workflowStatus === "CHO_DOI_SOAT";
      if (filterStatus === "DANG_XU_LY") return isProcessing;
      if (filterStatus === "CAN_THU_THEM") return needsAdditionalPayment;
      if (filterStatus === "HOAN_TAT") return record.workflowStatus === "DA_CHOT";
      return true;
    };

    const matchesSearch = (record) => {
      if (!debouncedSearchKeyword) return true;

      return [record.customerName, record.roomDisplay, record.contractId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(debouncedSearchKeyword));
    };

    return records.filter((record) => matchesFilter(record) && matchesSearch(record));
  }, [records, filterStatus, debouncedSearchKeyword]);

  const groupedRecords = useMemo(() => {
    const grouped = {
      CHO_DOI_SOAT: [],
      DANG_XU_LY: [],
      CAN_THU_THEM: [],
      HOAN_TAT: [],
    };

    filteredRecords.forEach((record) => {
      if (Number(record.additionalPaymentAmount || 0) > 0) {
        grouped.CAN_THU_THEM.push(record);
      }

      if (record.workflowStatus === "CHO_DOI_SOAT") {
        grouped.CHO_DOI_SOAT.push(record);
      } else if (record.workflowStatus === "DA_CHOT") {
        grouped.HOAN_TAT.push(record);
      } else {
        grouped.DANG_XU_LY.push(record);
      }
    });

    return grouped;
  }, [filteredRecords]);

  useEffect(() => {
    if (!filteredRecords.length) {
      setSelectedContractId(null);
      hydrateSelectedRecord(null);
      return;
    }

    if (selectedContractId && filteredRecords.some((item) => item.checkoutRequestId === selectedContractId)) {
      return;
    }

    const processingCandidates = filteredRecords.filter((item) => item.workflowStatus === "DANG_LAP");
    const sortedProcessing = processingCandidates.sort(
      (first, second) => new Date(second.checkoutDate || 0) - new Date(first.checkoutDate || 0),
    );

    const nextSelected = sortedProcessing[0]?.checkoutRequestId || filteredRecords[0]?.checkoutRequestId || null;
    setSelectedContractId(nextSelected);
  }, [filteredRecords, selectedContractId]);

  useEffect(() => {
    if (!selectedContractId) {
      return;
    }

    const loadSelectedDetail = async () => {
      try {
        setLoadingDetail(true);
        const response = await getReconciliationWorkItemDetail(selectedContractId);
        hydrateSelectedRecord(response.data);
      } catch (error) {
        console.error("Error loading reconciliation detail:", error);
        hydrateSelectedRecord(null);
        setStatusMessage("Không thể tải chi tiết hồ sơ đối soát đã chọn.");
      } finally {
        setLoadingDetail(false);
      }
    };

    loadSelectedDetail();
  }, [selectedContractId]);

  const dashboardStats = useMemo(() => {
    const pending = records.filter((record) => record.workflowStatus === "CHO_DOI_SOAT").length;
    const drafting = records.filter((record) => record.workflowStatus === "DANG_LAP").length;
    const finalized = records.filter((record) => record.workflowStatus === "DA_CHOT").length;
    const needsAdditionalPayment = records.filter((record) => Number(record.additionalPaymentAmount || 0) > 0).length;

    return {
      pending,
      drafting,
      finalized,
      needsAdditionalPayment,
    };
  }, [records]);

  const localSummary = useMemo(
    () => computeFinancialSummary(selectedRecord?.depositAmount || 0, watchedRefundReason, watchedLineItems),
    [watchedLineItems, watchedRefundReason, selectedRecord],
  );

  useEffect(() => {
    if (!selectedRecord?.contractId) {
      setPreviewSummary(null);
      return;
    }

    if (!watchedRefundReason) {
      setPreviewSummary(null);
      return;
    }

    const previewTimer = setTimeout(async () => {
      try {
        const response = await previewReconciliation({
          contractId: selectedRecord.contractId,
          refundReason: watchedRefundReason,
          lineItems: watchedLineItems.map((item) => ({
            category: item.category,
            direction: item.direction,
            amount: Number(item.amount || 0),
            description: item.description,
            sourceType: item.sourceType || null,
            sourceId: item.sourceId || null,
          })),
        });
        setPreviewSummary(response.data || null);
      } catch (error) {
        console.error("Error previewing reconciliation:", error);
        setPreviewSummary(null);
      }
    }, 250);

    return () => clearTimeout(previewTimer);
  }, [selectedRecord?.contractId, watchedRefundReason, watchedLineItems]);

  const currentSummary = useMemo(
    () => ({
      ...localSummary,
      ...previewSummary,
      policy: previewSummary?.refundPolicy || localSummary.policy,
    }),
    [localSummary, previewSummary],
  );

  const roomConditionText = useMemo(
    () => buildInspectionSummary(selectedRecord?.inspectionItems || []),
    [selectedRecord],
  );

  const hasFormErrors = Boolean(errors.refundReason) || watchedLineItems.some((_, index) => errors.lineItems?.[index]);

  const handleAddLineItem = () => append(createBlankLineItem());

  const canSubmitForm = Boolean(selectedRecord) && !savingAction && isValid;

  const handleReloadFromBackend = () => {
    loadWorkItems(selectedContractId);
  };

  const buildDraftPayload = (values) => ({
    checkoutRequestId: selectedRecord?.checkoutRequestId,
    contractId: selectedRecord?.contractId,
    refundReason: values.refundReason,
    lineItems: (values.lineItems || []).map((item) => ({
      category: item.category,
      direction: item.direction,
      amount: Number(item.amount || 0),
      description: item.description,
      sourceType: item.sourceType || null,
      sourceId: item.sourceId || null,
    })),
  });

  const persistSelectedDraft = async (nextWorkflowStatus, values) => {
    if (!selectedRecord) {
      return;
    }

    try {
      setSavingAction(nextWorkflowStatus);
      const payload = {
        ...buildDraftPayload(values),
        status: nextWorkflowStatus,
      };

      const response = selectedRecord.reconciliationId
        ? await updateReconciliationDraft(selectedRecord.reconciliationId, payload)
        : await createReconciliationDraft(payload);

      hydrateSelectedRecord(response.data);
      await loadWorkItems(selectedRecord.checkoutRequestId);
      setStatusMessage(
        nextWorkflowStatus === "DANG_LAP"
          ? "Đã lưu bản nháp đối soát vào backend."
          : "Đã cập nhật trạng thái hồ sơ đối soát.",
      );
    } catch (error) {
      console.error("Error saving reconciliation draft:", error);
      window.alert("Không thể lưu bản nháp đối soát. Kiểm tra console để xem chi tiết.");
    } finally {
      setSavingAction("");
    }
  };

  const handleSaveDraft = handleSubmit(async (values) => {
    await persistSelectedDraft("DANG_LAP", values);
  });

  const handleFinalize = handleSubmit(async (values) => {
    if (!selectedRecord) {
      return;
    }

    try {
      setSavingAction("DA_CHOT");

      let reconciliationId = selectedRecord.reconciliationId;
      if (!reconciliationId) {
        const draftResponse = await createReconciliationDraft({
          ...buildDraftPayload(values),
          status: "DANG_LAP",
        });
        hydrateSelectedRecord(draftResponse.data);
        reconciliationId = draftResponse.data?.id;
      }

      const response = await finalizeReconciliation(reconciliationId);
      hydrateSelectedRecord(response.data);
      await loadWorkItems(selectedRecord.checkoutRequestId);
      setStatusMessage("Đã chốt kết quả đối soát trên backend.");
    } catch (error) {
      console.error("Error finalizing reconciliation:", error);
      window.alert("Không thể chốt kết quả đối soát. Kiểm tra console để xem chi tiết.");
    } finally {
      setSavingAction("");
    }
  });

  const handleCreateNextDocument = async () => {
    if (!selectedRecord?.reconciliationId) {
      window.alert("Cần lưu và chốt bảng đối soát trước khi tạo nghiệp vụ tiếp theo.");
      return;
    }

    try {
      setSavingAction("NEXT_ACTION");
      let nextMessage = "";

      if (currentSummary.additionalPaymentAmount > 0) {
        const response = await createAdditionalPaymentVoucherFromReconciliation(selectedRecord.reconciliationId);
        nextMessage = `Đã tạo phiếu thanh toán phát sinh #${response.data?.id || "--"}.`;
      } else if (currentSummary.refundAmount > 0) {
        const response = await createRefundVoucherFromReconciliation(selectedRecord.reconciliationId, {
          beneficiaryName: selectedRecord.customerName,
        });
        nextMessage = `Đã tạo phiếu hoàn cọc #${response.data?.id || "--"}.`;
      } else {
        nextMessage = "Hồ sơ này không phát sinh hoàn thêm hoặc thu thêm.";
      }

      await loadWorkItems(selectedRecord.checkoutRequestId);
      setStatusMessage(nextMessage);
    } catch (error) {
      console.error("Error creating reconciliation next-step document:", error);
      window.alert("Không thể tạo nghiệp vụ tiếp theo từ bảng đối soát. Kiểm tra console để xem chi tiết.");
    } finally {
      setSavingAction("");
    }
  };

  const selectedStatusTone =
    currentSummary.additionalPaymentAmount > 0
      ? "need-collect"
      : currentSummary.refundAmount > 0
        ? "refund"
        : "balanced";

  const currentPolicy = getPolicy(watchedRefundReason);

  const highlightKeyword = (text) => {
    const raw = String(text || "");
    if (!debouncedSearchKeyword) {
      return raw;
    }

    const escapedKeyword = debouncedSearchKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matcher = new RegExp(`(${escapedKeyword})`, "ig");
    const parts = raw.split(matcher);

    return parts.map((part, index) =>
      part.toLowerCase() === debouncedSearchKeyword ? (
        <mark key={`${raw}-${index}`} className="rounded bg-[#fff3c4] px-0.5 text-inherit">
          {part}
        </mark>
      ) : (
        <React.Fragment key={`${raw}-${index}`}>{part}</React.Fragment>
      ),
    );
  };

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
              onClick={handleReloadFromBackend}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 font-black text-gray-700 transition-colors hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" />
              Tải lại dữ liệu backend
            </button>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0b2447] px-6 py-3 font-black text-white shadow-lg shadow-[#0b2447]/15">
              <ShieldCheck className="h-4 w-4" />
              {loadingRecords || loadingDetail ? "Đang đồng bộ API đối soát" : "Đã nối API đối soát"}
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="mb-6 rounded-3xl border border-blue-100 bg-[#f4f8ff] px-5 py-4 text-sm font-semibold text-[#0b2447]">
            {statusMessage}
          </div>
        )}

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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(340px,3fr)]">
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

              <div className="border-b border-gray-100 px-5 py-5 sm:px-8 sm:py-6">
                <div className="mb-4 flex items-center gap-3 rounded-full bg-[#f4f7fa] px-5 py-3">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                    placeholder="Tìm theo tên khách, mã phòng hoặc hợp đồng"
                    className="w-full bg-transparent text-sm font-medium text-gray-700 outline-none placeholder:text-gray-400"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {SIDEBAR_FILTER_OPTIONS.map((option) => {
                    const active = filterStatus === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFilterStatus(option.value)}
                        className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-colors ${
                          active
                            ? "bg-[#0b2447] text-white"
                            : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="max-h-160 space-y-6 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
                {loadingRecords && (
                  <div className="py-8 text-sm font-medium text-gray-400">Đang tải hồ sơ đối soát từ backend...</div>
                )}

                {!loadingRecords && filteredRecords.length === 0 && (
                  <div className="py-8 text-sm font-medium text-gray-400">
                    Không có hồ sơ nào phù hợp với bộ lọc hiện tại.
                  </div>
                )}

                {!loadingRecords &&
                  SIDEBAR_GROUP_ORDER.map((groupKey) => {
                    const groupItems = groupedRecords[groupKey] || [];

                    if (!groupItems.length) {
                      return null;
                    }

                    return (
                      <div key={groupKey}>
                        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-[#7c8aa5]">
                          {SIDEBAR_GROUP_LABELS[groupKey]}
                        </p>

                        <div className="space-y-2">
                          {groupItems.map((record) => {
                            const isSelected = record.checkoutRequestId === selectedContractId;
                            const hasAdditionalPayment = Number(record.additionalPaymentAmount || 0) > 0;

                            return (
                              <button
                                key={`${groupKey}-${record.checkoutRequestId}`}
                                type="button"
                                onClick={() => setSelectedContractId(record.checkoutRequestId)}
                                className={`w-full rounded-[20px] border-l-4 px-4 py-3 text-left transition-all ${
                                  isSelected
                                    ? "border-l-[#0b2447] bg-[#f8fbff] shadow-sm"
                                    : "border-l-transparent border border-gray-100 bg-white hover:bg-[#fafcff]"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                      <h3 className="truncate text-[0.97rem] font-black text-[#111827]">
                                        {highlightKeyword(record.customerName)}
                                      </h3>
                                      <StatusBadge status={record.workflowStatus} />
                                    </div>
                                    <p className="truncate text-sm font-medium text-gray-500">
                                      {highlightKeyword(record.roomDisplay)} • {formatDate(record.checkoutDate)}
                                    </p>
                                  </div>

                                  <div className="shrink-0 text-right">
                                    <p
                                      className={`text-lg font-black ${
                                        hasAdditionalPayment ? "text-[#dc2626]" : "text-[#15803d]"
                                      }`}
                                    >
                                      {hasAdditionalPayment
                                        ? formatCurrency(record.additionalPaymentAmount || 0)
                                        : formatCurrency(record.refundAmount || 0)}
                                    </p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                      {hasAdditionalPayment ? "Thu thêm" : "Hoàn"}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>

            <section className="rounded-4xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-50 px-5 py-5 sm:px-8 sm:py-6">
                <div className="mb-3 flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-[#0b2447]" />
                  <h2 className="text-[14px] font-black uppercase tracking-widest text-[#0b2447]">
                    Form lập bảng đối soát
                  </h2>
                </div>
                <p className="text-sm font-medium text-gray-500">
                  Workflow thao tác: chọn hồ sơ → chọn chính sách hoàn cọc → nhập khoản khấu trừ/điều chỉnh → xem
                  summary bên phải → chốt.
                </p>
              </div>

              {!selectedRecord && (
                <div className="px-5 py-12 text-sm font-medium text-gray-400 sm:px-8">
                  Chọn một hồ sơ bên trên để bắt đầu lập bảng đối soát.
                </div>
              )}

              {selectedRecord && (
                <form className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
                  <section className="space-y-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#7c8aa5]">
                      Bước 1 · Thông tin hồ sơ
                    </p>
                    <div className="rounded-[26px] border border-gray-100 bg-[#fafbfd] p-5 sm:p-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <DetailRow label="Tên khách" value={selectedRecord.customerName || "--"} strong noBorder />
                        <DetailRow
                          label="Phòng / Giường"
                          value={`${selectedRecord.roomDisplay || "--"} • ${selectedRecord.bedDisplay || "--"}`}
                          noBorder
                        />
                        <DetailRow label="Ngày trả phòng" value={formatDate(selectedRecord.checkoutDate)} noBorder />
                        <DetailRow label="Số hợp đồng" value={selectedRecord.contractId || "--"} noBorder />
                      </div>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-white px-4 py-3">
                          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Ghi chú quản lý
                          </p>
                          <p className="text-sm font-medium text-gray-600">
                            {selectedRecord.managerNote || "Chưa có ghi chú quản lý."}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3">
                          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Hiện trạng tài sản
                          </p>
                          <p className="text-sm font-medium text-gray-600">{roomConditionText}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#7c8aa5]">
                      Bước 2 · Chọn chính sách hoàn cọc
                    </p>
                    <div className="space-y-3">
                      {REFUND_POLICY_OPTIONS.map((policy) => {
                        const active = watchedRefundReason === policy.value;

                        return (
                          <label
                            key={policy.value}
                            className={`flex cursor-pointer items-start justify-between gap-4 rounded-[26px] border px-5 py-4 transition-all ${
                              active
                                ? "border-[#0b2447] bg-[#edf3fb] shadow-sm"
                                : "border-gray-200 bg-white hover:bg-[#fafcff]"
                            }`}
                          >
                            <input
                              type="radio"
                              value={policy.value}
                              className="sr-only"
                              {...register("refundReason", { required: "Cần chọn chính sách hoàn cọc" })}
                            />
                            <div>
                              <p className="font-black text-[#111827]">{policy.label}</p>
                              <p className="mt-2 text-sm font-medium leading-6 text-gray-500">{policy.description}</p>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#0b2447] shadow-sm">
                              {policy.ratio}%
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.refundReason && (
                      <p className="text-sm font-semibold text-[#dc2626]">{errors.refundReason.message}</p>
                    )}
                  </section>

                  <section className="space-y-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#7c8aa5]">
                        Bước 3 · Danh sách khoản khấu trừ
                      </p>
                      <button
                        type="button"
                        onClick={handleAddLineItem}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0b2447] px-5 py-3 font-black text-white transition-colors hover:bg-[#123365]"
                      >
                        <Plus className="h-4 w-4" />
                        Thêm khoản
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-[26px] border border-gray-100">
                      <div className="min-w-230 divide-y divide-gray-100">
                        <div className="grid grid-cols-[1.2fr_0.75fr_0.9fr_1.8fr_70px] gap-3 bg-[#f9fafb] px-5 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">
                          <span>Loại khoản</span>
                          <span>Thu/Chi</span>
                          <span>Số tiền</span>
                          <span>Ghi chú</span>
                          <span className="text-center">Xóa</span>
                        </div>

                        {fields.length === 0 && (
                          <div className="px-5 py-8 text-sm font-medium text-gray-400">
                            Chưa có khoản nào. Bấm "Thêm khoản" để bắt đầu nhập.
                          </div>
                        )}

                        {fields.map((field, index) => (
                          <div
                            key={field.fieldKey}
                            className="grid grid-cols-[1.2fr_0.75fr_0.9fr_1.8fr_70px] gap-3 px-5 py-4"
                          >
                            <div>
                              <select
                                {...register(`lineItems.${index}.category`, { required: "Bắt buộc" })}
                                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition-colors focus:border-[#0b2447]"
                              >
                                {LINE_ITEM_CATEGORIES.map((category) => (
                                  <option key={category.value} value={category.value}>
                                    {category.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <select
                                {...register(`lineItems.${index}.direction`, { required: "Bắt buộc" })}
                                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition-colors focus:border-[#0b2447]"
                              >
                                <option value="THU">THU</option>
                                <option value="CHI">CHI</option>
                              </select>
                            </div>

                            <div>
                              <input
                                type="number"
                                min="0"
                                step="1000"
                                {...register(`lineItems.${index}.amount`, {
                                  required: "Bắt buộc",
                                  valueAsNumber: true,
                                  min: {
                                    value: 0,
                                    message: "Số tiền phải >= 0",
                                  },
                                  validate: (value) => Number.isFinite(value) || "Số tiền không hợp lệ",
                                })}
                                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition-colors focus:border-[#0b2447]"
                              />
                            </div>

                            <div>
                              <input
                                type="text"
                                placeholder="Nhập diễn giải nghiệp vụ"
                                {...register(`lineItems.${index}.description`, {
                                  required: "Không để trống ghi chú",
                                })}
                                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition-colors focus:border-[#0b2447]"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                            {(errors.lineItems?.[index]?.amount || errors.lineItems?.[index]?.description) && (
                              <p className="col-span-5 text-sm font-semibold text-[#dc2626]">
                                {errors.lineItems?.[index]?.amount?.message ||
                                  errors.lineItems?.[index]?.description?.message}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </form>
              )}
            </section>
          </div>

          <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <section className="overflow-hidden rounded-4xl bg-[#0b2447] text-white shadow-xl shadow-[#0b2447]/15">
              <div className="grid gap-5 px-5 py-6 sm:px-8 sm:py-8">
                <div>
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-blue-200">
                    Hồ sơ đang xử lý
                  </p>
                  <h2 className="mb-4 text-[1.5rem] font-black leading-tight sm:text-[1.75rem]">
                    {selectedRecord?.customerName || "Chưa chọn hồ sơ đối soát"}
                  </h2>
                  <div className="grid gap-3 text-sm font-semibold text-blue-100">
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

            <section className="rounded-4xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <Wallet className="h-5 w-5 text-[#0b2447]" />
                <h2 className="text-[13px] font-black uppercase tracking-widest text-[#0b2447]">Summary kết quả</h2>
              </div>

              <div className="space-y-4">
                <ResultCard
                  label="Tiền cọc ban đầu"
                  value={formatCurrency(selectedRecord?.depositAmount || 0)}
                  subtle
                />
                <ResultCard
                  label={currentPolicy ? `Mức hoàn theo policy (${currentPolicy.ratio}%)` : "Mức hoàn theo policy"}
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

              <div className="mt-5 grid gap-4">
                <div className="rounded-[28px] bg-[#eff8f2] p-6">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#15803d]">
                    Số tiền hoàn lại
                  </p>
                  <p className="text-[2rem] font-black leading-none text-[#15803d]">
                    {formatCurrency(currentSummary.refundAmount)}
                  </p>
                </div>

                <div className="rounded-[28px] bg-[#fff3f2] p-6">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#dc2626]">
                    Số tiền cần thu thêm
                  </p>
                  <p className="text-[2rem] font-black leading-none text-[#dc2626]">
                    {formatCurrency(currentSummary.additionalPaymentAmount)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-4xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#0b2447]" />
                <h2 className="text-[13px] font-black uppercase tracking-widest text-[#0b2447]">Hành động nghiệp vụ</h2>
              </div>

              {hasFormErrors && selectedRecord && (
                <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-[#b91c1c]">
                  Form chưa hợp lệ. Vui lòng kiểm tra số tiền và các trường bắt buộc trước khi chốt.
                </div>
              )}

              <div className="space-y-4">
                <ActionButton
                  title="Lưu bản nháp"
                  description="Lưu trạng thái hiện tại của form để tiếp tục xử lý sau."
                  onClick={handleSaveDraft}
                  tone="secondary"
                  disabled={!canSubmitForm}
                />
                <ActionButton
                  title="Chốt đối soát"
                  description="Khóa dữ liệu sau khi form hợp lệ và kết quả đã được xác nhận."
                  onClick={handleFinalize}
                  tone="primary"
                  disabled={!canSubmitForm}
                />
                <ActionButton
                  title={
                    currentSummary.additionalPaymentAmount > 0 ? "Tạo phiếu thanh toán phát sinh" : "Tạo phiếu hoàn cọc"
                  }
                  description="Thực hiện bước nghiệp vụ tiếp theo sau khi đối soát đã chốt."
                  onClick={handleCreateNextDocument}
                  tone="accent"
                  disabled={!selectedRecord?.reconciliationId || Boolean(savingAction)}
                />
              </div>
            </section>
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

function DetailRow({ label, value, strong = false, noBorder = false }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-3 ${noBorder ? "" : "border-b border-gray-100 last:border-0 last:pb-0"}`}
    >
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

function ActionButton({ title, description, onClick, tone = "secondary", disabled = false }) {
  const toneStyles = {
    primary: "bg-[#0b2447] text-white hover:bg-[#123365]",
    secondary: "bg-white text-[#0b2447] border border-gray-200 hover:bg-gray-50",
    accent: "bg-[#e8f4ea] text-[#166534] hover:bg-[#ddf0e0]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-[28px] px-5 py-5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${toneStyles[tone] || toneStyles.secondary}`}
    >
      <p className="font-black">{title}</p>
      <p className="mt-2 text-sm font-medium leading-6 opacity-80">{description}</p>
    </button>
  );
}
