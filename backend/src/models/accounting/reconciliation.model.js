const {
  supabase,
  AppError,
  TABLES,
  buildPagination,
  calculateDepositFormula,
  fetchByIds,
  fetchOne,
  loadContractContext,
  loadReconciliationContext,
  mapReconciliationRow,
  mapReconciliationStatusToDb,
  roundMoney,
  toNumber,
  ensureClient,
} = require("./shared");

module.exports = {
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

  async updateReconciliation(reconciliationId, payload = {}) {
    ensureClient();

    const reconciliation = await fetchOne(TABLES.reconciliations, "ma_doi_soat", reconciliationId);
    if (!reconciliation) {
      throw new AppError("Reconciliation not found", 404);
    }

    const updatePayload = {
      trang_thai:
        payload.status !== undefined ? mapReconciliationStatusToDb(payload.status) : reconciliation.trang_thai,
      so_tien_hoan_lai:
        payload.refundAmount !== undefined ? toNumber(payload.refundAmount) : reconciliation.so_tien_hoan_lai,
      so_tien_can_thanh_toan_them:
        payload.additionalPaymentAmount !== undefined
          ? toNumber(payload.additionalPaymentAmount)
          : reconciliation.so_tien_can_thanh_toan_them,
    };

    const { error: reconciliationError } = await supabase
      .from(TABLES.reconciliations)
      .update(updatePayload)
      .eq("ma_doi_soat", reconciliationId);
    if (reconciliationError) throw reconciliationError;

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
        if (detailError) throw detailError;
      }
    }

    return this.getReconciliationDetail(reconciliationId);
  },
};
