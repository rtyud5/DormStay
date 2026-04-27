import React, { useEffect, useState } from "react";
import { FileText, RefreshCw, Search } from "lucide-react";
import { getAdditionalPaymentVouchers } from "../../services/accounting.service";
import { formatCurrency } from "../../utils/accounting.utils";

const FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "CHO_THANH_TOAN", label: "Chờ thanh toán" },
  { value: "DA_THANH_TOAN", label: "Đã thanh toán" },
];

const STATUS_BADGE_STYLES = {
  CHO_THANH_TOAN: "bg-amber-50 text-amber-700 border-amber-200",
  DA_THANH_TOAN: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_LABELS = {
  CHO_THANH_TOAN: "Chờ thanh toán",
  DA_THANH_TOAN: "Đã thanh toán",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "--";

export default function AccountingExtraInvoicePage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, paid: 0 });
  const searchKeyword = search.trim();

  const loadVouchers = async (withRefreshing = false) => {
    try {
      setError("");
      if (withRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getAdditionalPaymentVouchers({
        status: statusFilter,
        search: searchKeyword,
        page: 1,
        limit: 100,
      });

      if (!response.success) {
        setRows([]);
        setSummary({ total: 0, pending: 0, paid: 0 });
        setError(response.message || "Không thể tải danh sách phiếu phát sinh.");
        return;
      }

      setRows(response.data || []);
      setSummary(
        response.statusSummary || {
          total: response.total || 0,
          pending: 0,
          paid: 0,
        },
      );
    } catch (err) {
      console.error("Failed to load additional payment vouchers", err);
      setRows([]);
      setSummary({ total: 0, pending: 0, paid: 0 });
      setError("Có lỗi khi tải dữ liệu phiếu thanh toán phát sinh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVouchers(false);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchKeyword]);

  return (
    <div className="p-6 lg:p-8 bg-[#f9fafb] min-h-screen">
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
              Phiếu thanh toán phát sinh
            </div>
            <h1 className="text-3xl font-extrabold text-[#0b2447] tracking-tight leading-none mb-2">
              Danh Sách Thanh Toán Phát Sinh
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Danh sách này chỉ hiển thị dữ liệu từ bảng phiếu phát sinh; trạng thái thanh toán do teammate cập nhật.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadVouchers(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Tổng số phiếu</p>
            <p className="text-2xl font-extrabold text-[#0b2447]">{summary.total}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Chờ thanh toán</p>
            <p className="text-2xl font-extrabold text-amber-600">{summary.pending}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Đã thanh toán</p>
            <p className="text-2xl font-extrabold text-emerald-600">{summary.paid}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo mã phiếu, khách hàng, phòng, hợp đồng..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`px-3 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-colors ${
                  statusFilter === option.value
                    ? "bg-[#0b2447] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Mã phiếu
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Đối soát
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Khách hàng
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Hợp đồng
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Phòng / Giường
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Số tiền
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Ngày tạo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400 italic">
                      Không có phiếu thanh toán phát sinh phù hợp.
                    </td>
                  </tr>
                )}

                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{row.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-600">{row.reconciliationId || "--"}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-gray-900">{row.customerName || "--"}</p>
                      <p className="text-xs text-gray-500">{row.customerPhone || "--"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{row.contractId || "--"}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">
                      {[row.roomNumber, row.bedNumber].filter(Boolean).join(" / ") || "--"}
                    </td>
                    <td className="px-4 py-3 text-sm font-extrabold text-right text-[#0b2447]">
                      {formatCurrency(row.amount || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-black uppercase tracking-wide ${
                          STATUS_BADGE_STYLES[row.status] || STATUS_BADGE_STYLES.CHO_THANH_TOAN
                        }`}
                      >
                        {STATUS_LABELS[row.status] || row.status || "--"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-600">{formatDate(row.createdAt)}</td>
                  </tr>
                ))}

                {loading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                      Đang tải danh sách phiếu phát sinh...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
