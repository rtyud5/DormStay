const AccountingPageModels = require("../models/accounting");

const AccountingService = {
  getPageModelRegistry() {
    return Object.values(AccountingPageModels).map((pageModel) => ({
      id: pageModel.id,
      frontendPageName: pageModel.frontendPageName,
      frontendFile: pageModel.frontendFile,
      routePath: pageModel.routePath,
      reviewStatus: pageModel.reviewStatus,
      apiStatus: pageModel.apiStatus,
      purpose: pageModel.purpose,
      reviewFocus: pageModel.reviewFocus,
    }));
  },

  getApiResetStatus() {
    return {
      status: "ACCOUNTING_API_TEMPORARILY_DISABLED",
      message: "Accounting APIs are temporarily disabled for page-by-page review and redesign.",
      pages: this.getPageModelRegistry(),
    };
  },

  async getReconciliationWorkItems(filters) {
    return AccountingPageModels.accountingReconciliationPageModel.listWorkItems(filters);
  },

  async getReconciliationWorkItemDetail(checkoutRequestId) {
    return AccountingPageModels.accountingReconciliationPageModel.getWorkItemDetail(checkoutRequestId);
  },

  async previewReconciliation(payload) {
    return AccountingPageModels.accountingReconciliationPageModel.preview(payload);
  },

  async createReconciliationDraft(payload) {
    return AccountingPageModels.accountingReconciliationPageModel.createDraft(payload);
  },

  async getReconciliationDetail(reconciliationId) {
    return AccountingPageModels.accountingReconciliationPageModel.getReconciliationDetail(reconciliationId);
  },

  async updateReconciliationDraft(reconciliationId, payload) {
    return AccountingPageModels.accountingReconciliationPageModel.updateDraft(reconciliationId, payload);
  },

  async finalizeReconciliation(reconciliationId) {
    return AccountingPageModels.accountingReconciliationPageModel.finalize(reconciliationId);
  },

  async createRefundFromReconciliation(reconciliationId, payload) {
    return AccountingPageModels.accountingReconciliationPageModel.createRefundVoucher(reconciliationId, payload);
  },

  async createAdditionalPaymentFromReconciliation(reconciliationId, payload) {
    return AccountingPageModels.accountingReconciliationPageModel.createAdditionalPaymentVoucher(
      reconciliationId,
      payload,
    );
  },

  async getInitialBillingPendingContracts(filters) {
    return AccountingPageModels.accountingBillingPageModel.listPendingContracts(filters);
  },

  async getInitialBillingPreview(contractId) {
    return AccountingPageModels.accountingBillingPageModel.preview(contractId);
  },

  async createInitialBillingInvoice(contractId, payload) {
    return AccountingPageModels.accountingBillingPageModel.createInitialInvoice(contractId, payload);
  },

  async getInvoices(filters) {
    return AccountingPageModels.accountingInvoiceListPageModel.listInvoices(filters);
  },

  async getInvoiceDetail(invoiceId) {
    return AccountingPageModels.accountingInvoiceListPageModel.getInvoiceDetail(invoiceId);
  },

  async getAdditionalPaymentVouchers(filters) {
    return AccountingPageModels.accountingExtraInvoicePageModel.listSettlementVouchers(filters);
  },

  async getAdditionalPaymentVoucherDetail(voucherId) {
    return AccountingPageModels.accountingExtraInvoicePageModel.getSettlementVoucherDetail(voucherId);
  },
};

module.exports = AccountingService;
