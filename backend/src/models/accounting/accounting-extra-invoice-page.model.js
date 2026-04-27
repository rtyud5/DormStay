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
} = require("./shared");

const PAGE_SPEC = {
  id: "accounting-extra-invoice-page",
  frontendPageName: "AccountingExtraInvoicePage",
  frontendFile: "frontend/src/pages/accounting/AccountingExtraInvoicePage.jsx",
  routePath: "/accounting/extra-invoices",
  reviewStatus: "IN_PROGRESS",
  apiStatus: "PARTIALLY_ENABLED",
  purpose: "Settlement-payment list page for additional payment vouchers created from finalized reconciliation.",
  reviewFocus: [
    "List vouchers from phieu_thanh_toan_phat_sinh with accounting-friendly contract/customer context.",
    "Keep this page read-only; payment status transitions are updated by teammate workflow.",
    "Support status and keyword filters for operational follow-up.",
  ],
};

function normalizeSettlementStatus(rawStatus) {
  const value = String(rawStatus || "").toUpperCase();
  return value === "DA_THANH_TOAN" ? "DA_THANH_TOAN" : "CHO_THANH_TOAN";
}

function mapSettlementVoucher(row, context) {
  const contract = context.contractMap[row.ma_hop_dong] || null;
  const mappedContract = contract ? mapContractRow(contract, context.contractContext) : null;

  return {
    id: row.ma_phieu_tt_phat_sinh,
    reconciliationId: row.ma_doi_soat,
    contractId: row.ma_hop_dong,
    customerName: mappedContract?.customerName || "Khach thue chua cap nhat",
    customerPhone: mappedContract?.customerPhone || "",
    roomNumber: mappedContract?.roomNumber || "",
    bedNumber: mappedContract?.bedNumber || "",
    amount: toNumber(row.so_tien_thanh_toan),
    status: normalizeSettlementStatus(row.trang_thai),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
      if (voucher.status === "DA_THANH_TOAN") {
        summary.paid += 1;
      } else {
        summary.pending += 1;
      }

      summary.total += 1;
      return summary;
    },
    { total: 0, pending: 0, paid: 0 },
  );
}

const AccountingExtraInvoicePageModel = {
  ...PAGE_SPEC,

  async listSettlementVouchers(filters = {}) {
    ensureClient();

    const { data: voucherRows, error } = await supabase
      .from(TABLES.settlementPayments)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      throw error;
    }

    const contractIds = [...new Set((voucherRows || []).map((item) => item.ma_hop_dong).filter(Boolean))];
    const contracts = await fetchByIds(TABLES.contracts, "ma_hop_dong", contractIds);
    const contractContext = await loadContractContext(contracts);
    const context = {
      contractMap: indexBy(contracts, "ma_hop_dong"),
      contractContext,
    };

    const mappedVouchers = (voucherRows || []).map((row) => mapSettlementVoucher(row, context));
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

  async getSettlementVoucherDetail(voucherId) {
    ensureClient();

    const { data: row, error } = await supabase
      .from(TABLES.settlementPayments)
      .select("*")
      .eq("ma_phieu_tt_phat_sinh", voucherId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!row) {
      throw new AppError("Additional payment voucher not found", 404);
    }

    const contracts = await fetchByIds(TABLES.contracts, "ma_hop_dong", [row.ma_hop_dong]);
    const contractContext = await loadContractContext(contracts);
    const context = {
      contractMap: indexBy(contracts, "ma_hop_dong"),
      contractContext,
    };

    return mapSettlementVoucher(row, context);
  },

  async confirmSettlementVouchersCash(payload = {}) {
    ensureClient();

    const voucherIds = [...new Set((payload.voucherIds || []).map((id) => String(id || "").trim()).filter(Boolean))];
    if (!voucherIds.length) {
      throw new AppError("voucherIds is required", 400);
    }

    const { data: existingRows, error: queryError } = await supabase
      .from(TABLES.settlementPayments)
      .select("*")
      .in("ma_phieu_tt_phat_sinh", voucherIds);

    if (queryError) {
      throw queryError;
    }

    if (!existingRows || existingRows.length === 0) {
      throw new AppError("Additional payment vouchers not found", 404);
    }

    const payableRows = existingRows.filter((row) => normalizeSettlementStatus(row.trang_thai) !== "DA_THANH_TOAN");
    const payableIds = payableRows.map((row) => row.ma_phieu_tt_phat_sinh);

    if (!payableIds.length) {
      return {
        updatedCount: 0,
        skippedCount: existingRows.length,
        requestedIds: voucherIds,
        updatedItems: [],
      };
    }

    const { data: updatedRows, error: updateError } = await supabase
      .from(TABLES.settlementPayments)
      .update({
        trang_thai: "DA_THANH_TOAN",
        updated_at: new Date().toISOString(),
      })
      .in("ma_phieu_tt_phat_sinh", payableIds)
      .select("*");

    if (updateError) {
      throw updateError;
    }

    const contractIds = [...new Set((updatedRows || []).map((item) => item.ma_hop_dong).filter(Boolean))];
    const contracts = await fetchByIds(TABLES.contracts, "ma_hop_dong", contractIds);
    const contractContext = await loadContractContext(contracts);
    const context = {
      contractMap: indexBy(contracts, "ma_hop_dong"),
      contractContext,
    };

    const updatedItems = (updatedRows || []).map((row) => mapSettlementVoucher(row, context));

    return {
      updatedCount: updatedItems.length,
      skippedCount: existingRows.length - updatedItems.length,
      requestedIds: voucherIds,
      updatedItems,
    };
  },
};

module.exports = AccountingExtraInvoicePageModel;
