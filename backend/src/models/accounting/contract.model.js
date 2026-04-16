const {
  supabase,
  AppError,
  TABLES,
  buildPagination,
  calculateDepositFormula,
  calculateProratedFirstRent,
  fetchByIds,
  fetchOne,
  loadContractContext,
  loadInvoiceContext,
  mapContractRow,
  mapInvoiceRow,
  roundMoney,
  toNumber,
  ensureClient,
} = require("./shared");

module.exports = {
  async listContracts(filters = {}) {
    ensureClient();

    const pagination = buildPagination(filters.page, filters.limit);
    const { data, error, count } = await supabase
      .from(TABLES.contracts)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(pagination.from, pagination.to);

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
        description: "Tien thue ky dau duoc prorate tu ngay vao o den het thang",
        quantity: 1,
        unitPrice: proratedRent,
        amount: proratedRent,
      },
      {
        category: "TIEN_COC",
        description: `Tien coc theo nghiep vu: 2 thang tien thue x ${deposit.bedCount} giuong`,
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
};
