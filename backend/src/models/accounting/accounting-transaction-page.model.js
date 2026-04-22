module.exports = {
  id: "accounting-transaction-page",
  frontendPageName: "AccountingTransactionPage",
  frontendFile: "frontend/src/pages/accounting/AccountingTransactionPage.jsx",
  routePath: "/accounting/transactions",
  reviewStatus: "PENDING_REVIEW",
  apiStatus: "DISABLED",
  purpose: "Transaction investigation page model for accounting reconciliation of payment events and mismatches.",
  reviewFocus: [
    "Decide if transaction monitoring is internal-only or user-facing accounting workflow.",
    "Separate mismatch detection from manual resolution actions.",
    "Define the minimal transaction detail needed by accounting staff.",
  ],
};