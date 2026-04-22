module.exports = {
  id: "accounting-invoice-list-page",
  frontendPageName: "AccountingInvoiceListPage",
  frontendFile: "frontend/src/pages/accounting/AccountingInvoiceListPage.jsx",
  routePath: "/accounting/invoices",
  reviewStatus: "PENDING_REVIEW",
  apiStatus: "DISABLED",
  purpose: "Invoice list and invoice detail page model for accounting receivables and status tracking.",
  reviewFocus: [
    "Define invoice list filters by status, type, and collection workflow.",
    "Clarify whether payment history belongs in invoice detail or a separate endpoint.",
    "Split initial billing invoices and extra invoices only if the UI truly needs separate APIs.",
  ],
};
