module.exports = {
  id: "accounting-dashboard-page",
  frontendPageName: "AccountingDashboardPage",
  frontendFile: "frontend/src/pages/accounting/AccountingDashboardPage.jsx",
  routePath: "/accounting/dashboard",
  reviewStatus: "PENDING_REVIEW",
  apiStatus: "DISABLED",
  purpose: "Dashboard overview for accounting KPIs, recent documents, and operational alerts.",
  reviewFocus: [
    "Clarify which KPI cards are truly required for accounting decisions.",
    "Separate dashboard summary APIs from detail-page APIs.",
    "Define which widgets are real-time and which are cached summaries.",
  ],
};
