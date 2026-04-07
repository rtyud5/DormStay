// frontend/src/pages/InvoiceListPage.jsx
import { useState, useEffect, useCallback } from "react";
import InvoiceService from "../services/invoice.service";

// ─── constants ────────────────────────────────────────────────
const TRANG_THAI_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "DA_THANH_TOAN", label: "Đã trả" },
  { value: "QUA_HAN", label: "Quá hạn" },
  { value: "CHO_THANH_TOAN", label: "Chưa trả" },
  { value: "HOAN_LAI", label: "Hoàn tiền" },
];

const PHUONG_THUC_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "CHUYEN_KHOAN", label: "Chuyển khoản" },
  { value: "TIEN_MAT", label: "Tiền mặt" },
  { value: "THE_TIN_DUNG", label: "Thẻ tín dụng" },
];

const THOI_GIAN_OPTIONS = [
  { value: "thang_nay", label: "Tháng này" },
  { value: "thang_truoc", label: "Tháng trước" },
  { value: "quy_nay", label: "Quý này" },
];

// ─── helpers ──────────────────────────────────────────────────
const formatCurrency = (n) => new Intl.NumberFormat("vi-VN").format(n || 0) + " đ";

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
};

const STATUS_CONFIG = {
  THANH_TOAN_TOAN_BO: { label: "Đã thanh toán", bg: "bg-emerald-100 text-emerald-700" },
  CHO_THANH_TOAN: { label: "Chưa trả", bg: "bg-blue-100 text-blue-700" },
  QUA_HAN: { label: "Quá hạn", bg: "bg-red-100 text-red-700" },
  THANH_TOAN_PHAN_TRAM: { label: "Thanh toán một phần", bg: "bg-yellow-100 text-yellow-700" },
  HOAN_LAI: { label: "Hoàn tiền", bg: "bg-gray-100 text-gray-600" },
};

// ─── sub-components ───────────────────────────────────────────
function AvatarBadge({ initials }) {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
    "bg-teal-100 text-teal-700",
  ];
  const idx = initials.charCodeAt(0) % colors.length;
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${colors[idx]}`}>
      {initials}
    </div>
  );
}

function StatusBadge({ trang_thai_display }) {
  const cfg = STATUS_CONFIG[trang_thai_display] || {
    label: trang_thai_display,
    bg: "bg-gray-100 text-gray-600",
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.bg}`}>{cfg.label}</span>;
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color || "text-gray-800"}`}>{formatCurrency(value)}</p>
      {sub !== undefined && <p className="text-xs text-gray-400 mt-0.5">{sub}%</p>}
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 5); i++) pages.push(i);

  return (
    <div className="flex items-center gap-2">
      <button
        className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`w-8 h-8 rounded-lg text-sm font-medium ${
            p === page ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        ›
      </button>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────
export default function InvoiceListPage() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    thoi_gian: "thang_nay",
    phuong_thuc: "",
    ma_hop_dong: "",
    trang_thai: "",
  });
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await InvoiceService.getInvoices({ ...filters, page, limit: 20 });
      setInvoices(result.invoices || []);
      setStats(result.stats || null);
      setPagination(result.pagination || { page: 1, total: 0, total_pages: 1 });
    } catch (err) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") fetchData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách Phiếu thu</h1>
          <p className="text-sm text-gray-500 mt-1">
            Giám sát thanh toán, theo dõi trạng thái và duy trì sức khỏe tài chính.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            ↓ Xuất CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            + Tạo mới
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Thời gian */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">THỜI GIAN</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.thoi_gian}
              onChange={(e) => handleFilterChange("thoi_gian", e.target.value)}
            >
              {THOI_GIAN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Phương thức */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">PHƯƠNG THỨC</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.phuong_thuc}
              onChange={(e) => handleFilterChange("phuong_thuc", e.target.value)}
            >
              {PHUONG_THUC_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mã hợp đồng */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">MÃ HỢP ĐỒNG</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: CTR-904"
              value={filters.ma_hop_dong}
              onChange={(e) => handleFilterChange("ma_hop_dong", e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>

        {/* Quick filter trạng thái */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-gray-500 font-medium">LỌC NHANH TRẠNG THÁI:</span>
          {TRANG_THAI_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filters.trang_thai === o.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => handleFilterChange("trang_thai", o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-medium text-gray-600">Không có phiếu thu nào</p>
            <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc tạo phiếu mới</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "MÃ PHIẾU",
                  "KHÁCH HÀNG",
                  "SỐ TIỀN",
                  "HẠN TRẢ",
                  "TRẠNG THÁI",
                  "PHƯƠNG THỨC",
                  "NGÀY TRẢ",
                  "THAO TÁC",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => (
                <tr key={inv.ma_hoa_don} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-blue-700">#INV-{inv.ma_hoa_don}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AvatarBadge initials={inv.khach_hang.avatar_initials} />
                      <span className="text-sm text-gray-800">{inv.khach_hang.ho_ten}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{formatCurrency(inv.tong_so_tien)}</td>
                  <td
                    className={`px-4 py-3 text-sm ${inv.is_overdue ? "text-red-600 font-semibold" : "text-gray-600"}`}
                  >
                    {formatDate(inv.ngay_den_han)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge trang_thai_display={inv.trang_thai_display} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {inv.phuong_thuc
                      ? inv.phuong_thuc === "CHUYEN_KHOAN"
                        ? "Chuyển khoản"
                        : inv.phuong_thuc === "TIEN_MAT"
                          ? "Tiền mặt"
                          : "Thẻ tín dụng"
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inv.ngay_tra)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Xem chi tiết"
                      >
                        👁
                      </button>
                      <button
                        className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title="Xác nhận thu"
                      >
                        ✓
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination + count */}
      {!loading && !error && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            Hiển thị {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)} trong số{" "}
            <strong>{pagination.total}</strong> phiếu thu
          </p>
          <Pagination page={page} totalPages={pagination.total_pages} onPageChange={setPage} />
        </div>
      )}

      {/* Stats Panel */}
      {stats && (
        <div className="bg-gray-900 rounded-2xl p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">TỔNG DOANH THU</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.tong_doanh_thu)}</p>
              <p className="text-xs text-emerald-400 mt-1">↑ Cập nhật theo bộ lọc thời gian</p>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">PHÂN TÍCH THANH TOÁN</p>
              <StatRow
                label="Đã thanh toán"
                amount={stats.da_thanh_toan.so_tien}
                pct={stats.da_thanh_toan.phan_tram}
                color="bg-emerald-400"
              />
              <StatRow
                label="Đang chờ"
                amount={stats.dang_cho.so_tien}
                pct={stats.dang_cho.phan_tram}
                color="bg-blue-400"
              />
              <StatRow
                label="Quá hạn"
                amount={stats.qua_han.so_tien}
                pct={stats.qua_han.phan_tram}
                color="bg-red-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── inline helpers ───────────────────────────────────────────
function StatRow({ label, amount, pct, color }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-gray-300">
          {label} ({pct}%)
        </span>
      </div>
      <span className="font-semibold">{new Intl.NumberFormat("vi-VN").format(amount)} đ</span>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-20" />
          <div className="h-4 bg-gray-100 rounded w-32" />
          <div className="h-4 bg-gray-100 rounded w-24" />
          <div className="h-4 bg-gray-100 rounded w-20" />
          <div className="h-4 bg-gray-100 rounded w-24" />
        </div>
      ))}
    </div>
  );
}
