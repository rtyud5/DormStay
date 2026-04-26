const {
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
  normalizeContractStatus,
  loadContractContext,
  mapContractRow,
  loadInvoiceContext,
  mapInvoiceRow,
  getDaysInMonth,
  buildChargePayloads,
  buildInvoiceItemPayloads,
} = require("./shared");

const PAGE_SPEC = {
  id: "accounting-billing-page",
  frontendPageName: "AccountingBillingPage",
  frontendFile: "frontend/src/pages/accounting/AccountingBillingPage.jsx",
  routePath: "/accounting/billing",
  reviewStatus: "IN_PROGRESS",
  apiStatus: "PARTIALLY_ENABLED",
  purpose: "Initial billing workbench for accounting to generate first-period invoices from contract context.",
  reviewFocus: [
    "Only first-month rent and extra charges are included in this flow.",
    "Deposit workflow is intentionally excluded from initial billing APIs.",
    "Contract-level billing preview and create are separated for UI responsiveness.",
  ],
};

function toDateOnly(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function isInitialBillingType(rawType) {
  return includesAny(rawType, ["THANG_DAU", "KY_DAU", "INITIAL"]);
}

function mapExtraChargeLineItems(extraCharges = []) {
  if (!Array.isArray(extraCharges)) {
    return [];
  }

  return extraCharges
    .map((item, index) => {
      const amount = roundMoney(toNumber(item?.amount ?? item?.price));
      const description = String(item?.name || item?.description || `Phu phi ${index + 1}`).trim();

      return {
        category: "PHU_PHI",
        description,
        quantity: 1,
        unitPrice: amount,
        amount,
      };
    })
    .filter((item) => item.amount > 0 && item.description);
}

function buildInitialRentLineItem(contract) {
  const monthlyRent = roundMoney(toNumber(contract.gia_thue_co_ban_thang));
  const startDate = contract.ngay_vao_o ? new Date(contract.ngay_vao_o) : null;
  const daysInMonth = contract.ngay_vao_o ? getDaysInMonth(contract.ngay_vao_o) : 30;
  const rentDays = startDate ? Math.max(daysInMonth - startDate.getDate() + 1, 1) : daysInMonth;
  const dailyRate = daysInMonth > 0 ? roundMoney(monthlyRent / daysInMonth) : monthlyRent;
  const rentAmount = roundMoney(dailyRate * rentDays);

  return {
    category: "TIEN_THUE_THANG_DAU",
    description: `Tien thue ky dau (${rentDays}/${daysInMonth} ngay)`,
    quantity: rentDays,
    unitPrice: dailyRate,
    amount: rentAmount,
    period: {
      daysInMonth,
      rentDays,
      startDate: contract.ngay_vao_o || null,
    },
  };
}

async function mapContractsWithContext(contractRows = []) {
  if (!contractRows.length) {
    return [];
  }

  const context = await loadContractContext(contractRows);
  return contractRows.map((contract) => mapContractRow(contract, context));
}

async function getActiveInitialBillingInvoiceContractIds(contractIds = []) {
  if (!contractIds.length) {
    return new Set();
  }

  const invoices = await fetchByIds(TABLES.invoices, "ma_hop_dong", contractIds);

  const existingInitialBillingContracts = invoices
    .filter(
      (invoice) => isInitialBillingType(invoice.loai_hoa_don) && !includesAny(invoice.trang_thai, ["HUY", "CANCEL"]),
    )
    .map((invoice) => Number(invoice.ma_hop_dong));

  return new Set(existingInitialBillingContracts);
}

const AccountingBillingPageModel = {
  ...PAGE_SPEC,

  async listPendingContracts(filters = {}) {
    ensureClient();

    const { data: contractRows, error } = await supabase
      .from(TABLES.contracts)
      .select("*")
      .in("trang_thai", ["HIEU_LUC", "DANG_XU_LY", "CHO_HIEU_LUC"])
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      throw error;
    }

    const mappedContracts = await mapContractsWithContext(contractRows || []);
    const existingInitialBillingContractIds = await getActiveInitialBillingInvoiceContractIds(
      mappedContracts.map((item) => item.id),
    );

    const pendingContracts = mappedContracts
      .filter((item) => !existingInitialBillingContractIds.has(Number(item.id)))
      .map((item) => {
        const rentLineItem = buildInitialRentLineItem(item.raw);

        return {
          ...item,
          firstMonthRent: {
            amount: rentLineItem.amount,
            unitPrice: rentLineItem.unitPrice,
            quantity: rentLineItem.quantity,
            period: rentLineItem.period,
          },
        };
      });

    const statusFilter = String(filters.status || "ALL").toUpperCase();
    const searchKeyword = String(filters.search || "")
      .trim()
      .toLowerCase();
    const filteredContracts = pendingContracts.filter((item) => {
      const matchedStatus = statusFilter === "ALL" || item.status === statusFilter;
      if (!matchedStatus) {
        return false;
      }

      if (!searchKeyword) {
        return true;
      }

      return [item.id, item.customerName, item.roomNumber, item.bedNumber]
        .map((value) => String(value || "").toLowerCase())
        .some((value) => value.includes(searchKeyword));
    });

    const pagination = buildPagination(filters.page, filters.limit || 10);
    const items = filteredContracts.slice(pagination.from, pagination.to + 1);

    return {
      items,
      total: filteredContracts.length,
      page: pagination.currentPage,
      limit: pagination.currentLimit,
    };
  },

  async preview(contractId) {
    ensureClient();

    const contract = await fetchOne(TABLES.contracts, "ma_hop_dong", contractId);
    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const [mappedContract] = await mapContractsWithContext([contract]);
    const rentLineItem = buildInitialRentLineItem(contract);

    return {
      contract: mappedContract,
      rentLineItem,
      summary: {
        rentAmount: rentLineItem.amount,
        extraAmount: 0,
        totalAmount: rentLineItem.amount,
      },
      options: {
        includeDeposit: false,
      },
    };
  },

  async createInitialInvoice(contractId, payload = {}) {
    ensureClient();

    const contract = await fetchOne(TABLES.contracts, "ma_hop_dong", contractId);
    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const normalizedContractStatus = normalizeContractStatus(contract);
    if (!["ACTIVE", "PROCESSING"].includes(normalizedContractStatus)) {
      throw new AppError("Only active or processing contracts can generate initial billing", 409);
    }

    const existingInitialInvoiceSet = await getActiveInitialBillingInvoiceContractIds([contractId]);
    if (existingInitialInvoiceSet.has(Number(contractId))) {
      throw new AppError("Initial invoice already exists for this contract", 409);
    }

    const rentLineItem = buildInitialRentLineItem(contract);
    const extraChargeLineItems = mapExtraChargeLineItems(payload.extraCharges);
    const lineItems = [rentLineItem, ...extraChargeLineItems];
    const totalAmount = roundMoney(lineItems.reduce((sum, item) => sum + toNumber(item.amount), 0));

    const issueDate = toDateOnly(payload.issueDate);
    const dueDate = payload.dueDate ? toDateOnly(payload.dueDate) : null;

    const { data: insertedInvoice, error: invoiceError } = await supabase
      .from(TABLES.invoices)
      .insert({
        ma_hop_dong: contractId,
        loai_hoa_don: "TIEN_THUE_KY_DAU",
        trang_thai: "CHO_THANH_TOAN",
        tong_so_tien: totalAmount,
        so_tien_da_thanh_toan: 0,
        ngay_lap: issueDate,
        ngay_den_han: dueDate,
      })
      .select("*")
      .single();

    if (invoiceError) {
      throw invoiceError;
    }

    let insertedCharges = [];
    if (lineItems.length) {
      const chargePayloads = buildChargePayloads(contractId, insertedInvoice.ma_hoa_don, lineItems, "KY_DAU");
      const { data: chargeRows, error: chargeError } = await supabase
        .from(TABLES.contractCharges)
        .insert(chargePayloads)
        .select("*");

      if (chargeError) {
        throw chargeError;
      }

      insertedCharges = chargeRows || [];
    }

    let insertedInvoiceItems = [];
    if (lineItems.length) {
      const invoiceItemPayloads = buildInvoiceItemPayloads(insertedInvoice.ma_hoa_don, lineItems, insertedCharges);
      const { data: invoiceItemRows, error: invoiceItemError } = await supabase
        .from(TABLES.invoiceItems)
        .insert(invoiceItemPayloads)
        .select("*");

      if (invoiceItemError) {
        throw invoiceItemError;
      }

      insertedInvoiceItems = invoiceItemRows || [];
    }

    const invoiceContext = await loadInvoiceContext([insertedInvoice], insertedInvoiceItems, []);
    const mappedInvoice = mapInvoiceRow(insertedInvoice, invoiceContext);
    const [mappedContract] = await mapContractsWithContext([contract]);

    return {
      contract: mappedContract,
      invoice: mappedInvoice,
      lineItems,
      summary: {
        rentAmount: rentLineItem.amount,
        extraAmount: roundMoney(extraChargeLineItems.reduce((sum, item) => sum + toNumber(item.amount), 0)),
        totalAmount,
      },
    };
  },
};

module.exports = AccountingBillingPageModel;
