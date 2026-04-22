module.exports = {
  id: "accounting-billing-page",
  frontendPageName: "AccountingBillingPage",
  frontendFile: "frontend/src/pages/accounting/AccountingBillingPage.jsx",
  routePath: "/accounting/billing",
  reviewStatus: "PENDING_REVIEW",
  apiStatus: "DISABLED",
  purpose: "Initial billing workbench for accounting to generate first-period invoices from contract context.",
  reviewFocus: [
    "Define required contract context for first billing generation.",
    "Decide whether preview calculation and create invoice should remain separate APIs.",
    "Clarify line item ownership between billing UI and backend rule engine.",
  ],
};
