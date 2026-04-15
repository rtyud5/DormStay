const { supabase } = require("../config/supabase");
const { AppError } = require("../utils/errors");

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

function calculateDepositFormula(contract, room) {
  const monthlyRent = toNumber(contract.gia_thue_co_ban_thang || room?.gia_thang);
  const roomCapacity = Math.max(toNumber(room?.suc_chua), 1);
  const bedCount = contract.loai_muc_tieu === "PHONG" ? roomCapacity : 1;

  // Business rule: deposit = 2 months rent x number of rented beds.
  // For whole-room rentals the room capacity acts as rented bed count, so monthly rent is normalized per bed first.
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
    customerName: customer?.ho_ten || "Khách thuê chưa cập nhật",
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
    customerName: customer?.ho_ten || "Khách thuê chưa cập nhật",
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
    customerName: mappedContract?.customerName || "Khách thuê chưa cập nhật",
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

const AccountingModel = {
  async getDashboard(filters = {}) {
    ensureClient();

    const invoicesPromise = supabase
      .from(TABLES.invoices)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    const paymentsPromise = supabase
      .from(TABLES.payments)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    const refundsPromise = supabase
      .from(TABLES.refunds)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    const contractsPromise = supabase
      .from(TABLES.contracts)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const [invoiceResult, paymentResult, refundResult, contractResult] = await Promise.all([
      invoicesPromise,
      paymentsPromise,
      refundsPromise,
      contractsPromise,
    ]);

    if (invoiceResult.error) throw invoiceResult.error;
    if (paymentResult.error) throw paymentResult.error;
    if (refundResult.error) throw refundResult.error;
    if (contractResult.error) throw contractResult.error;

    const invoices = invoiceResult.data || [];
    const payments = paymentResult.data || [];
    const refunds = refundResult.data || [];
    const contracts = contractResult.data || [];
    const paymentGroup = groupBy(payments, "ma_hoa_don");
    const invoiceContext = await loadInvoiceContext(invoices, [], payments);
    const mappedInvoices = invoices.map((invoice) =>
      mapInvoiceRow(invoice, { ...invoiceContext, invoiceItemGroup: {} }),
    );
    const contractContext = await loadContractContext(contracts);
    const mappedContracts = contracts.map((contract) => mapContractRow(contract, contractContext));

    // Revenue on dashboard should reflect money actually collected.
    // The invoice table is the most stable source because confirmPayment keeps
    // so_tien_da_thanh_toan in sync even if payment status values vary.
    const totalRevenueFromInvoices = invoices.reduce(
      (sum, invoice) => sum + toNumber(invoice.so_tien_da_thanh_toan),
      0,
    );
    const totalRevenueFromConfirmedPayments = payments
      .filter((payment) => normalizePaymentStatus(payment) === "CONFIRMED")
      .reduce((sum, payment) => sum + toNumber(payment.so_tien), 0);
    const totalRevenue = Math.max(totalRevenueFromInvoices, totalRevenueFromConfirmedPayments);

    const invoiceStats = mappedInvoices.reduce(
      (accumulator, invoice) => {
        accumulator.total += 1;
        accumulator[invoice.status.toLowerCase()] += 1;
        return accumulator;
      },
      {
        total: 0,
        completed: 0,
        overdue: 0,
        pending: 0,
        cancelled: 0,
      },
    );

    const refundStats = refunds.reduce(
      (accumulator, refund) => {
        const status = normalizeRefundStatus(refund.trang_thai).toLowerCase();
        accumulator[status] += 1;
        return accumulator;
      },
      {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
      },
    );

    const transactionStats = payments.reduce(
      (accumulator, payment) => {
        const invoice = invoices.find((item) => item.ma_hoa_don === payment.ma_hoa_don);
        const systemAmount = toNumber(invoice?.tong_so_tien);
        const actualAmount = toNumber(payment.so_tien);
        const paymentStatus = normalizePaymentStatus(payment);

        accumulator.total += 1;

        if (paymentStatus === "CONFIRMED" && systemAmount === actualAmount) {
          accumulator.successful += 1;
        } else if (paymentStatus === "PENDING") {
          accumulator.pending += 1;
        } else {
          accumulator.mismatch += 1;
        }

        return accumulator;
      },
      {
        total: 0,
        successful: 0,
        mismatch: 0,
        pending: 0,
      },
    );

    const recentInvoices = mappedInvoices.slice(0, Number(filters.limit) || 5);

    const contractsNeedingBilling = mappedContracts
      .filter((contract) => {
        const contractInvoices = invoices.filter((invoice) => invoice.ma_hop_dong === contract.id);
        return contract.status === "ACTIVE" && contractInvoices.length === 0;
      })
      .slice(0, 5);

    return {
      totalRevenue: roundMoney(totalRevenue),
      monthlyChange: 0,
      monthlyChangePercent: 0,
      invoiceStats,
      refundStats,
      transactionStats,
      recentInvoices,
      contractsNeedingBilling,
    };
  },

  async listContracts(filters = {}) {
    ensureClient();

    const pagination = buildPagination(filters.page, filters.limit);
    let query = supabase
      .from(TABLES.contracts)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(pagination.from, pagination.to);

    const { data, error, count } = await query;
    if (error) throw error;

    const contractRows = data || [];
    const context = await loadContractContext(contractRows);
    let mappedContracts = contractRows.map((contract) => mapContractRow(contract, context));

    if (filters.status) {
      mappedContracts = mappedContracts.filter((contract) => contract.status === String(filters.status).toUpperCase());
    }

    if (filters.search) {
      const keyword = String(filters.search).toLowerCase();
      mappedContracts = mappedContracts.filter(
        (contract) =>
          String(contract.id).toLowerCase().includes(keyword) ||
          contract.customerName.toLowerCase().includes(keyword) ||
          contract.roomNumber.toLowerCase().includes(keyword),
      );
    }

    return {
      items: mappedContracts,
      total: count || mappedContracts.length,
      page: pagination.currentPage,
      limit: pagination.currentLimit,
    };
  },

  async getContractDetail(contractId) {
    const contract = await fetchOne(TABLES.contracts, "ma_hop_dong", contractId);
    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const context = await loadContractContext([contract]);
    const mappedContract = mapContractRow(contract, context);
    const contractInvoices = await fetchByIds(TABLES.invoices, "ma_hop_dong", [contractId]);
    const invoiceItems = contractInvoices.length
      ? await fetchByIds(
          TABLES.invoiceItems,
          "ma_hoa_don",
          contractInvoices.map((item) => item.ma_hoa_don),
        )
      : [];
    const payments = contractInvoices.length
      ? await fetchByIds(
          TABLES.payments,
          "ma_hoa_don",
          contractInvoices.map((item) => item.ma_hoa_don),
        )
      : [];
    const invoiceContext = await loadInvoiceContext(contractInvoices, invoiceItems, payments);

    return {
      ...mappedContract,
      invoices: contractInvoices.map((invoice) => mapInvoiceRow(invoice, invoiceContext)),
    };
  },

  async getBillingPreview(contractId) {
    const contract = await fetchOne(TABLES.contracts, "ma_hop_dong", contractId);
    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const context = await loadContractContext([contract]);
    const mappedContract = mapContractRow(contract, context);
    const bed = contract.ma_giuong ? context.bedMap[contract.ma_giuong] : null;
    const room = context.roomMap[contract.ma_phong || bed?.ma_phong || null] || null;
    const deposit = calculateDepositFormula(contract, room);
    const proratedRent = calculateProratedFirstRent(contract.ngay_vao_o, deposit.monthlyRent);

    const { data: extraChargeRows, error: extraChargeError } = await supabase
      .from(TABLES.contractCharges)
      .select("*")
      .eq("ma_hop_dong", contractId)
      .eq("trang_thai_lap_hoa_don", "CHUA_LAP");

    if (extraChargeError) throw extraChargeError;

    const lineItems = [
      {
        category: "TIEN_THUE_DAU_KY",
        description: "Tiền thuê kỳ đầu được prorate từ ngày vào ở đến hết tháng",
        quantity: 1,
        unitPrice: proratedRent,
        amount: proratedRent,
      },
      {
        category: "TIEN_COC",
        description: `Tiền cọc theo nghiệp vụ: 2 tháng tiền thuê x ${deposit.bedCount} giường`,
        quantity: deposit.bedCount,
        unitPrice: roundMoney(deposit.monthlyRentPerBed * 2),
        amount: deposit.totalDeposit,
      },
      ...(extraChargeRows || []).map((item) => ({
        category: item.danh_muc,
        description: item.mo_ta || item.danh_muc,
        quantity: 1,
        unitPrice: toNumber(item.so_tien),
        amount: toNumber(item.so_tien),
        chargeId: item.ma_khoan_thu,
      })),
    ];

    const totalAmount = lineItems.reduce((sum, item) => sum + toNumber(item.amount), 0);

    return {
      contract: mappedContract,
      rent: {
        monthlyRent: deposit.monthlyRent,
        proratedFirstRent: proratedRent,
      },
      deposit,
      lineItems,
      totalAmount: roundMoney(totalAmount),
    };
  },

  async listInvoices(filters = {}) {
    ensureClient();

    const pagination = buildPagination(filters.page, filters.limit);
    const { data, error, count } = await supabase
      .from(TABLES.invoices)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(pagination.from, pagination.to);

    if (error) throw error;

    const invoiceRows = data || [];
    const invoiceItems = invoiceRows.length
      ? await fetchByIds(
          TABLES.invoiceItems,
          "ma_hoa_don",
          invoiceRows.map((item) => item.ma_hoa_don),
        )
      : [];
    const payments = invoiceRows.length
      ? await fetchByIds(
          TABLES.payments,
          "ma_hoa_don",
          invoiceRows.map((item) => item.ma_hoa_don),
        )
      : [];
    const context = await loadInvoiceContext(invoiceRows, invoiceItems, payments);

    let mappedInvoices = invoiceRows.map((invoice) => mapInvoiceRow(invoice, context));

    if (filters.status) {
      mappedInvoices = mappedInvoices.filter((invoice) => invoice.status === String(filters.status).toUpperCase());
    }

    if (filters.invoiceType) {
      mappedInvoices = mappedInvoices.filter(
        (invoice) => invoice.invoiceType === String(filters.invoiceType).toUpperCase(),
      );
    }

    if (filters.search) {
      const keyword = String(filters.search).toLowerCase();
      mappedInvoices = mappedInvoices.filter(
        (invoice) =>
          String(invoice.id).toLowerCase().includes(keyword) ||
          String(invoice.contractId || "")
            .toLowerCase()
            .includes(keyword) ||
          invoice.customerName.toLowerCase().includes(keyword),
      );
    }

    return {
      items: mappedInvoices,
      total: count || mappedInvoices.length,
      page: pagination.currentPage,
      limit: pagination.currentLimit,
    };
  },

  async getInvoiceDetail(invoiceId) {
    const invoice = await fetchOne(TABLES.invoices, "ma_hoa_don", invoiceId);
    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    const invoiceItems = await fetchByIds(TABLES.invoiceItems, "ma_hoa_don", [invoiceId]);
    const payments = await fetchByIds(TABLES.payments, "ma_hoa_don", [invoiceId]);
    const context = await loadInvoiceContext([invoice], invoiceItems, payments);

    return mapInvoiceRow(invoice, context);
  },

  async createInvoice(payload = {}, mode = "INITIAL") {
    ensureClient();

    if (!payload.contractId) {
      throw new AppError("contractId is required", 400);
    }

    const contract = await fetchOne(TABLES.contracts, "ma_hop_dong", payload.contractId);
    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const lineItems = Array.isArray(payload.lineItems) ? payload.lineItems : [];
    if (!lineItems.length) {
      throw new AppError("lineItems is required", 400);
    }

    const totalAmount = roundMoney(
      lineItems.reduce((sum, item) => {
        const amount =
          item.amount !== undefined
            ? toNumber(item.amount)
            : toNumber(item.quantity || 1) * toNumber(item.unitPrice || 0);

        return sum + amount;
      }, 0),
    );

    const invoicePayload = {
      ma_hop_dong: payload.contractId,
      loai_hoa_don: payload.invoiceType || (mode === "EXTRA" ? "PHAT_SINH" : "INITIAL_BILLING"),
      trang_thai: "CHO_THANH_TOAN",
      tong_so_tien: totalAmount,
      so_tien_da_thanh_toan: 0,
      ngay_lap: payload.issueDate || new Date().toISOString().slice(0, 10),
      ngay_den_han: payload.dueDate || null,
      ma_tai_khoan_ngan_hang: payload.bankAccountCode || null,
      ma_tham_chieu_qr: payload.qrReference || null,
    };

    const { data: insertedInvoice, error: invoiceError } = await supabase
      .from(TABLES.invoices)
      .insert(invoicePayload)
      .select("*")
      .single();

    if (invoiceError) throw invoiceError;

    const chargePayloads = lineItems.map((item) => ({
      ma_hop_dong: payload.contractId,
      giai_doan_phat_sinh: mode === "EXTRA" ? "PHAT_SINH" : "DAU_KY",
      danh_muc: item.category || "KHAC",
      mo_ta: item.description || item.category || "Khoản thu hợp đồng",
      so_tien:
        item.amount !== undefined
          ? toNumber(item.amount)
          : roundMoney(toNumber(item.quantity || 1) * toNumber(item.unitPrice || 0)),
      trang_thai_lap_hoa_don: "DA_LAP",
      ma_hoa_don_da_lap: insertedInvoice.ma_hoa_don,
    }));

    const { data: insertedCharges, error: chargeError } = await supabase
      .from(TABLES.contractCharges)
      .insert(chargePayloads)
      .select("*");

    if (chargeError) throw chargeError;

    const invoiceItemPayloads = lineItems.map((item, index) => ({
      ma_hoa_don: insertedInvoice.ma_hoa_don,
      ma_khoan_thu: insertedCharges?.[index]?.ma_khoan_thu || null,
      danh_muc: item.category || "KHAC",
      mo_ta: item.description || item.category || "Khoản thu hợp đồng",
      so_luong: toNumber(item.quantity || 1),
      don_gia: item.unitPrice !== undefined ? toNumber(item.unitPrice) : toNumber(item.amount || 0),
      thanh_tien:
        item.amount !== undefined
          ? toNumber(item.amount)
          : roundMoney(toNumber(item.quantity || 1) * toNumber(item.unitPrice || 0)),
    }));

    const { error: itemError } = await supabase.from(TABLES.invoiceItems).insert(invoiceItemPayloads);

    if (itemError) throw itemError;

    return this.getInvoiceDetail(insertedInvoice.ma_hoa_don);
  },

  async listPayments(filters = {}) {
    ensureClient();

    const pagination = buildPagination(filters.page, filters.limit);
    const { data, error, count } = await supabase
      .from(TABLES.payments)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(pagination.from, pagination.to);

    if (error) throw error;

    const paymentRows = data || [];
    const invoiceIds = [...new Set(paymentRows.map((item) => item.ma_hoa_don).filter(Boolean))];
    const invoices = await fetchByIds(TABLES.invoices, "ma_hoa_don", invoiceIds);
    const invoiceContext = await loadInvoiceContext(invoices, [], paymentRows);
    const mappedInvoiceMap = indexBy(
      invoices.map((invoice) => mapInvoiceRow(invoice, { ...invoiceContext, invoiceItemGroup: {} })),
      "id",
    );

    const items = paymentRows.map((payment) => {
      const invoice = mappedInvoiceMap[payment.ma_hoa_don] || null;
      return {
        id: payment.ma_thanh_toan,
        invoiceId: payment.ma_hoa_don,
        contractId: invoice?.contractId || null,
        customerName: invoice?.customerName || "Khách thuê chưa cập nhật",
        amount: toNumber(payment.so_tien),
        method: payment.phuong_thuc,
        status: normalizePaymentStatus(payment),
        rawStatus: payment.trang_thai,
        transactionCode: payment.ma_giao_dich,
        payerName: payment.ten_nguoi_thanh_toan,
        paidAt: payment.thoi_gian_thanh_toan,
        confirmedAt: payment.thoi_gian_xac_nhan,
        invoice,
        raw: payment,
      };
    });

    return {
      items,
      total: count || items.length,
      page: pagination.currentPage,
      limit: pagination.currentLimit,
    };
  },

  async createPayment(payload = {}) {
    ensureClient();

    if (!payload.invoiceId) {
      throw new AppError("invoiceId is required", 400);
    }

    if (!payload.amount) {
      throw new AppError("amount is required", 400);
    }

    const invoice = await fetchOne(TABLES.invoices, "ma_hoa_don", payload.invoiceId);
    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    const insertPayload = {
      ma_hoa_don: payload.invoiceId,
      phuong_thuc: payload.method || payload.paymentMethod || "BANK_TRANSFER",
      trang_thai: "CHO_XAC_NHAN",
      so_tien: toNumber(payload.amount),
      ma_giao_dich: payload.transactionCode || null,
      ten_nguoi_thanh_toan: payload.payerName || null,
      thoi_gian_thanh_toan: payload.paidAt || new Date().toISOString(),
    };

    const { data, error } = await supabase.from(TABLES.payments).insert(insertPayload).select("*").single();

    if (error) throw error;

    return {
      id: data.ma_thanh_toan,
      invoiceId: data.ma_hoa_don,
      amount: toNumber(data.so_tien),
      method: data.phuong_thuc,
      status: normalizePaymentStatus(data),
      rawStatus: data.trang_thai,
      transactionCode: data.ma_giao_dich,
      payerName: data.ten_nguoi_thanh_toan,
      paidAt: data.thoi_gian_thanh_toan,
      raw: data,
    };
  },

  async confirmPayment(paymentId, actorProfileId) {
    ensureClient();

    const payment = await fetchOne(TABLES.payments, "ma_thanh_toan", paymentId);
    if (!payment) {
      throw new AppError("Payment not found", 404);
    }

    const { data: updatedPayment, error: paymentError } = await supabase
      .from(TABLES.payments)
      .update({
        trang_thai: "DA_XAC_NHAN",
        thoi_gian_xac_nhan: new Date().toISOString(),
      })
      .eq("ma_thanh_toan", paymentId)
      .select("*")
      .single();

    if (paymentError) throw paymentError;

    const invoice = await fetchOne(TABLES.invoices, "ma_hoa_don", updatedPayment.ma_hoa_don);
    const nextPaidAmount = roundMoney(toNumber(invoice?.so_tien_da_thanh_toan) + toNumber(updatedPayment.so_tien));
    const invoiceStatus = nextPaidAmount >= toNumber(invoice?.tong_so_tien) ? "DA_THANH_TOAN" : "CHO_THANH_TOAN";

    const { error: invoiceError } = await supabase
      .from(TABLES.invoices)
      .update({
        so_tien_da_thanh_toan: nextPaidAmount,
        trang_thai: invoiceStatus,
      })
      .eq("ma_hoa_don", updatedPayment.ma_hoa_don);

    if (invoiceError) throw invoiceError;

    if (actorProfileId) {
      const { error: receiptError } = await supabase.from(TABLES.receipts).insert({
        ma_thanh_toan: updatedPayment.ma_thanh_toan,
        ma_hoa_don: updatedPayment.ma_hoa_don,
        so_tien: toNumber(updatedPayment.so_tien),
        so_bien_lai: `BL-${updatedPayment.ma_thanh_toan}-${Date.now()}`,
        ma_ho_so_nguoi_lap: actorProfileId,
      });

      if (receiptError) throw receiptError;
    }

    const refreshedInvoice = await fetchOne(TABLES.invoices, "ma_hoa_don", updatedPayment.ma_hoa_don);
    if (refreshedInvoice?.ma_yeu_cau_thue && normalizeInvoiceType(refreshedInvoice.loai_hoa_don) === "DEPOSIT") {
      await supabase
        .from(TABLES.requests)
        .update({ trang_thai: "DA_DAT_COC" })
        .eq("ma_yeu_cau_thue", refreshedInvoice.ma_yeu_cau_thue);

      await supabase
        .from(TABLES.holds)
        .update({ trang_thai: "DA_XAC_NHAN_COC" })
        .eq("ma_yeu_cau_thue", refreshedInvoice.ma_yeu_cau_thue)
        .eq("trang_thai", "DANG_GIU");
    }

    return this.getInvoiceDetail(updatedPayment.ma_hoa_don);
  },

  async listTransactions(filters = {}) {
    const paymentResult = await this.listPayments(filters);
    const items = paymentResult.items.map((payment) => {
      const systemAmount = toNumber(payment.invoice?.amount);
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
        issueDate: payment.invoice?.issueDate || null,
        transactionDate: payment.paidAt,
        systemAmount,
        actualAmount,
        notes: matchStatus === "MISMATCH" ? "Số tiền thanh toán lệch với số tiền hệ thống" : null,
      };
    });

    return {
      ...paymentResult,
      items,
    };
  },

  async listReconciliations(filters = {}) {
    ensureClient();

    const pagination = buildPagination(filters.page, filters.limit);
    const { data, error, count } = await supabase
      .from(TABLES.reconciliations)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(pagination.from, pagination.to);

    if (error) throw error;

    const reconciliationRows = data || [];
    const reconciliationItems = reconciliationRows.length
      ? await fetchByIds(
          TABLES.reconciliationItems,
          "ma_doi_soat",
          reconciliationRows.map((item) => item.ma_doi_soat),
        )
      : [];
    const context = await loadReconciliationContext(reconciliationRows, reconciliationItems);
    const items = reconciliationRows.map((reconciliation) => mapReconciliationRow(reconciliation, context));

    return {
      items,
      total: count || items.length,
      page: pagination.currentPage,
      limit: pagination.currentLimit,
    };
  },

  async getReconciliationDetail(reconciliationId) {
    const reconciliation = await fetchOne(TABLES.reconciliations, "ma_doi_soat", reconciliationId);
    if (!reconciliation) {
      throw new AppError("Reconciliation not found", 404);
    }

    const lineItems = await fetchByIds(TABLES.reconciliationItems, "ma_doi_soat", [reconciliationId]);
    const context = await loadReconciliationContext([reconciliation], lineItems);

    return mapReconciliationRow(reconciliation, context);
  },

  async createReconciliation(payload = {}) {
    ensureClient();

    if (!payload.contractId) {
      throw new AppError("contractId is required", 400);
    }

    const contract = await fetchOne(TABLES.contracts, "ma_hop_dong", payload.contractId);
    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const contractContext = await loadContractContext([contract]);
    const bed = contract.ma_giuong ? contractContext.bedMap[contract.ma_giuong] : null;
    const room = contractContext.roomMap[contract.ma_phong || bed?.ma_phong || null] || null;
    const deposit = calculateDepositFormula(contract, room);
    const refundRatio = Math.min(Math.max(toNumber(payload.refundRatio || 100), 0), 100);
    const baseRefund = roundMoney(deposit.totalDeposit * (refundRatio / 100));
    const lineItems = Array.isArray(payload.lineItems) ? payload.lineItems : [];

    const totalCharges = lineItems
      .filter((item) => String(item.direction || "THU").toUpperCase() === "THU")
      .reduce((sum, item) => sum + toNumber(item.amount), 0);
    const totalAdjustmentsToCustomer = lineItems
      .filter((item) => String(item.direction || "THU").toUpperCase() === "CHI")
      .reduce((sum, item) => sum + toNumber(item.amount), 0);

    const netRefund = roundMoney(Math.max(baseRefund - totalCharges + totalAdjustmentsToCustomer, 0));
    const additionalPayment = roundMoney(Math.max(totalCharges - baseRefund - totalAdjustmentsToCustomer, 0));

    const { data: insertedReconciliation, error: reconciliationError } = await supabase
      .from(TABLES.reconciliations)
      .insert({
        ma_hop_dong: payload.contractId,
        so_tien_dat_coc_ban_dau: deposit.totalDeposit,
        so_tien_hoan_lai: netRefund,
        so_tien_can_thanh_toan_them: additionalPayment,
        trang_thai: payload.status || "CHO_CHOT",
      })
      .select("*")
      .single();

    if (reconciliationError) throw reconciliationError;

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

      if (detailError) throw detailError;
    }

    return this.getReconciliationDetail(insertedReconciliation.ma_doi_soat);
  },

  async listRefunds(filters = {}) {
    ensureClient();

    const pagination = buildPagination(filters.page, filters.limit);
    const { data, error, count } = await supabase
      .from(TABLES.refunds)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(pagination.from, pagination.to);

    if (error) throw error;

    const refundRows = data || [];
    const reconciliationIds = [...new Set(refundRows.map((item) => item.ma_doi_soat).filter(Boolean))];
    const reconciliations = await fetchByIds(TABLES.reconciliations, "ma_doi_soat", reconciliationIds);
    const reconciliationContext = await loadReconciliationContext(reconciliations);
    const reconciliationMap = indexBy(
      reconciliations.map((item) => mapReconciliationRow(item, reconciliationContext)),
      "id",
    );

    let items = refundRows.map((refund) => {
      const reconciliation = reconciliationMap[refund.ma_doi_soat] || null;
      const deductedAmount = reconciliation
        ? roundMoney(
            reconciliation.originalDeposit - reconciliation.refundAmount + reconciliation.additionalPaymentAmount,
          )
        : 0;

      return {
        id: refund.ma_phieu_hoan_coc,
        reconciliationId: refund.ma_doi_soat,
        contractId: refund.ma_hop_dong,
        customerName: reconciliation?.customerName || refund.ten_nguoi_nhan,
        originalDeposit: reconciliation?.originalDeposit || 0,
        deductedAmount,
        refundAmount: toNumber(refund.so_tien_hoan),
        refundRatio: reconciliation?.originalDeposit
          ? roundMoney((toNumber(refund.so_tien_hoan) / reconciliation.originalDeposit) * 100)
          : 0,
        reason: "Hoàn cọc sau đối soát tài chính",
        status: normalizeRefundStatus(refund.trang_thai),
        rawStatus: refund.trang_thai,
        refundMethod: null,
        beneficiaryName: refund.ten_nguoi_nhan,
      };
    });

    if (filters.status) {
      items = items.filter((refund) => refund.status === String(filters.status).toUpperCase());
    }

    if (filters.search) {
      const keyword = String(filters.search).toLowerCase();
      items = items.filter(
        (refund) =>
          String(refund.id).toLowerCase().includes(keyword) ||
          String(refund.contractId || "")
            .toLowerCase()
            .includes(keyword) ||
          refund.customerName.toLowerCase().includes(keyword),
      );
    }

    return {
      items,
      total: count || items.length,
      page: pagination.currentPage,
      limit: pagination.currentLimit,
    };
  },

  async getRefundDetail(refundId) {
    const refund = await fetchOne(TABLES.refunds, "ma_phieu_hoan_coc", refundId);
    if (!refund) {
      throw new AppError("Refund voucher not found", 404);
    }

    const reconciliations = await fetchByIds(TABLES.reconciliations, "ma_doi_soat", [refund.ma_doi_soat]);
    const context = await loadReconciliationContext(reconciliations);
    const reconciliation = reconciliations[0] ? mapReconciliationRow(reconciliations[0], context) : null;

    return {
      id: refund.ma_phieu_hoan_coc,
      reconciliationId: refund.ma_doi_soat,
      contractId: refund.ma_hop_dong,
      customerName: reconciliation?.customerName || refund.ten_nguoi_nhan,
      originalDeposit: reconciliation?.originalDeposit || 0,
      deductedAmount: reconciliation
        ? roundMoney(
            reconciliation.originalDeposit - reconciliation.refundAmount + reconciliation.additionalPaymentAmount,
          )
        : 0,
      refundAmount: toNumber(refund.so_tien_hoan),
      refundRatio: reconciliation?.originalDeposit
        ? roundMoney((toNumber(refund.so_tien_hoan) / reconciliation.originalDeposit) * 100)
        : 0,
      reason: "Hoàn cọc sau đối soát tài chính",
      status: normalizeRefundStatus(refund.trang_thai),
      rawStatus: refund.trang_thai,
      refundMethod: null,
      beneficiaryName: refund.ten_nguoi_nhan,
      reconciliation,
    };
  },

  async createRefund(payload = {}) {
    ensureClient();

    if (!payload.reconciliationId) {
      throw new AppError("reconciliationId is required", 400);
    }

    const reconciliation = await fetchOne(TABLES.reconciliations, "ma_doi_soat", payload.reconciliationId);
    if (!reconciliation) {
      throw new AppError("Reconciliation not found", 404);
    }

    if (toNumber(reconciliation.so_tien_hoan_lai) <= 0) {
      throw new AppError("Reconciliation does not have refundable balance", 400);
    }

    const { data: insertedRefund, error } = await supabase
      .from(TABLES.refunds)
      .insert({
        ma_doi_soat: payload.reconciliationId,
        ma_hop_dong: reconciliation.ma_hop_dong,
        so_tien_hoan: toNumber(payload.refundAmount || reconciliation.so_tien_hoan_lai),
        ten_nguoi_nhan: payload.beneficiaryName || payload.receiverName || "Khách thuê",
        trang_thai: payload.status || "CHO_HOAN",
      })
      .select("*")
      .single();

    if (error) throw error;

    return this.getRefundDetail(insertedRefund.ma_phieu_hoan_coc);
  },
};

module.exports = AccountingModel;
