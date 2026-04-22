module.exports = {
  id: "accounting-refund-page",
  frontendPageName: "AccountingRefundPage",
  frontendFile: "frontend/src/pages/accounting/AccountingRefundPage.jsx",
  routePath: "/accounting/refunds",
  reviewStatus: "PENDING_REVIEW",
  apiStatus: "DISABLED",
  purpose: "Deposit refund page model for post-reconciliation refund creation and refund processing.",
  reviewFocus: [
    "Confirm refund inputs that come strictly from finalized reconciliation.",
    "Separate refund approval, execution, and completion states.",
    "Define which bank transfer fields belong to refund detail.",
  ],
};
