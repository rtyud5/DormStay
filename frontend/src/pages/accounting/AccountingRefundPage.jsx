import React, { useEffect, useState } from "react";
import { FileText, RefreshCw, Search } from "lucide-react";
import { getRefunds, updateRefund } from "../../services/accounting.service";
import { formatCurrency } from "../../utils/accounting.utils";

const FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "FAILED", label: "Thất bại" },
];

const STATUS_BADGE_STYLES = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_LABELS = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Hoàn tất",
  FAILED: "Thất bại",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "--";

export default function AccountingRefundPage() {
  const PAGE_SIZE = 10;
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ total: 0, pending: 0, processing: 0, completed: 0, failed: 0 });
  const [selectedIds, setSelectedIds] = useState([]);
  const searchKeyword = search.trim();

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setError("");
        setLoading(true);

        const response = await getRefunds({
          status: statusFilter,
          search: searchKeyword,
          page,
          limit: PAGE_SIZE,
        });

        if (!response.success) {
          setRows([]);
          setSummary({ total: 0, pending: 0, processing: 0, completed: 0, failed: 0 });
          setError(response.message || "Không thể tải danh sách phiếu hoàn cọc.");
          return;
        }

        setRows(response.data || []);
        setTotal(response.total || 0);
        setSummary(
          response.statusSummary || {
            total: response.total || 0,
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0,
          },
        );
      } catch (err) {
        console.error("Failed to load refunds", err);
        setRows([]);
        setSummary({ total: 0, pending: 0, processing: 0, completed: 0, failed: 0 });
        setError("Có lỗi khi tải dữ liệu phiếu hoàn cọc.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [statusFilter, searchKeyword, page]);

  const loadRefunds = async (withRefreshing = false) => {
    try {
      setError("");
      if (withRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getRefunds({
        status: statusFilter,
        search: searchKeyword,
        page,
        limit: PAGE_SIZE,
      });

      if (!response.success) {
        setRows([]);
        setSummary({ total: 0, pending: 0, processing: 0, completed: 0, failed: 0 });
        setError(response.message || "Không thể tải danh sách phiếu hoàn cọc.");
        return;
      }

      setRows(response.data || []);
      setTotal(response.total || 0);
      setSummary(
        response.statusSummary || {
          total: response.total || 0,
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0,
        },
      );
    } catch (err) {
      console.error("Failed to refresh refunds", err);
      setRows([]);
      setSummary({ total: 0, pending: 0, processing: 0, completed: 0, failed: 0 });
      setError("Có lỗi khi tải dữ liệu phiếu hoàn cọc.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setSelectedIds((prevSelected) => prevSelected.filter((id) => rows.some((row) => row.id === id)));
  }, [rows]);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const actionableRows = rows.filter((row) => ["PENDING", "PROCESSING"].includes(row.status));
  const allActionableOnPageSelected =
    actionableRows.length > 0 && actionableRows.every((row) => selectedIds.includes(row.id));

  const toggleSelectAllOnPage = () => {
    const actionableIds = actionableRows.map((row) => row.id);
    if (!actionableIds.length) return;

    setSelectedIds((prevSelected) => {
      if (allActionableOnPageSelected) {
        return prevSelected.filter((id) => !actionableIds.includes(id));
      }

      return [...new Set([...prevSelected, ...actionableIds])];
    });
  };

  const toggleSelectOne = (refundId) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(refundId) ? prevSelected.filter((id) => id !== refundId) : [...prevSelected, refundId],
    );
  };

  const handleFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleMarkCompleted = async () => {
    if (!selectedIds.length) return;

    const accepted = window.confirm(`Xác nhận hoàn tất chi trả cho ${selectedIds.length} phiếu đã chọn?`);
    if (!accepted) return;

    try {
      setError("");
      setProcessing(true);

      const updates = await Promise.all(
        selectedIds.map(async (refundId) => ({
          refundId,
          response: await updateRefund(refundId, { status: "COMPLETED" }),
        })),
      );

      const failedUpdates = updates.filter((item) => !item.response?.success);
      const successUpdates = updates.filter((item) => item.response?.success);

      if (failedUpdates.length === updates.length) {
        setError(failedUpdates[0]?.response?.message || "Không thể cập nhật trạng thái phiếu hoàn cọc.");
        return;
      }

      if (failedUpdates.length > 0) {
        setError(
          failedUpdates[0]?.response?.message ||
            `Có ${failedUpdates.length} phiếu chưa cập nhật được trạng thái hoàn tất.`,
        );
      }

      setSelectedIds(failedUpdates.map((item) => item.refundId));
      if (successUpdates.length === 0) {
        return;
      }

      await loadRefunds(true);
    } catch (err) {
      console.error("Failed to mark refunds completed", err);
      setError("Có lỗi khi cập nhật trạng thái phiếu hoàn cọc.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 bg-[#f9fafb] min-h-screen">
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
              Phiếu hoàn cọc
            </div>
            <h1 className="text-3xl font-extrabold text-[#0b2447] tracking-tight leading-none mb-2">
              Danh Sách Phiếu Hoàn Cọc
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Theo dõi trạng thái xử lý phiếu hoàn cọc và xác nhận hoàn tất chi trả theo từng hợp đồng.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadRefunds(true)}
            disabled={refreshing || loading || processing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Tổng số phiếu</p>
            <p className="text-2xl font-extrabold text-[#0b2447]">{summary.total}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Chờ xử lý</p>
            <p className="text-2xl font-extrabold text-amber-600">{summary.pending}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Đang xử lý</p>
            <p className="text-2xl font-extrabold text-blue-600">{summary.processing}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Hoàn tất</p>
            <p className="text-2xl font-extrabold text-emerald-600">{summary.completed}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Thất bại</p>
            <p className="text-2xl font-extrabold text-rose-600">{summary.failed}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder="Tìm theo mã phiếu, khách hàng, mã hợp đồng..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>

          <div className="flex flex-wrap gap-2 lg:ml-auto">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleFilterChange(option.value)}
                className={`px-3 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-colors ${
                  statusFilter === option.value
                    ? "bg-[#0b2447] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}

            <button
              type="button"
              onClick={handleMarkCompleted}
              disabled={!selectedIds.length || processing || loading}
              className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? "Đang cập nhật..." : `Xác nhận hoàn tất (${selectedIds.length})`}
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 w-10">
                    <input
                      type="checkbox"
                      checked={allActionableOnPageSelected}
                      onChange={toggleSelectAllOnPage}
                      disabled={!actionableRows.length || loading || processing}
                      className="w-4 h-4 rounded border-gray-300 text-[#0b2447] focus:ring-[#0b2447]"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Mã phiếu
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Khách hàng
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Hợp đồng
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Cọc gốc
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Khấu trừ
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Số tiền hoàn
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Ngày lập
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400 italic">
                      Không có phiếu hoàn cọc phù hợp.
                    </td>
                  </tr>
                )}

                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleSelectOne(row.id)}
                        disabled={!["PENDING", "PROCESSING"].includes(row.status) || loading || processing}
                        className="w-4 h-4 rounded border-gray-300 text-[#0b2447] focus:ring-[#0b2447]"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{row.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-gray-900">{row.customerName || "--"}</p>
                      <p className="text-xs text-gray-500">{row.customerId || "--"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{row.contractId || "--"}</td>
                    <td className="px-4 py-3 text-sm font-extrabold text-right text-[#0b2447]">
                      {formatCurrency(row.originalDeposit || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-right text-rose-600">
                      {formatCurrency(row.deductedAmount || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm font-extrabold text-right text-[#0b2447]">
                      {formatCurrency(row.refundAmount || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-black uppercase tracking-wide ${
                          STATUS_BADGE_STYLES[row.status] || STATUS_BADGE_STYLES.PENDING
                        }`}
                      >
                        {STATUS_LABELS[row.status] || row.status || "--"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-600">
                      {formatDate(row.issuedDate || row.createdAt)}
                    </td>
                  </tr>
                ))}

                {loading && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-500">
                      Đang tải danh sách phiếu hoàn cọc...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/60">
            <p className="text-xs font-medium text-gray-500">
              Trang {page}/{totalPages} - Tổng {total} phiếu
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1 || loading || processing}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Trang trước
              </button>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages || loading || processing}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Trang sau
              </button>
            </div>
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
