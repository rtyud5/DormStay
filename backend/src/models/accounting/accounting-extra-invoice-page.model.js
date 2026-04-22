module.exports = {
  id: "accounting-extra-invoice-page",
  frontendPageName: "AccountingExtraInvoicePage",
  frontendFile: "frontend/src/pages/accounting/AccountingExtraInvoicePage.jsx",
  routePath: "/accounting/extra-invoices",
  reviewStatus: "PENDING_REVIEW",
  apiStatus: "DISABLED",
  purpose: "Extra charge and additional payment workbench used by accounting after normal contract billing.",
  reviewFocus: [
    "Clarify whether this page manages extra invoices only or full settlement payments.",
    "Define how payment confirmation should connect to extra invoices.",
    "Separate document generation from payment recording if needed.",
  ],
};
