const {
  supabase,
  AppError,
  TABLES,
  ensureClient,
  buildPagination,
  includesAny,
  loadContractContext,
  mapContractRow,
} = require("./shared");

const PAGE_SPEC = {
  id: "accounting-contract-list-page",
  frontendPageName: "AccountingContractListPage",
  frontendFile: "frontend/src/pages/accounting/AccountingContractListPage.jsx",
  routePath: "/accounting/contracts",
  reviewStatus: "IN_PROGRESS",
  apiStatus: "PARTIALLY_ENABLED",
  purpose: "Contract list for accounting review before billing, reconciliation, and follow-up actions.",
  reviewFocus: [
    "Support dashboard and accounting contract page with one normalized contract payload.",
    "Prioritize practical filters (status/search) before adding complex analytics.",
    "Keep response compatible with billing and reconciliation linked navigation.",
  ],
};

function matchStatus(contract, status) {
  const normalized = String(status || "").toUpperCase();
  if (!normalized || normalized === "ALL") {
    return true;
  }

  return String(contract.status || "").toUpperCase() === normalized || includesAny(contract.rawStatus, [normalized]);
}

function matchKeyword(contract, keyword) {
  const search = String(keyword || "")
    .trim()
    .toLowerCase();
  if (!search) {
    return true;
  }

  return [
    contract.id,
    contract.customerName,
    contract.customerPhone,
    contract.roomNumber,
    contract.bedNumber,
    contract.buildingName,
    contract.floorName,
  ]
    .map((value) => String(value || "").toLowerCase())
    .some((value) => value.includes(search));
}

const AccountingContractListPageModel = {
  ...PAGE_SPEC,

  async listContracts(filters = {}) {
    ensureClient();

    const { data: contractRows, error } = await supabase
      .from(TABLES.contracts)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      throw error;
    }

    const rows = contractRows || [];
    const contractContext = await loadContractContext(rows);
    const mappedContracts = rows.map((row) => mapContractRow(row, contractContext));

    const filteredContracts = mappedContracts.filter(
      (contract) => matchStatus(contract, filters.status) && matchKeyword(contract, filters.search),
    );

    const pagination = buildPagination(filters.page, filters.limit || 20);
    const items = filteredContracts.slice(pagination.from, pagination.to + 1);

    return {
      items,
      total: filteredContracts.length,
      page: pagination.currentPage,
      limit: pagination.currentLimit,
    };
  },

  async getContractDetail(contractId) {
    ensureClient();

    const { data: contract, error } = await supabase
      .from(TABLES.contracts)
      .select("*")
      .eq("ma_hop_dong", contractId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const contractContext = await loadContractContext([contract]);
    return mapContractRow(contract, contractContext);
  },
};

module.exports = AccountingContractListPageModel;
