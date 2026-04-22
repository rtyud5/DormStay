module.exports = {
  id: "accounting-contract-list-page",
  frontendPageName: "AccountingContractListPage",
  frontendFile: "frontend/src/pages/accounting/AccountingContractListPage.jsx",
  routePath: "/accounting/contracts",
  reviewStatus: "PENDING_REVIEW",
  apiStatus: "DISABLED",
  purpose: "Contract list for accounting review before billing, reconciliation, and follow-up actions.",
  reviewFocus: [
    "Decide the exact filters accounting needs for contracts.",
    "Define the contract detail shape used by billing and reconciliation.",
    "Remove fields that belong to manager or sales workflows.",
  ],
};
