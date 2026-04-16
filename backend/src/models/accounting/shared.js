const { supabase } = require("../../config/supabase");
const { AppError } = require("../../utils/errors");

const TABLES = {
  profiles: "ho_so",
  requests: "yeu_cau_thue",
  contracts: "hop_dong",
  rooms: "phong",
  beds: "giuong",
  floors: "tang",
  buildings: "toa",
  invoices: "hoa_don",
  invoiceItems: "chi_tiet_hoa_don",
  contractCharges: "khoan_thu_hop_dong",
  payments: "thanh_toan",
  receipts: "bien_lai",
  holds: "giu_cho_tam",
  checkoutRequests: "yeu_cau_tra_phong",
  inspections: "bien_ban_kiem_tra",
  inspectionItems: "chi_tiet_kiem_tra",
  reconciliations: "doi_soat_tai_chinh",
  reconciliationItems: "chi_tiet_doi_soat_tai_chinh",
  refunds: "phieu_hoan_coc",
  settlementPayments: "phieu_thanh_toan_phat_sinh",
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

function buildPagination(page = 1, limit = 20) {
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  return {
    currentPage,
    currentLimit,
    from: (currentPage - 1) * currentLimit,
    to: currentPage * currentLimit - 1,
  };
}

async function fetchByIds(tableName, idField, ids, columns = "*") {
  ensureClient();

  if (!ids.length) return [];

  const { data, error } = await supabase.from(tableName).select(columns).in(idField, ids);

  if (error) throw error;
  return data || [];
}

async function fetchOne(tableName, idField, id, columns = "*") {
  ensureClient();

  const { data, error } = await supabase.from(tableName).select(columns).eq(idField, id).maybeSingle();

  if (error) throw error;
  return data;
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

function getDaysInMonth(dateValue) {
  const date = new Date(dateValue);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function normalizeInvoiceStatus(invoice) {
  const paidAmount = toNumber(invoice.so_tien_da_thanh_toan);
  const totalAmount = toNumber(invoice.tong_so_tien);
  const rawStatus = String(invoice.trang_thai || "").toUpperCase();

  if (includesAny(rawStatus, ["HUY", "CANCEL"])) return "CANCELLED";
  if (paidAmount >= totalAmount && totalAmount > 0) return "COMPLETED";

  if (invoice.ngay_den_han) {
    const today = new Date();
    const dueDate = new Date(invoice.ngay_den_han);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      return "OVERDUE";
    }
  }

  return "PENDING";
}

function normalizePaymentStatus(payment) {
  const rawStatus = String(payment.trang_thai || "").toUpperCase();

  if (includesAny(rawStatus, ["XAC_NHAN", "CONFIRM", "HOAN_TAT", "SUCCESS"])) return "CONFIRMED";
  if (includesAny(rawStatus, ["THAT_BAI", "FAILED"])) return "FAILED";
  if (includesAny(rawStatus, ["HUY", "CANCEL"])) return "CANCELLED";
  return "PENDING";
}

function normalizeContractStatus(contract) {
  const rawStatus = String(contract.trang_thai || "").toUpperCase();

  if (includesAny(rawStatus, ["HIEU_LUC", "ACTIVE"])) return "ACTIVE";
  if (includesAny(rawStatus, ["HOAN_THANH", "THANH_LY", "COMPLETED"])) return "COMPLETED";
  if (includesAny(rawStatus, ["CHAM_DUT", "HUY", "CANCEL"])) return "TERMINATED";
  return "PROCESSING";
}

function normalizeInvoiceType(rawType) {
  const value = String(rawType || "").toUpperCase();

  if (includesAny(value, ["COC", "DEPOSIT"])) return "DEPOSIT";
  if (includesAny(value, ["PHAT_SINH", "EXTRA"])) return "EXTRA";
  if (includesAny(value, ["FINAL", "THANH_LY", "DOI_SOAT"])) return "FINAL";
  return "MONTHLY_RENT";
}

function normalizeRefundStatus(rawStatus) {
  const value = String(rawStatus || "").toUpperCase();

  if (includesAny(value, ["HOAN_TAT", "DA_HOAN", "COMPLETED"])) return "COMPLETED";
  if (includesAny(value, ["DANG", "PROCESS"])) return "PROCESSING";
  if (includesAny(value, ["HUY", "FAILED"])) return "FAILED";
  return "PENDING";
}

function normalizeReconciliationStatus(rawStatus) {
  const value = String(rawStatus || "").toUpperCase();

  if (includesAny(value, ["XAC_NHAN", "DA_CHOT", "MATCH"])) return "MATCHED";
  if (includesAny(value, ["LECH", "MISMATCH"])) return "MISMATCH";
  return "PENDING";
}

function mapInvoiceStatusToDb(status, paidAmount, totalAmount) {
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === "CANCELLED") return "DA_HUY";
  if (normalizedStatus === "OVERDUE") return "QUA_HAN";
  if (normalizedStatus === "COMPLETED") return "DA_THANH_TOAN";
  if (normalizedStatus === "PENDING") return "CHO_THANH_TOAN";

  if (toNumber(paidAmount) >= toNumber(totalAmount) && toNumber(totalAmount) > 0) {
    return "DA_THANH_TOAN";
  }

  return "CHO_THANH_TOAN";
}

function mapPaymentStatusToDb(status) {
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === "CONFIRMED") return "DA_XAC_NHAN";
  if (normalizedStatus === "FAILED") return "THAT_BAI";
  if (normalizedStatus === "CANCELLED") return "DA_HUY";
  return "CHO_XAC_NHAN";
}

function mapRefundStatusToDb(status) {
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === "COMPLETED") return "DA_HOAN";
  if (normalizedStatus === "PROCESSING") return "DANG_XU_LY";
  if (normalizedStatus === "FAILED") return "THAT_BAI";
  return "CHO_HOAN";
}

function mapReconciliationStatusToDb(status) {
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === "MATCHED") return "DA_CHOT";
  if (normalizedStatus === "MISMATCH") return "LECH_SO_LIEU";
  return "CHO_CHOT";
}

function calculateDepositFormula(contract, room) {
  const monthlyRent = toNumber(contract.gia_thue_co_ban_thang || room?.gia_thang);
  const roomCapacity = Math.max(toNumber(room?.suc_chua), 1);
  const bedCount = contract.loai_muc_tieu === "PHONG" ? roomCapacity : 1;
  const monthlyRentPerBed = contract.loai_muc_tieu === "PHONG" ? roundMoney(monthlyRent / roomCapacity) : monthlyRent;

  return {
    bedCount,
    monthlyRent,
    monthlyRentPerBed,
    totalDeposit: roundMoney(monthlyRentPerBed * 2 * bedCount),
  };
}

function calculateProratedFirstRent(startDate, monthlyRent) {
  if (!startDate) {
    return roundMoney(monthlyRent);
  }

  const date = new Date(startDate);
  const daysInMonth = getDaysInMonth(startDate);
  const remainingDays = Math.max(daysInMonth - date.getDate() + 1, 1);
  const dailyRate = monthlyRent / daysInMonth;

  return roundMoney(dailyRate * remainingDays);
}

function mapContractRow(contract, context) {
  const customer = context.profileMap[contract.ma_ho_so_khach_hang] || null;
  const bed = contract.ma_giuong ? context.bedMap[contract.ma_giuong] : null;
  const roomId = contract.ma_phong || bed?.ma_phong || null;
  const room = roomId ? context.roomMap[roomId] : null;
  const floor = room?.ma_tang ? context.floorMap[room.ma_tang] : null;
  const building = room?.ma_toa ? context.buildingMap[room.ma_toa] : null;
  const deposit = calculateDepositFormula(contract, room);

  return {
    id: contract.ma_hop_dong,
    customerId: customer?.ma_ho_so || null,
    customerName: customer?.ho_ten || "Khach thue chua cap nhat",
    customerPhone: customer?.so_dien_thoai || "",
    roomNumber: room?.ma_phong_hien_thi || "",
    bedNumber: bed?.ma_giuong_hien_thi || "",
    rentalType: contract.loai_muc_tieu,
    startDate: contract.ngay_vao_o,
    baseRent: toNumber(contract.gia_thue_co_ban_thang),
    securityDeposit: deposit.totalDeposit,
    bedCount: deposit.bedCount,
    buildingName: building?.ten || "",
    floorName: floor?.ten_tang || floor?.so_tang || "",
    status: normalizeContractStatus(contract),
    rawStatus: contract.trang_thai,
    raw: contract,
  };
}

function mapInvoiceRow(invoice, context) {
  const contract = invoice.ma_hop_dong ? context.contractMap[invoice.ma_hop_dong] : null;
  const rentalRequest = invoice.ma_yeu_cau_thue ? context.requestMap[invoice.ma_yeu_cau_thue] : null;
  const customer = contract
    ? context.profileMap[contract.ma_ho_so_khach_hang]
    : rentalRequest
      ? context.profileMap[rentalRequest.ma_ho_so_khach_hang]
      : null;
  const relatedPayments = context.paymentGroup[invoice.ma_hoa_don] || [];
  const latestPayment =
    relatedPayments
      .slice()
      .sort(
        (firstPayment, secondPayment) => new Date(secondPayment.created_at) - new Date(firstPayment.created_at),
      )[0] || null;
  const firstDetail = (context.invoiceItemGroup[invoice.ma_hoa_don] || [])[0] || null;

  return {
    id: invoice.ma_hoa_don,
    contractId: invoice.ma_hop_dong,
    rentalRequestId: invoice.ma_yeu_cau_thue,
    customerId: customer?.ma_ho_so || null,
    customerName: customer?.ho_ten || "Khach thue chua cap nhat",
    invoiceType: normalizeInvoiceType(invoice.loai_hoa_don),
    amount: toNumber(invoice.tong_so_tien),
    paidAmount: toNumber(invoice.so_tien_da_thanh_toan),
    dueDate: invoice.ngay_den_han,
    issueDate: invoice.ngay_lap,
    status: normalizeInvoiceStatus(invoice),
    rawStatus: invoice.trang_thai,
    rawType: invoice.loai_hoa_don,
    paymentMethod: latestPayment?.phuong_thuc || null,
    paymentDate: latestPayment?.thoi_gian_xac_nhan || latestPayment?.thoi_gian_thanh_toan || null,
    description: firstDetail?.mo_ta || invoice.loai_hoa_don,
    notes: null,
    lineItems: context.invoiceItemGroup[invoice.ma_hoa_don] || [],
    payments: relatedPayments,
    raw: invoice,
  };
}

async function loadContractContext(contracts) {
  const profileIds = [...new Set(contracts.map((item) => item.ma_ho_so_khach_hang).filter(Boolean))];
  const bedIds = [...new Set(contracts.map((item) => item.ma_giuong).filter(Boolean))];
  const directRoomIds = [...new Set(contracts.map((item) => item.ma_phong).filter(Boolean))];

  const profiles = await fetchByIds(TABLES.profiles, "ma_ho_so", profileIds);
  const beds = await fetchByIds(TABLES.beds, "ma_giuong", bedIds);
  const roomIds = [...new Set([...directRoomIds, ...beds.map((item) => item.ma_phong).filter(Boolean)])];
  const rooms = await fetchByIds(TABLES.rooms, "ma_phong", roomIds);
  const floorIds = [...new Set(rooms.map((item) => item.ma_tang).filter(Boolean))];
  const buildingIds = [...new Set(rooms.map((item) => item.ma_toa).filter(Boolean))];
  const floors = await fetchByIds(TABLES.floors, "ma_tang", floorIds);
  const buildings = await fetchByIds(TABLES.buildings, "ma_toa", buildingIds);

  return {
    profileMap: indexBy(profiles, "ma_ho_so"),
    bedMap: indexBy(beds, "ma_giuong"),
    roomMap: indexBy(rooms, "ma_phong"),
    floorMap: indexBy(floors, "ma_tang"),
    buildingMap: indexBy(buildings, "ma_toa"),
  };
}

async function loadInvoiceContext(invoices, invoiceItems = null, payments = null) {
  const contractIds = [...new Set(invoices.map((item) => item.ma_hop_dong).filter(Boolean))];
  const requestIds = [...new Set(invoices.map((item) => item.ma_yeu_cau_thue).filter(Boolean))];

  const contracts = await fetchByIds(TABLES.contracts, "ma_hop_dong", contractIds);
  const requests = await fetchByIds(TABLES.requests, "ma_yeu_cau_thue", requestIds);

  const profileIds = [
    ...new Set(
      [
        ...contracts.map((item) => item.ma_ho_so_khach_hang),
        ...requests.map((item) => item.ma_ho_so_khach_hang),
      ].filter(Boolean),
    ),
  ];

  const profiles = await fetchByIds(TABLES.profiles, "ma_ho_so", profileIds);
  const resolvedInvoiceItems =
    invoiceItems ||
    (await fetchByIds(
      TABLES.invoiceItems,
      "ma_hoa_don",
      invoices.map((item) => item.ma_hoa_don),
    ));
  const resolvedPayments =
    payments ||
    (await fetchByIds(
      TABLES.payments,
      "ma_hoa_don",
      invoices.map((item) => item.ma_hoa_don),
    ));

  return {
    contractMap: indexBy(contracts, "ma_hop_dong"),
    requestMap: indexBy(requests, "ma_yeu_cau_thue"),
    profileMap: indexBy(profiles, "ma_ho_so"),
    invoiceItemGroup: groupBy(resolvedInvoiceItems, "ma_hoa_don"),
    paymentGroup: groupBy(resolvedPayments, "ma_hoa_don"),
  };
}

async function loadReconciliationContext(reconciliations, reconciliationItems = null) {
  const contractIds = [...new Set(reconciliations.map((item) => item.ma_hop_dong).filter(Boolean))];
  const contracts = await fetchByIds(TABLES.contracts, "ma_hop_dong", contractIds);
  const contractContext = await loadContractContext(contracts);
  const itemRows =
    reconciliationItems ||
    (await fetchByIds(
      TABLES.reconciliationItems,
      "ma_doi_soat",
      reconciliations.map((item) => item.ma_doi_soat),
    ));

  return {
    contractMap: indexBy(contracts, "ma_hop_dong"),
    contractContext,
    reconciliationItemGroup: groupBy(itemRows, "ma_doi_soat"),
  };
}

function mapReconciliationRow(reconciliation, context) {
  const contract = context.contractMap[reconciliation.ma_hop_dong];
  const mappedContract = contract ? mapContractRow(contract, context.contractContext) : null;
  const lineItems = (context.reconciliationItemGroup[reconciliation.ma_doi_soat] || []).map((item) => ({
    id: item.ma_chi_tiet_doi_soat,
    category: item.danh_muc,
    direction: item.huong_giao_dich,
    sourceType: item.loai_nguon,
    sourceId: item.ma_nguon,
    amount: toNumber(item.so_tien),
    description: item.mo_ta,
  }));

  return {
    id: reconciliation.ma_doi_soat,
    contractId: reconciliation.ma_hop_dong,
    customerName: mappedContract?.customerName || "Khach thue chua cap nhat",
    originalDeposit: toNumber(reconciliation.so_tien_dat_coc_ban_dau),
    refundAmount: toNumber(reconciliation.so_tien_hoan_lai),
    additionalPaymentAmount: toNumber(reconciliation.so_tien_can_thanh_toan_them),
    status: normalizeReconciliationStatus(reconciliation.trang_thai),
    rawStatus: reconciliation.trang_thai,
    lineItems,
    contract: mappedContract,
    raw: reconciliation,
  };
}

function buildChargePayloads(contractId, invoiceId, lineItems, phase) {
  return lineItems.map((item) => ({
    ma_hop_dong: contractId,
    giai_doan_phat_sinh: phase,
    danh_muc: item.category || "KHAC",
    mo_ta: item.description || item.category || "Khoan thu hop dong",
    so_tien:
      item.amount !== undefined
        ? toNumber(item.amount)
        : roundMoney(toNumber(item.quantity || 1) * toNumber(item.unitPrice || 0)),
    trang_thai_lap_hoa_don: "DA_LAP",
    ma_hoa_don_da_lap: invoiceId,
  }));
}

function buildInvoiceItemPayloads(invoiceId, lineItems, insertedCharges = []) {
  return lineItems.map((item, index) => ({
    ma_hoa_don: invoiceId,
    ma_khoan_thu: insertedCharges?.[index]?.ma_khoan_thu || null,
    danh_muc: item.category || "KHAC",
    mo_ta: item.description || item.category || "Khoan thu hop dong",
    so_luong: toNumber(item.quantity || 1),
    don_gia: item.unitPrice !== undefined ? toNumber(item.unitPrice) : toNumber(item.amount || 0),
    thanh_tien:
      item.amount !== undefined
        ? toNumber(item.amount)
        : roundMoney(toNumber(item.quantity || 1) * toNumber(item.unitPrice || 0)),
  }));
}

function mapTransactionRow(payment, invoice) {
  const systemAmount = toNumber(invoice?.amount);
  const actualAmount = toNumber(payment.amount);
  let matchStatus = "MATCHED";

  if (payment.status === "PENDING") {
    matchStatus = "PENDING";
  } else if (systemAmount !== actualAmount) {
    matchStatus = "MISMATCH";
  }

  return {
    id: payment.id,
    refNumber: payment.transactionCode || `PAY-${payment.id}`,
    invoiceId: payment.invoiceId,
    contractId: payment.contractId,
    amount: actualAmount,
    status: payment.status,
    matchStatus,
    variance: roundMoney(actualAmount - systemAmount),
    issueDate: invoice?.issueDate || null,
    transactionDate: payment.paidAt,
    systemAmount,
    actualAmount,
    notes: matchStatus === "MISMATCH" ? "So tien thanh toan lech voi so tien he thong" : null,
    invoice,
  };
}

module.exports = {
  supabase,
  AppError,
  TABLES,
  ensureClient,
  toNumber,
  roundMoney,
  includesAny,
  buildPagination,
  fetchByIds,
  fetchOne,
  indexBy,
  groupBy,
  getDaysInMonth,
  normalizeInvoiceStatus,
  normalizePaymentStatus,
  normalizeContractStatus,
  normalizeInvoiceType,
  normalizeRefundStatus,
  normalizeReconciliationStatus,
  mapInvoiceStatusToDb,
  mapPaymentStatusToDb,
  mapRefundStatusToDb,
  mapReconciliationStatusToDb,
  calculateDepositFormula,
  calculateProratedFirstRent,
  mapContractRow,
  mapInvoiceRow,
  loadContractContext,
  loadInvoiceContext,
  loadReconciliationContext,
  mapReconciliationRow,
  buildChargePayloads,
  buildInvoiceItemPayloads,
  mapTransactionRow,
};
