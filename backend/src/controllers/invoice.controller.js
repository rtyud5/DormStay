const InvoiceService = require("../services/invoice.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { AppError } = require("../utils/errors");

const InvoiceController = {
  /**
   * GET /api/invoices
   */
  listInvoices: asyncHandler(async (req, res) => {
    const { thoi_gian, phuong_thuc, ma_hop_dong, trang_thai, page = 1, limit = 20 } = req.query;

    if (Number(limit) > 100) {
      throw new AppError("Limit tối đa là 100", 400);
    }

    const result = await InvoiceService.listInvoices({
      thoi_gian,
      phuong_thuc,
      ma_hop_dong,
      trang_thai,
      page: Number(page),
      limit: Number(limit),
    });

    return sendSuccess(res, result, "Lấy danh sách phiếu thu thành công");
  }),

  /**
   * GET /api/invoices/:id
   */
  getInvoiceDetail: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const invoice = await InvoiceService.getInvoiceDetail(Number(id));
    return sendSuccess(res, invoice, "Lấy chi tiết phiếu thu thành công");
  }),
};

module.exports = InvoiceController;
