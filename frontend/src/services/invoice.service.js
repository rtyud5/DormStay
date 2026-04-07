// frontend/src/services/invoice.service.js
import api from "./api";

const InvoiceService = {
  /**
   * Lấy danh sách phiếu thu
   * @param {Object} params - { thoi_gian, phuong_thuc, ma_hop_dong, trang_thai, page, limit }
   */
  getInvoices: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== ""),
    );
    const response = await api.get("/invoices", { params: cleanParams });
    return response.data.data;
  },

  getInvoiceDetail: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data.data;
  },
};

export default InvoiceService;
