const AccountingModel = require("../models/accounting.model");

const AccountingService = {
  /**
   * Feature: Dashboard kế toán.
   * Tổng hợp nhanh KPI doanh thu, trạng thái phiếu thu, hoàn cọc và giao dịch để dashboard có dữ liệu thật.
   */
  async getDashboard(filters) {
    return AccountingModel.getDashboard(filters);
  },

  /**
   * Feature: Danh sách hợp đồng chờ lập khoản thu.
   * Trả về hợp đồng đã ký cùng thông tin khách thuê, phòng/giường và số tiền cọc tính theo nghiệp vụ hiện tại.
   */
  async getContracts(filters) {
    return AccountingModel.listContracts(filters);
  },

  /**
   * Feature: Chi tiết hợp đồng cho kế toán.
   * Dùng khi mở hợp đồng để xem thông tin thuê và lịch sử phiếu thu liên quan trước khi lập khoản thu.
   */
  async getContractDetail(contractId) {
    return AccountingModel.getContractDetail(contractId);
  },

  /**
   * Feature: Billing preview đầu kỳ.
   * Tính tiền thuê kỳ đầu, tiền cọc theo công thức nghiệp vụ và gom các khoản thu chưa lập hóa đơn.
   */
  async getBillingPreview(contractId) {
    return AccountingModel.getBillingPreview(contractId);
  },

  /**
   * Feature: Lập phiếu thu đầu kỳ.
   * Tạo hóa đơn đầu kỳ và chi tiết khoản thu trực tiếp trên DB hiện có, không đổi schema.
   */
  async generateInitialBilling(payload) {
    return AccountingModel.createInvoice(payload, "INITIAL");
  },

  /**
   * Feature: Danh sách và chi tiết hóa đơn kế toán.
   * Chuẩn hóa status về 4 trạng thái đã chốt để frontend không phải đoán từ raw DB status.
   */
  async getInvoices(filters) {
    return AccountingModel.listInvoices(filters);
  },

  async getInvoiceDetail(invoiceId) {
    return AccountingModel.getInvoiceDetail(invoiceId);
  },

  async updateInvoice(invoiceId, payload) {
    return AccountingModel.updateInvoice(invoiceId, payload);
  },

  /**
   * Feature: Tạo phiếu thu thường.
   * Dùng cho kế toán phát hành hóa đơn có line item trên bảng hóa đơn và chi tiết hóa đơn hiện tại.
   */
  async createInvoice(payload) {
    return AccountingModel.createInvoice(payload, "INITIAL");
  },

  /**
   * Feature: Phiếu phát sinh.
   * Sinh hóa đơn phát sinh sau hợp đồng và lưu luôn khoản thu phát sinh để tiện truy vết khi đối soát.
   */
  async createExtraInvoice(payload) {
    return AccountingModel.createInvoice(payload, "EXTRA");
  },

  /**
   * Feature: Ghi nhận và xác nhận thanh toán.
   * Thanh toán vẫn dùng bảng thanh_toan làm trung tâm như yêu cầu, sau khi xác nhận sẽ cộng dồn vào hóa đơn và phát sinh biên lai.
   */
  async getPayments(filters) {
    return AccountingModel.listPayments(filters);
  },

  async recordPayment(payload) {
    return AccountingModel.createPayment(payload);
  },

  async confirmPayment(paymentId, actorProfileId) {
    return AccountingModel.confirmPayment(paymentId, actorProfileId);
  },

  /**
   * Feature: Tra soát giao dịch.
   * Tạm dùng dữ liệu từ thanh_toan so với số tiền hệ thống trên hóa đơn để tạo màn hình đối chiếu cơ bản.
   */
  async getTransactions(filters) {
    return AccountingModel.listTransactions(filters);
  },

  async getTransactionDetail(transactionId) {
    return AccountingModel.getTransactionDetail(transactionId);
  },

  async resolveTransaction(transactionId, payload) {
    return AccountingModel.resolveTransaction(transactionId, payload);
  },

  /**
   * Feature: Đối soát tài chính cuối hợp đồng.
   * Tạo bảng đối soát có thể dùng làm chứng từ nghiệp vụ trước khi sinh phiếu hoàn cọc hoặc phiếu thanh toán phát sinh.
   */
  async getReconciliations(filters) {
    return AccountingModel.listReconciliations(filters);
  },

  async getReconciliationDetail(reconciliationId) {
    return AccountingModel.getReconciliationDetail(reconciliationId);
  },

  async createReconciliation(payload) {
    return AccountingModel.createReconciliation(payload);
  },

  async updateReconciliation(reconciliationId, payload) {
    return AccountingModel.updateReconciliation(reconciliationId, payload);
  },

  /**
   * Feature: Phiếu hoàn cọc.
   * Phiếu hoàn cọc chỉ được tạo từ dữ liệu đối soát đã có, giữ đúng vai trò chứng từ sau bước đối soát.
   */
  async getRefunds(filters) {
    return AccountingModel.listRefunds(filters);
  },

  async getRefundDetail(refundId) {
    return AccountingModel.getRefundDetail(refundId);
  },

  async createRefund(payload) {
    return AccountingModel.createRefund(payload);
  },

  async updateRefund(refundId, payload) {
    return AccountingModel.updateRefund(refundId, payload);
  },
};

module.exports = AccountingService;
