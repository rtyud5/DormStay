const {
  supabase,
  AppError,
  TABLES,
  ensureClient,
  toNumber,
  buildPagination,
  fetchByIds,
  indexBy,
  loadContractContext,
  mapContractRow,
  normalizeRefundStatus,
  mapRefundStatusToDb,
} = require("./shared");

const PAGE_SPEC = {
  id: "accounting-refund-page",
  frontendPageName: "AccountingRefundPage",
  frontendFile: "frontend/src/pages/accounting/AccountingRefundPage.jsx",
  routePath: "/accounting/refunds",
  reviewStatus: "IN_PROGRESS",
  apiStatus: "ENABLED",
  purpose: "Deposit refund list page for vouchers created from finalized reconciliation.",
  reviewFocus: [
    "List vouchers from phieu_hoan_coc with contract/customer context.",
    "Support accounting operations to update beneficiary and refund status.",
    "Keep status mapping consistent between DB values and frontend statuses.",
  ],
};

function mapRefundVoucher(row, context) {
  const contract = context.contractMap[row.ma_hop_dong] || null;
  const mappedContract = contract ? mapContractRow(contract, context.contractContext) : null;
  const reconciliation = context.reconciliationMap[row.ma_doi_soat] || null;

  const originalDeposit =
    toNumber(reconciliation?.so_tien_dat_coc_ban_dau) || toNumber(mappedContract?.securityDeposit);
  const refundAmount = toNumber(row.so_tien_hoan);

  return {
    id: row.ma_phieu_hoan_coc,
    reconciliationId: row.ma_doi_soat,
    contractId: row.ma_hop_dong,
    customerId: mappedContract?.customerId || null,
    customerName: mappedContract?.customerName || "Khach thue chua cap nhat",
    customerPhone: mappedContract?.customerPhone || "",
    roomNumber: mappedContract?.roomNumber || "",
    bedNumber: mappedContract?.bedNumber || "",
    beneficiaryName: row.ten_nguoi_nhan || mappedContract?.customerName || "",
    originalDeposit,
    deductedAmount: Math.max(originalDeposit - refundAmount, 0),
    refundAmount,
    status: normalizeRefundStatus(row.trang_thai),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    issuedDate: row.created_at,
    rawStatus: row.trang_thai,
    raw: row,
  };
}

function matchStatus(voucher, status) {
  const normalized = String(status || "").toUpperCase();
  if (!normalized || normalized === "ALL") {
    return true;
  }

  return voucher.status === normalized;
}

function matchKeyword(voucher, keyword) {
  const search = String(keyword || "")
    .trim()
    .toLowerCase();
  if (!search) {
    return true;
  }

  return [
    voucher.id,
    voucher.reconciliationId,
    voucher.contractId,
    voucher.customerName,
    voucher.roomNumber,
    voucher.bedNumber,
  ]
    .map((value) => String(value || "").toLowerCase())
    .some((value) => value.includes(search));
}

function buildStatusSummary(vouchers) {
  return vouchers.reduce(
    (summary, voucher) => {
      if (voucher.status === "COMPLETED") {
        summary.completed += 1;
      } else if (voucher.status === "PROCESSING") {
        summary.processing += 1;
      } else if (voucher.status === "FAILED") {
        summary.failed += 1;
      } else {
        summary.pending += 1;
      }

      summary.total += 1;
      return summary;
    },
    { total: 0, pending: 0, processing: 0, completed: 0, failed: 0 },
  );
}

async function loadRefundContext(refundRows = []) {
  const contractIds = [...new Set(refundRows.map((item) => item.ma_hop_dong).filter(Boolean))];
  const reconciliationIds = [...new Set(refundRows.map((item) => item.ma_doi_soat).filter(Boolean))];

  const contracts = await fetchByIds(TABLES.contracts, "ma_hop_dong", contractIds);
  const reconciliations = await fetchByIds(TABLES.reconciliations, "ma_doi_soat", reconciliationIds);
  const contractContext = await loadContractContext(contracts);

  return {
    contractMap: indexBy(contracts, "ma_hop_dong"),
    reconciliationMap: indexBy(reconciliations, "ma_doi_soat"),
    contractContext,
  };
}

const AccountingRefundPageModel = {
  ...PAGE_SPEC,

  async listRefundVouchers(filters = {}) {
    ensureClient();

    const { data: refundRows, error } = await supabase
      .from(TABLES.refunds)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      throw error;
    }

    const context = await loadRefundContext(refundRows || []);
    const mappedVouchers = (refundRows || []).map((row) => mapRefundVoucher(row, context));
    const filteredVouchers = mappedVouchers.filter(
      (voucher) => matchStatus(voucher, filters.status) && matchKeyword(voucher, filters.search),
    );

    const pagination = buildPagination(filters.page, filters.limit || 10);
    const items = filteredVouchers.slice(pagination.from, pagination.to + 1);

    return {
      items,
      total: filteredVouchers.length,
      page: pagination.currentPage,
      limit: pagination.currentLimit,
      statusSummary: buildStatusSummary(filteredVouchers),
    };
  },

  async getRefundVoucherDetail(refundId) {
    ensureClient();

    const { data: row, error } = await supabase
      .from(TABLES.refunds)
      .select("*")
      .eq("ma_phieu_hoan_coc", refundId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!row) {
      throw new AppError("Refund voucher not found", 404);
    }

    const context = await loadRefundContext([row]);
    return mapRefundVoucher(row, context);
  },

  async updateRefundVoucher(refundId, payload = {}) {
    ensureClient();

    const updates = {};

    if (payload.beneficiaryName !== undefined) {
      updates.ten_nguoi_nhan = String(payload.beneficiaryName || "").trim();
    }

    if (payload.refundAmount !== undefined) {
      updates.so_tien_hoan = toNumber(payload.refundAmount);
    }

    if (payload.status !== undefined) {
      updates.trang_thai = mapRefundStatusToDb(payload.status);
    }

    if (!Object.keys(updates).length) {
      throw new AppError("No valid fields to update", 400);
    }

    updates.updated_at = new Date().toISOString();

    const { data: row, error } = await supabase
      .from(TABLES.refunds)
      .update(updates)
      .eq("ma_phieu_hoan_coc", refundId)
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!row) {
      throw new AppError("Refund voucher not found", 404);
    }

    const context = await loadRefundContext([row]);
    return mapRefundVoucher(row, context);
  },
};

module.exports = AccountingRefundPageModel;
