const {
  supabase,
  AppError,
  TABLES,
  buildPagination,
  fetchByIds,
  fetchOne,
  indexBy,
  loadReconciliationContext,
  mapReconciliationRow,
  mapRefundStatusToDb,
  normalizeRefundStatus,
  roundMoney,
  toNumber,
  ensureClient,
} = require("./shared");

module.exports = {
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
        reason: "Hoan coc sau doi soat tai chinh",
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
      reason: "Hoan coc sau doi soat tai chinh",
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
        ten_nguoi_nhan: payload.beneficiaryName || payload.receiverName || "Khach thue",
        trang_thai: payload.status || "CHO_HOAN",
      })
      .select("*")
      .single();

    if (error) throw error;

    return this.getRefundDetail(insertedRefund.ma_phieu_hoan_coc);
  },

  async updateRefund(refundId, payload = {}) {
    ensureClient();

    const refund = await fetchOne(TABLES.refunds, "ma_phieu_hoan_coc", refundId);
    if (!refund) {
      throw new AppError("Refund voucher not found", 404);
    }

    const updatePayload = {
      so_tien_hoan: payload.refundAmount !== undefined ? toNumber(payload.refundAmount) : refund.so_tien_hoan,
      ten_nguoi_nhan:
        payload.beneficiaryName !== undefined
          ? payload.beneficiaryName
          : payload.receiverName !== undefined
            ? payload.receiverName
            : refund.ten_nguoi_nhan,
      trang_thai: payload.status !== undefined ? mapRefundStatusToDb(payload.status) : refund.trang_thai,
    };

    const { error } = await supabase.from(TABLES.refunds).update(updatePayload).eq("ma_phieu_hoan_coc", refundId);
    if (error) throw error;

    return this.getRefundDetail(refundId);
  },
};
