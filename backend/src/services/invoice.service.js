// backend/src/services/invoice.service.js
const InvoiceModel = require("../models/invoice.model");

// ─── helpers ────────────────────────────────────────────────

function buildDateRange(thoi_gian) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-indexed

  if (!thoi_gian || thoi_gian === "thang_nay") {
    return {
      from: new Date(y, m, 1).toISOString().split("T")[0],
      to: new Date(y, m + 1, 0).toISOString().split("T")[0],
    };
  }
  if (thoi_gian === "thang_truoc") {
    return {
      from: new Date(y, m - 1, 1).toISOString().split("T")[0],
      to: new Date(y, m, 0).toISOString().split("T")[0],
    };
  }
  if (thoi_gian === "quy_nay") {
    const quarter = Math.floor(m / 3);
    return {
      from: new Date(y, quarter * 3, 1).toISOString().split("T")[0],
      to: new Date(y, quarter * 3 + 3, 0).toISOString().split("T")[0],
    };
  }
  // YYYY-MM
  if (/^\d{4}-\d{2}$/.test(thoi_gian)) {
    const [py, pm] = thoi_gian.split("-").map(Number);
    return {
      from: new Date(py, pm - 1, 1).toISOString().split("T")[0],
      to: new Date(py, pm, 0).toISOString().split("T")[0],
    };
  }
  return { from: null, to: null };
}

function getAvatarInitials(ho_ten) {
  if (!ho_ten) return "?";
  const words = ho_ten.trim().split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[words.length - 2][0] + words[words.length - 1][0]).toUpperCase();
}

const TRANG_THAI_LABELS = {
  THANH_TOAN_TOAN_BO: "Đã thanh toán",
  CHO_THANH_TOAN: "Chưa trả",
  THANH_TOAN_PHAN_TRAM: "Thanh toán một phần",
  THUA_TIEN: "Thừa tiền",
  QUA_HAN: "Quá hạn",
  HOAN_LAI: "Hoàn tiền",
};

function resolveDisplayStatus(inv) {
  const today = new Date().toISOString().split("T")[0];
  if (inv.trang_thai === "CHO_THANH_TOAN" && inv.ngay_den_han && inv.ngay_den_han < today) {
    return "QUA_HAN";
  }
  if (inv.loai_hoa_don === "HOAN_LAI") return "HOAN_LAI";
  return inv.trang_thai;
}

function mapInvoice(inv) {
  const today = new Date().toISOString().split("T")[0];

  // Lấy thông tin khách hàng từ hop_dong hoặc yeu_cau_thue
  const khach = inv.hop_dong?.ho_so_khach_hang || inv.yeu_cau_thue?.ho_so_khach_hang || null;

  // Lấy thanh toán đã xác nhận gần nhất
  const confirmedPayments = (inv.thanh_toan || [])
    .filter((tt) => tt.trang_thai === "DA_XAC_NHAN" || tt.thoi_gian_xac_nhan)
    .sort((a, b) => new Date(b.thoi_gian_xac_nhan || 0) - new Date(a.thoi_gian_xac_nhan || 0));
  const lastPayment = confirmedPayments[0] || null;

  const trang_thai_display = resolveDisplayStatus(inv);

  return {
    ma_hoa_don: inv.ma_hoa_don,
    loai_hoa_don: inv.loai_hoa_don,
    ma_hop_dong: inv.ma_hop_dong,
    khach_hang: khach
      ? {
          ma_ho_so: khach.ma_ho_so,
          ho_ten: khach.ho_ten || "N/A",
          avatar_initials: getAvatarInitials(khach.ho_ten),
        }
      : { ma_ho_so: null, ho_ten: "N/A", avatar_initials: "?" },
    tong_so_tien: Number(inv.tong_so_tien),
    so_tien_da_thanh_toan: Number(inv.so_tien_da_thanh_toan),
    ngay_lap: inv.ngay_lap,
    ngay_den_han: inv.ngay_den_han,
    trang_thai: inv.trang_thai,
    trang_thai_display,
    trang_thai_label: TRANG_THAI_LABELS[trang_thai_display] || trang_thai_display,
    phuong_thuc: lastPayment?.phuong_thuc || null,
    ngay_tra: lastPayment?.thoi_gian_xac_nhan || null,
    is_overdue: inv.trang_thai === "CHO_THANH_TOAN" && inv.ngay_den_han && inv.ngay_den_han < today,
  };
}

// ─── service ────────────────────────────────────────────────

const InvoiceService = {
  async listInvoices({ thoi_gian, phuong_thuc, ma_hop_dong: ma_hop_dong_search, trang_thai, page = 1, limit = 20 }) {
    const { from: from_date, to: to_date } = buildDateRange(thoi_gian);

    const [listResult, stats] = await Promise.all([
      InvoiceModel.list({
        from_date,
        to_date,
        phuong_thuc: phuong_thuc || null,
        ma_hop_dong_search: ma_hop_dong_search || null,
        trang_thai: trang_thai || null,
        page: Number(page),
        limit: Number(limit),
      }),
      InvoiceModel.getStats({ from_date, to_date }),
    ]);

    return {
      invoices: (listResult.data || []).map(mapInvoice),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: listResult.count || 0,
        total_pages: Math.ceil((listResult.count || 0) / Number(limit)),
      },
      stats,
    };
  },

  async getInvoiceDetail(ma_hoa_don) {
    const inv = await InvoiceModel.getById(ma_hoa_don);
    return mapInvoice(inv);
  },
};

module.exports = InvoiceService;
