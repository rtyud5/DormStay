const { supabase } = require("../../config/supabase");
const { AppError } = require("../../utils/errors");

const TABLES = {
  checkoutRequests: "yeu_cau_tra_phong",
  inspections: "bien_ban_kiem_tra",
  inspectionItems: "chi_tiet_kiem_tra",
  reconciliations: "doi_soat_tai_chinh",
  reconciliationItems: "chi_tiet_doi_soat_tai_chinh",
  refunds: "phieu_hoan_coc",
  settlementPayments: "phieu_thanh_toan_phat_sinh",
  contracts: "hop_dong",
  invoices: "hoa_don",
  profiles: "ho_so",
  rooms: "phong",
  beds: "giuong",
};

const PAGE_SPEC = {
  id: "accounting-reconciliation-page",
  frontendPageName: "AccountingReconciliationPage",
  frontendFile: "frontend/src/pages/accounting/AccountingReconciliationPage.jsx",
  routePath: "/accounting/reconciliation",
  reviewStatus: "IN_PROGRESS",
  apiStatus: "PARTIALLY_ENABLED",
  purpose: "Checkout reconciliation workbench for refund calculation, deductions, and next-step accounting actions.",
  reviewFocus: [
    "Work-item APIs are enabled first for reconciliation only.",
    "Refund-rule preview is computed on backend and can be mirrored on frontend for UX.",
    "Draft, finalize, refund creation, and additional payment creation are split into explicit APIs.",
  ],
};

function ensureClient() {
  if (!supabase) {
    throw new AppError("Supabase is not configured", 500);
  }
}

function toNumber(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function roundMoney(value) {
  return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
}

function includesAny(rawValue, candidates = []) {
  const value = String(rawValue || "").toUpperCase();
  return candidates.some((candidate) => value.includes(candidate));
}

function indexBy(rows, key) {
  return rows.reduce((accumulator, row) => {
    accumulator[row[key]] = row;
    return accumulator;
  }, {});
}

function groupBy(rows, key) {
  return rows.reduce((accumulator, row) => {
    const groupKey = row[key];
    if (!accumulator[groupKey]) {
      accumulator[groupKey] = [];
    }
    accumulator[groupKey].push(row);
    return accumulator;
  }, {});
}

async function fetchByIds(tableName, idField, ids, columns = "*") {
  ensureClient();

  if (!ids.length) {
    return [];
  }

  const { data, error } = await supabase.from(tableName).select(columns).in(idField, ids);
  if (error) {
    throw error;
  }

  return data || [];
}

async function fetchOne(tableName, idField, id, columns = "*") {
  ensureClient();

  const { data, error } = await supabase.from(tableName).select(columns).eq(idField, id).maybeSingle();
  if (error) {
    throw error;
  }

  return data;
}

function pickLatest(rows = [], sortField = "created_at") {
  return (
    rows.slice().sort((first, second) => new Date(second[sortField] || 0) - new Date(first[sortField] || 0))[0] || null
  );
}

function calculateStayMonths(moveInDate, checkoutDate) {
  if (!moveInDate || !checkoutDate) {
    return 0;
  }

  const start = new Date(moveInDate);
  const end = new Date(checkoutDate);
  const diffDays = Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)), 0);
  return Math.max(Math.floor(diffDays / 30), 0);
}

function getRefundPolicy(refundReason = "EARLY_TERMINATION_LONG_STAY") {
  const policyMap = {
    NO_CONTRACT: {
      reason: "NO_CONTRACT",
      ratio: 80,
      label: "Đặt cọc nhưng chưa ký hợp đồng",
    },
    EARLY_TERMINATION_SHORT_STAY: {
      reason: "EARLY_TERMINATION_SHORT_STAY",
      ratio: 50,
      label: "Đã ký hợp đồng, lưu trú dưới 6 tháng",
    },
    EARLY_TERMINATION_LONG_STAY: {
      reason: "EARLY_TERMINATION_LONG_STAY",
      ratio: 70,
      label: "Đã ký hợp đồng, lưu trú từ 6 tháng trở lên",
    },
    NORMAL_COMPLETION: {
      reason: "NORMAL_COMPLETION",
      ratio: 100,
      label: "Hết hạn hợp đồng",
    },
  };

  return policyMap[refundReason] || policyMap.EARLY_TERMINATION_LONG_STAY;
}

function getSuggestedRefundReason(stayMonths) {
  if (stayMonths < 6) {
    return "EARLY_TERMINATION_SHORT_STAY";
  }

  return "EARLY_TERMINATION_LONG_STAY";
}

function normalizeReconciliationStatus(rawStatus) {
  const value = String(rawStatus || "").toUpperCase();

  if (includesAny(value, ["DA_CHOT", "MATCH"])) return "DA_CHOT";
  if (includesAny(value, ["DANG", "LAP"])) return "DANG_LAP";
  return "CHO_CHOT";
}

function mapDraftStatusToDb(status = "DANG_LAP") {
  const value = String(status || "").toUpperCase();

  if (value === "DA_CHOT") return "DA_CHOT";
  if (value === "CHO_CHOT") return "CHO_CHOT";
  return "DANG_LAP";
}

function getNextAction(refundAmount, additionalPaymentAmount) {
  if (refundAmount > 0) {
    return "CREATE_REFUND";
  }

  if (additionalPaymentAmount > 0) {
    return "CREATE_ADDITIONAL_PAYMENT";
  }

  return "NO_FURTHER_PAYMENT";
}

function mapOutstandingInvoiceCategory(rawType) {
  const value = String(rawType || "").toUpperCase();

  if (includesAny(value, ["PHAT_SINH", "EXTRA"])) return "TIEN_DICH_VU";
  return "TIEN_THUE_CON_NO";
}

function mapRoomAndBed(contract, roomMap, bedMap) {
  const bed = contract?.ma_giuong ? bedMap[contract.ma_giuong] : null;
  const roomId = contract?.ma_phong || bed?.ma_phong || null;
  const room = roomId ? roomMap[roomId] : null;

  return {
    room,
    bed,
    roomDisplay: room?.ma_phong_hien_thi ? `P.${room.ma_phong_hien_thi}` : "--",
    bedDisplay: bed?.ma_giuong_hien_thi ? `Giường ${bed.ma_giuong_hien_thi}` : "--",
  };
}

function computeSummary({ depositAmount, refundReason, lineItems }) {
  const policy = getRefundPolicy(refundReason);
  const baseRefund = roundMoney(depositAmount * (policy.ratio / 100));
  const totalCharges = roundMoney(
    (lineItems || [])
      .filter((item) => String(item.direction || "THU").toUpperCase() === "THU")
      .reduce((sum, item) => sum + toNumber(item.amount), 0),
  );
  const totalAdjustments = roundMoney(
    (lineItems || [])
      .filter((item) => String(item.direction || "THU").toUpperCase() === "CHI")
      .reduce((sum, item) => sum + toNumber(item.amount), 0),
  );
  const refundAmount = roundMoney(Math.max(baseRefund - totalCharges + totalAdjustments, 0));
  const additionalPaymentAmount = roundMoney(Math.max(totalCharges - baseRefund - totalAdjustments, 0));

  return {
    refundPolicy: policy,
    baseRefund,
    totalCharges,
    totalAdjustments,
    refundAmount,
    additionalPaymentAmount,
    nextAction: getNextAction(refundAmount, additionalPaymentAmount),
  };
}

function mapReconciliationLineItem(item) {
  return {
    id: item.ma_chi_tiet_doi_soat,
    category: item.danh_muc,
    direction: item.huong_giao_dich,
    sourceType: item.loai_nguon,
    sourceId: item.ma_nguon,
    amount: toNumber(item.so_tien),
    description: item.mo_ta || "",
  };
}

async function fetchContractContext(contractIds, checkoutRows = []) {
  const contracts = await fetchByIds(TABLES.contracts, "ma_hop_dong", contractIds);
  const profileIds = [
    ...new Set(
      [
        ...contracts.map((item) => item.ma_ho_so_khach_hang),
        ...checkoutRows.map((item) => item.ma_ho_so_khach_hang),
      ].filter(Boolean),
    ),
  ];
  const roomIds = [...new Set(contracts.map((item) => item.ma_phong).filter(Boolean))];
  const bedIds = [...new Set(contracts.map((item) => item.ma_giuong).filter(Boolean))];
  const beds = await fetchByIds(TABLES.beds, "ma_giuong", bedIds);
  const mergedRoomIds = [...new Set([...roomIds, ...beds.map((item) => item.ma_phong).filter(Boolean)])];
  const rooms = await fetchByIds(TABLES.rooms, "ma_phong", mergedRoomIds);
  const profiles = await fetchByIds(TABLES.profiles, "ma_ho_so", profileIds);

  return {
    contractMap: indexBy(contracts, "ma_hop_dong"),
    roomMap: indexBy(rooms, "ma_phong"),
    bedMap: indexBy(beds, "ma_giuong"),
    profileMap: indexBy(profiles, "ma_ho_so"),
  };
}

function mapSettlementDocument(record, contract, customer, roomDisplay, bedDisplay) {
  return {
    id: record.ma_phieu_tt_phat_sinh,
    reconciliationId: record.ma_doi_soat,
    contractId: record.ma_hop_dong,
    customerName: customer?.ho_ten || "Khách thuê chưa cập nhật",
    phone: customer?.so_dien_thoai || "",
    roomDisplay,
    bedDisplay,
    amount: toNumber(record.so_tien_thanh_toan),
    status: record.trang_thai,
    createdAt: record.created_at,
    raw: record,
  };
}

function mapRefundDocument(record, customer, roomDisplay, bedDisplay) {
  return {
    id: record.ma_phieu_hoan_coc,
    reconciliationId: record.ma_doi_soat,
    contractId: record.ma_hop_dong,
    customerName: customer?.ho_ten || "Khách thuê chưa cập nhật",
    phone: customer?.so_dien_thoai || "",
    roomDisplay,
    bedDisplay,
    beneficiaryName: record.ten_nguoi_nhan,
    refundAmount: toNumber(record.so_tien_hoan),
    status: record.trang_thai,
    createdAt: record.created_at,
    raw: record,
  };
}

function mapWorkItem({
  checkoutRequest,
  contract,
  customer,
  roomDisplay,
  bedDisplay,
  inspection,
  reconciliation,
  refundVoucher,
  settlementPayment,
}) {
  const moveInDate = contract?.ngay_vao_o || null;
  const checkoutDate = checkoutRequest.ngay_yeu_cau_tra_phong;
  const stayMonths = calculateStayMonths(moveInDate, checkoutDate);
  const reconciliationStatus = reconciliation ? normalizeReconciliationStatus(reconciliation.trang_thai) : null;

  let workflowStatus = "CHO_DOI_SOAT";
  if (reconciliationStatus && reconciliationStatus !== "DA_CHOT") {
    workflowStatus = "DANG_LAP";
  } else if (reconciliationStatus === "DA_CHOT") {
    workflowStatus = refundVoucher || settlementPayment ? "DA_CHOT" : "CHO_HANH_DONG";
  }

  return {
    id: checkoutRequest.ma_yeu_cau_tra_phong,
    checkoutRequestId: checkoutRequest.ma_yeu_cau_tra_phong,
    contractId: checkoutRequest.ma_hop_dong,
    reconciliationId: reconciliation?.ma_doi_soat || null,
    customerId: customer?.ma_ho_so || checkoutRequest.ma_ho_so_khach_hang,
    customerName: customer?.ho_ten || "Khách thuê chưa cập nhật",
    phone: customer?.so_dien_thoai || "",
    roomDisplay,
    bedDisplay,
    moveInDate,
    checkoutDate,
    stayMonths,
    depositAmount: toNumber(contract?.so_tien_dat_coc_bao_dam),
    inspectionStatus: inspection?.trang_thai || checkoutRequest.trang_thai,
    managerNote: checkoutRequest.ly_do || "",
    workflowStatus,
    refundAmount: toNumber(reconciliation?.so_tien_hoan_lai),
    additionalPaymentAmount: toNumber(reconciliation?.so_tien_can_thanh_toan_them),
    hasReconciliationDraft: Boolean(reconciliation),
    hasRefundVoucher: Boolean(refundVoucher),
    hasAdditionalPaymentVoucher: Boolean(settlementPayment),
  };
}

async function getOpenInvoiceSuggestions(contractId) {
  const { data: invoices, error: invoiceError } = await supabase
    .from(TABLES.invoices)
    .select("*")
    .eq("ma_hop_dong", contractId)
    .order("created_at", { ascending: false });

  if (invoiceError) {
    throw invoiceError;
  }

  return (invoices || [])
    .filter((invoice) => toNumber(invoice.so_tien_da_thanh_toan) < toNumber(invoice.tong_so_tien))
    .filter((invoice) => !includesAny(invoice.loai_hoa_don, ["COC", "DEPOSIT"]))
    .map((invoice) => ({
      id: `invoice-${invoice.ma_hoa_don}`,
      category: mapOutstandingInvoiceCategory(invoice.loai_hoa_don),
      direction: "THU",
      sourceType: "HOA_DON",
      sourceId: invoice.ma_hoa_don,
      amount: roundMoney(toNumber(invoice.tong_so_tien) - toNumber(invoice.so_tien_da_thanh_toan)),
      description: `Công nợ còn thiếu của hóa đơn #${invoice.ma_hoa_don}`,
    }));
}

function buildInspectionSuggestions(inspectionItems = []) {
  return inspectionItems
    .filter((item) => toNumber(item.so_tien_boi_thuong) > 0)
    .map((item) => ({
      id: `inspection-${item.ma_chi_tiet_kiem_tra}`,
      category: "BOI_THUONG_HU_HONG",
      direction: "THU",
      sourceType: "KIEM_TRA",
      sourceId: item.ma_chi_tiet_kiem_tra,
      amount: toNumber(item.so_tien_boi_thuong),
      description: `${item.ten_tai_san}: ${item.tinh_trang}`,
    }));
}

async function buildContextForCheckoutRequests(checkoutRows) {
  const checkoutIds = checkoutRows.map((item) => item.ma_yeu_cau_tra_phong);
  const contractIds = checkoutRows.map((item) => item.ma_hop_dong);

  const contractContext = await fetchContractContext(contractIds, checkoutRows);
  const inspections = await fetchByIds(TABLES.inspections, "ma_yeu_cau_tra_phong", checkoutIds);
  const inspectionGroup = groupBy(inspections, "ma_yeu_cau_tra_phong");
  const reconciliations = await fetchByIds(TABLES.reconciliations, "ma_hop_dong", contractIds);
  const reconciliationGroup = groupBy(reconciliations, "ma_hop_dong");
  const reconciliationIds = reconciliations.map((item) => item.ma_doi_soat);
  const refunds = await fetchByIds(TABLES.refunds, "ma_doi_soat", reconciliationIds);
  const settlementPayments = await fetchByIds(TABLES.settlementPayments, "ma_doi_soat", reconciliationIds);
  const refundGroup = groupBy(refunds, "ma_doi_soat");
  const settlementGroup = groupBy(settlementPayments, "ma_doi_soat");

  return {
    ...contractContext,
    inspectionGroup,
    reconciliationGroup,
    refundGroup,
    settlementGroup,
  };
}

async function getReconciliationDetailPayload(reconciliationId) {
  const reconciliation = await fetchOne(TABLES.reconciliations, "ma_doi_soat", reconciliationId);
  if (!reconciliation) {
    throw new AppError("Reconciliation not found", 404);
  }

  const contract = await fetchOne(TABLES.contracts, "ma_hop_dong", reconciliation.ma_hop_dong);
  if (!contract) {
    throw new AppError("Contract not found for reconciliation", 404);
  }

  const checkoutRequests = await fetchByIds(TABLES.checkoutRequests, "ma_hop_dong", [contract.ma_hop_dong]);
  const checkoutRequest = pickLatest(checkoutRequests, "created_at");
  const context = await fetchContractContext([contract.ma_hop_dong], checkoutRequest ? [checkoutRequest] : []);
  const { room, bed, roomDisplay, bedDisplay } = mapRoomAndBed(contract, context.roomMap, context.bedMap);
  const customer = context.profileMap[contract.ma_ho_so_khach_hang] || null;
  const lineItemRows = await fetchByIds(TABLES.reconciliationItems, "ma_doi_soat", [reconciliationId]);
  const refundVoucher = await fetchOne(TABLES.refunds, "ma_doi_soat", reconciliationId);
  const settlementPayment = await fetchOne(TABLES.settlementPayments, "ma_doi_soat", reconciliationId);
  const inspections = checkoutRequest
    ? await fetchByIds(TABLES.inspections, "ma_yeu_cau_tra_phong", [checkoutRequest.ma_yeu_cau_tra_phong])
    : [];
  const latestInspection = pickLatest(inspections, "thoi_gian_kiem_tra");
  const inspectionItems = latestInspection
    ? await fetchByIds(TABLES.inspectionItems, "ma_bien_ban_kiem_tra", [latestInspection.ma_bien_ban_kiem_tra])
    : [];
  const stayMonths = calculateStayMonths(contract.ngay_vao_o, checkoutRequest?.ngay_yeu_cau_tra_phong);
  const refundReason = getSuggestedRefundReason(stayMonths);
  const lineItems = lineItemRows.map(mapReconciliationLineItem);
  const computed = computeSummary({
    depositAmount: toNumber(reconciliation.so_tien_dat_coc_ban_dau),
    refundReason,
    lineItems,
  });

  return {
    id: reconciliation.ma_doi_soat,
    checkoutRequestId: checkoutRequest?.ma_yeu_cau_tra_phong || null,
    contractId: reconciliation.ma_hop_dong,
    customerName: customer?.ho_ten || "Khách thuê chưa cập nhật",
    phone: customer?.so_dien_thoai || "",
    roomDisplay,
    bedDisplay,
    moveInDate: contract.ngay_vao_o,
    checkoutDate: checkoutRequest?.ngay_yeu_cau_tra_phong || null,
    stayMonths,
    depositAmount: toNumber(reconciliation.so_tien_dat_coc_ban_dau),
    refundReason,
    refundPolicy: computed.refundPolicy,
    baseRefund: computed.baseRefund,
    totalCharges: computed.totalCharges,
    totalAdjustments: computed.totalAdjustments,
    refundAmount: toNumber(reconciliation.so_tien_hoan_lai),
    additionalPaymentAmount: toNumber(reconciliation.so_tien_can_thanh_toan_them),
    nextAction: getNextAction(
      toNumber(reconciliation.so_tien_hoan_lai),
      toNumber(reconciliation.so_tien_can_thanh_toan_them),
    ),
    status: normalizeReconciliationStatus(reconciliation.trang_thai),
    managerNote: checkoutRequest?.ly_do || "",
    inspectionStatus: latestInspection?.trang_thai || checkoutRequest?.trang_thai || null,
    inspectionItems: inspectionItems.map((item) => ({
      id: item.ma_chi_tiet_kiem_tra,
      assetName: item.ten_tai_san,
      condition: item.tinh_trang,
      compensationAmount: toNumber(item.so_tien_boi_thuong),
    })),
    lineItems,
    refundVoucher: refundVoucher ? mapRefundDocument(refundVoucher, customer, roomDisplay, bedDisplay) : null,
    additionalPaymentVoucher: settlementPayment
      ? mapSettlementDocument(settlementPayment, contract, customer, roomDisplay, bedDisplay)
      : null,
    contract: {
      id: contract.ma_hop_dong,
      moveInDate: contract.ngay_vao_o,
      contractStatus: contract.trang_thai,
      roomId: room?.ma_phong || null,
      roomDisplay,
      bedId: bed?.ma_giuong || null,
      bedDisplay,
      depositAmount: toNumber(contract.so_tien_dat_coc_bao_dam),
      baseRent: toNumber(contract.gia_thue_co_ban_thang),
    },
    raw: reconciliation,
  };
}

const AccountingReconciliationPageModel = {
  ...PAGE_SPEC,

  async listWorkItems(filters = {}) {
    ensureClient();

    const { data, error } = await supabase
      .from(TABLES.checkoutRequests)
      .select("*")
      .neq("trang_thai", "CHO_XU_LY")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const checkoutRows = data || [];
    const context = await buildContextForCheckoutRequests(checkoutRows);

    let items = checkoutRows.map((checkoutRequest) => {
      const contract = context.contractMap[checkoutRequest.ma_hop_dong] || null;
      const customer = context.profileMap[contract?.ma_ho_so_khach_hang || checkoutRequest.ma_ho_so_khach_hang] || null;
      const latestInspection = pickLatest(
        context.inspectionGroup[checkoutRequest.ma_yeu_cau_tra_phong] || [],
        "thoi_gian_kiem_tra",
      );
      const latestReconciliation = pickLatest(
        context.reconciliationGroup[checkoutRequest.ma_hop_dong] || [],
        "created_at",
      );
      const latestRefund = latestReconciliation
        ? pickLatest(context.refundGroup[latestReconciliation.ma_doi_soat] || [], "created_at")
        : null;
      const latestSettlement = latestReconciliation
        ? pickLatest(context.settlementGroup[latestReconciliation.ma_doi_soat] || [], "created_at")
        : null;
      const { roomDisplay, bedDisplay } = mapRoomAndBed(contract, context.roomMap, context.bedMap);

      return mapWorkItem({
        checkoutRequest,
        contract,
        customer,
        roomDisplay,
        bedDisplay,
        inspection: latestInspection,
        reconciliation: latestReconciliation,
        refundVoucher: latestRefund,
        settlementPayment: latestSettlement,
      });
    });

    if (filters.status) {
      items = items.filter((item) => item.workflowStatus === String(filters.status).toUpperCase());
    }

    if (filters.search) {
      const keyword = String(filters.search).toLowerCase();
      items = items.filter((item) =>
        [item.checkoutRequestId, item.contractId, item.customerName, item.roomDisplay, item.bedDisplay]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword)),
      );
    }

    return {
      items,
      total: items.length,
      page: 1,
      limit: items.length,
    };
  },

  async getWorkItemDetail(checkoutRequestId) {
    ensureClient();

    const checkoutRequest = await fetchOne(TABLES.checkoutRequests, "ma_yeu_cau_tra_phong", checkoutRequestId);
    if (!checkoutRequest) {
      throw new AppError("Checkout request not found", 404);
    }

    const context = await fetchContractContext([checkoutRequest.ma_hop_dong], [checkoutRequest]);
    const contract = context.contractMap[checkoutRequest.ma_hop_dong];
    if (!contract) {
      throw new AppError("Contract not found for checkout request", 404);
    }

    const customer = context.profileMap[contract.ma_ho_so_khach_hang || checkoutRequest.ma_ho_so_khach_hang] || null;
    const { roomDisplay, bedDisplay } = mapRoomAndBed(contract, context.roomMap, context.bedMap);
    const inspections = await fetchByIds(TABLES.inspections, "ma_yeu_cau_tra_phong", [checkoutRequestId]);
    const latestInspection = pickLatest(inspections, "thoi_gian_kiem_tra");
    const inspectionItems = latestInspection
      ? await fetchByIds(TABLES.inspectionItems, "ma_bien_ban_kiem_tra", [latestInspection.ma_bien_ban_kiem_tra])
      : [];
    const reconciliations = await fetchByIds(TABLES.reconciliations, "ma_hop_dong", [checkoutRequest.ma_hop_dong]);
    const latestReconciliation = pickLatest(reconciliations, "created_at");
    const refundVoucher = latestReconciliation
      ? await fetchOne(TABLES.refunds, "ma_doi_soat", latestReconciliation.ma_doi_soat)
      : null;
    const settlementPayment = latestReconciliation
      ? await fetchOne(TABLES.settlementPayments, "ma_doi_soat", latestReconciliation.ma_doi_soat)
      : null;
    const stayMonths = calculateStayMonths(contract.ngay_vao_o, checkoutRequest.ngay_yeu_cau_tra_phong);
    const suggestedRefundReason = getSuggestedRefundReason(stayMonths);
    const suggestedLineItems = [
      ...buildInspectionSuggestions(inspectionItems),
      ...(await getOpenInvoiceSuggestions(checkoutRequest.ma_hop_dong)),
    ];

    if (!latestReconciliation) {
      const preview = computeSummary({
        depositAmount: toNumber(contract.so_tien_dat_coc_bao_dam),
        refundReason: suggestedRefundReason,
        lineItems: suggestedLineItems,
      });

      return {
        id: checkoutRequest.ma_yeu_cau_tra_phong,
        checkoutRequestId: checkoutRequest.ma_yeu_cau_tra_phong,
        contractId: checkoutRequest.ma_hop_dong,
        customerName: customer?.ho_ten || "Khách thuê chưa cập nhật",
        phone: customer?.so_dien_thoai || "",
        roomDisplay,
        bedDisplay,
        moveInDate: contract.ngay_vao_o,
        checkoutDate: checkoutRequest.ngay_yeu_cau_tra_phong,
        stayMonths,
        depositAmount: toNumber(contract.so_tien_dat_coc_bao_dam),
        refundReason: suggestedRefundReason,
        refundPolicy: preview.refundPolicy,
        baseRefund: preview.baseRefund,
        totalCharges: preview.totalCharges,
        totalAdjustments: preview.totalAdjustments,
        refundAmount: preview.refundAmount,
        additionalPaymentAmount: preview.additionalPaymentAmount,
        nextAction: preview.nextAction,
        status: "CHO_DOI_SOAT",
        inspectionStatus: latestInspection?.trang_thai || checkoutRequest.trang_thai,
        managerNote: checkoutRequest.ly_do || "",
        inspectionItems: inspectionItems.map((item) => ({
          id: item.ma_chi_tiet_kiem_tra,
          assetName: item.ten_tai_san,
          condition: item.tinh_trang,
          compensationAmount: toNumber(item.so_tien_boi_thuong),
        })),
        lineItems: [],
        suggestedLineItems,
        refundVoucher: null,
        additionalPaymentVoucher: null,
        contract: {
          id: contract.ma_hop_dong,
          moveInDate: contract.ngay_vao_o,
          contractStatus: contract.trang_thai,
          roomDisplay,
          bedDisplay,
          depositAmount: toNumber(contract.so_tien_dat_coc_bao_dam),
          baseRent: toNumber(contract.gia_thue_co_ban_thang),
        },
      };
    }

    const detail = await getReconciliationDetailPayload(latestReconciliation.ma_doi_soat);
    return {
      ...detail,
      checkoutRequestId,
      suggestedLineItems,
      refundVoucher: refundVoucher ? detail.refundVoucher : null,
      additionalPaymentVoucher: settlementPayment ? detail.additionalPaymentVoucher : null,
    };
  },

  async preview(payload = {}) {
    ensureClient();

    if (!payload.contractId) {
      throw new AppError("contractId is required", 400);
    }

    const contract = await fetchOne(TABLES.contracts, "ma_hop_dong", payload.contractId);
    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const lineItems = Array.isArray(payload.lineItems) ? payload.lineItems : [];
    const summary = computeSummary({
      depositAmount: toNumber(contract.so_tien_dat_coc_bao_dam),
      refundReason: payload.refundReason,
      lineItems,
    });

    return {
      contractId: contract.ma_hop_dong,
      depositAmount: toNumber(contract.so_tien_dat_coc_bao_dam),
      refundReason: summary.refundPolicy.reason,
      refundPolicy: summary.refundPolicy,
      baseRefund: summary.baseRefund,
      totalCharges: summary.totalCharges,
      totalAdjustments: summary.totalAdjustments,
      refundAmount: summary.refundAmount,
      additionalPaymentAmount: summary.additionalPaymentAmount,
      nextAction: summary.nextAction,
      lineItems,
    };
  },

  async createDraft(payload = {}) {
    ensureClient();

    if (!payload.checkoutRequestId || !payload.contractId) {
      throw new AppError("checkoutRequestId and contractId are required", 400);
    }

    const checkoutRequest = await fetchOne(TABLES.checkoutRequests, "ma_yeu_cau_tra_phong", payload.checkoutRequestId);
    if (!checkoutRequest) {
      throw new AppError("Checkout request not found", 404);
    }

    const contract = await fetchOne(TABLES.contracts, "ma_hop_dong", payload.contractId);
    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const existingReconciliations = await fetchByIds(TABLES.reconciliations, "ma_hop_dong", [payload.contractId]);
    const activeDraft = pickLatest(
      existingReconciliations.filter((item) => normalizeReconciliationStatus(item.trang_thai) !== "DA_CHOT"),
      "created_at",
    );
    if (activeDraft) {
      throw new AppError("An active reconciliation draft already exists for this contract", 409);
    }

    const lineItems = Array.isArray(payload.lineItems) ? payload.lineItems : [];
    const summary = computeSummary({
      depositAmount: toNumber(contract.so_tien_dat_coc_bao_dam),
      refundReason: payload.refundReason,
      lineItems,
    });

    const { data: insertedReconciliation, error: reconciliationError } = await supabase
      .from(TABLES.reconciliations)
      .insert({
        ma_hop_dong: payload.contractId,
        so_tien_dat_coc_ban_dau: toNumber(contract.so_tien_dat_coc_bao_dam),
        so_tien_hoan_lai: summary.refundAmount,
        so_tien_can_thanh_toan_them: summary.additionalPaymentAmount,
        trang_thai: mapDraftStatusToDb(payload.status || "DANG_LAP"),
      })
      .select("*")
      .single();

    if (reconciliationError) {
      throw reconciliationError;
    }

    if (lineItems.length) {
      const detailPayloads = lineItems.map((item) => ({
        ma_doi_soat: insertedReconciliation.ma_doi_soat,
        danh_muc: item.category || "KHAC",
        huong_giao_dich: String(item.direction || "THU").toUpperCase(),
        loai_nguon: item.sourceType || null,
        ma_nguon: item.sourceId || null,
        so_tien: toNumber(item.amount),
        mo_ta: item.description || null,
      }));

      const { error: detailError } = await supabase.from(TABLES.reconciliationItems).insert(detailPayloads);
      if (detailError) {
        throw detailError;
      }
    }

    return this.getReconciliationDetail(insertedReconciliation.ma_doi_soat);
  },

  async getReconciliationDetail(reconciliationId) {
    return getReconciliationDetailPayload(reconciliationId);
  },

  async updateDraft(reconciliationId, payload = {}) {
    ensureClient();

    const reconciliation = await fetchOne(TABLES.reconciliations, "ma_doi_soat", reconciliationId);
    if (!reconciliation) {
      throw new AppError("Reconciliation not found", 404);
    }

    if (normalizeReconciliationStatus(reconciliation.trang_thai) === "DA_CHOT") {
      throw new AppError("Finalized reconciliation cannot be edited as draft", 409);
    }

    const contract = await fetchOne(TABLES.contracts, "ma_hop_dong", reconciliation.ma_hop_dong);
    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const lineItems = Array.isArray(payload.lineItems)
      ? payload.lineItems
      : (await fetchByIds(TABLES.reconciliationItems, "ma_doi_soat", [reconciliationId])).map(
          mapReconciliationLineItem,
        );

    const summary = computeSummary({
      depositAmount: toNumber(reconciliation.so_tien_dat_coc_ban_dau || contract.so_tien_dat_coc_bao_dam),
      refundReason: payload.refundReason || getSuggestedRefundReason(6),
      lineItems,
    });

    const { error: reconciliationError } = await supabase
      .from(TABLES.reconciliations)
      .update({
        so_tien_dat_coc_ban_dau: toNumber(reconciliation.so_tien_dat_coc_ban_dau || contract.so_tien_dat_coc_bao_dam),
        so_tien_hoan_lai: summary.refundAmount,
        so_tien_can_thanh_toan_them: summary.additionalPaymentAmount,
        trang_thai: mapDraftStatusToDb(payload.status || "DANG_LAP"),
      })
      .eq("ma_doi_soat", reconciliationId);

    if (reconciliationError) {
      throw reconciliationError;
    }

    if (Array.isArray(payload.lineItems)) {
      await supabase.from(TABLES.reconciliationItems).delete().eq("ma_doi_soat", reconciliationId);

      if (payload.lineItems.length) {
        const detailPayloads = payload.lineItems.map((item) => ({
          ma_doi_soat: reconciliationId,
          danh_muc: item.category || "KHAC",
          huong_giao_dich: String(item.direction || "THU").toUpperCase(),
          loai_nguon: item.sourceType || null,
          ma_nguon: item.sourceId || null,
          so_tien: toNumber(item.amount),
          mo_ta: item.description || null,
        }));

        const { error: detailError } = await supabase.from(TABLES.reconciliationItems).insert(detailPayloads);
        if (detailError) {
          throw detailError;
        }
      }
    }

    return this.getReconciliationDetail(reconciliationId);
  },

  async finalize(reconciliationId) {
    ensureClient();

    const reconciliation = await fetchOne(TABLES.reconciliations, "ma_doi_soat", reconciliationId);
    if (!reconciliation) {
      throw new AppError("Reconciliation not found", 404);
    }

    const { error } = await supabase
      .from(TABLES.reconciliations)
      .update({
        trang_thai: "DA_CHOT",
      })
      .eq("ma_doi_soat", reconciliationId);

    if (error) {
      throw error;
    }

    const detail = await this.getReconciliationDetail(reconciliationId);
    return {
      ...detail,
      finalizedAt: new Date().toISOString(),
      nextAction: getNextAction(detail.refundAmount, detail.additionalPaymentAmount),
    };
  },

  async createRefundVoucher(reconciliationId, payload = {}) {
    ensureClient();

    const reconciliation = await this.getReconciliationDetail(reconciliationId);
    if (reconciliation.status !== "DA_CHOT") {
      throw new AppError("Reconciliation must be finalized before creating refund voucher", 409);
    }

    if (toNumber(reconciliation.refundAmount) <= 0) {
      throw new AppError("Refund voucher is only available when refundAmount is greater than zero", 409);
    }

    const existingRefund = await fetchOne(TABLES.refunds, "ma_doi_soat", reconciliationId);
    if (existingRefund) {
      return mapRefundDocument(
        existingRefund,
        { ho_ten: reconciliation.customerName, so_dien_thoai: reconciliation.phone },
        reconciliation.roomDisplay,
        reconciliation.bedDisplay,
      );
    }

    const { data, error } = await supabase
      .from(TABLES.refunds)
      .insert({
        ma_doi_soat: reconciliationId,
        ma_hop_dong: reconciliation.contractId,
        so_tien_hoan: reconciliation.refundAmount,
        ten_nguoi_nhan: payload.beneficiaryName || reconciliation.customerName,
        trang_thai: payload.status || "CHO_HOAN",
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return mapRefundDocument(
      data,
      { ho_ten: reconciliation.customerName, so_dien_thoai: reconciliation.phone },
      reconciliation.roomDisplay,
      reconciliation.bedDisplay,
    );
  },

  async createAdditionalPaymentVoucher(reconciliationId, payload = {}) {
    ensureClient();

    const reconciliation = await this.getReconciliationDetail(reconciliationId);
    if (reconciliation.status !== "DA_CHOT") {
      throw new AppError("Reconciliation must be finalized before creating additional payment voucher", 409);
    }

    if (toNumber(reconciliation.additionalPaymentAmount) <= 0) {
      throw new AppError(
        "Additional payment voucher is only available when additionalPaymentAmount is greater than zero",
        409,
      );
    }

    const existingVoucher = await fetchOne(TABLES.settlementPayments, "ma_doi_soat", reconciliationId);
    if (existingVoucher) {
      return mapSettlementDocument(
        existingVoucher,
        { ma_hop_dong: reconciliation.contractId },
        { ho_ten: reconciliation.customerName, so_dien_thoai: reconciliation.phone },
        reconciliation.roomDisplay,
        reconciliation.bedDisplay,
      );
    }

    const { data, error } = await supabase
      .from(TABLES.settlementPayments)
      .insert({
        ma_doi_soat: reconciliationId,
        ma_hop_dong: reconciliation.contractId,
        so_tien_thanh_toan: reconciliation.additionalPaymentAmount,
        trang_thai: payload.status || "CHO_THANH_TOAN",
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return mapSettlementDocument(
      data,
      { ma_hop_dong: reconciliation.contractId },
      { ho_ten: reconciliation.customerName, so_dien_thoai: reconciliation.phone },
      reconciliation.roomDisplay,
      reconciliation.bedDisplay,
    );
  },
};

module.exports = AccountingReconciliationPageModel;
