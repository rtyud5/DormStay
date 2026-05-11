import React, { useEffect, useState } from "react";
import { Download, RefreshCw, Search, AlertTriangle, CheckCircle2, Clock, Eye, Landmark } from "lucide-react";
import { getTransactions, getTransactionDetail } from "../../services/accounting.service";
import { formatCurrency } from "../../utils/accounting.utils";

const STATUS_OPTIONS = ["all", "CONFIRMED", "PENDING", "FAILED"];

export default function AccountingTransactionPage() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [stats, setStats] = useState({ confirmed: 0, failed: 0, pending: 0 });
  const [filters, setFilters] = useState({ search: "", status: "all" });
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const loadTransactions = async (nextFilters = filters) => {
    try {
      setLoading(true);
      const requestFilters = {};

      if (nextFilters.search.trim()) requestFilters.search = nextFilters.search.trim();
      if (nextFilters.status !== "all") requestFilters.status = nextFilters.status;
      const response = await getTransactions(requestFilters);
      const nextTransactions = response.data || [];

      setTransactions(nextTransactions);
      setStats(response.stats || { confirmed: 0, failed: 0, pending: 0 });
      setSelectedTransaction(null);
      setDetailError("");
    } catch (error) {
      console.error("Error loading transactions:", error);
      setTransactions([]);
      setSelectedTransaction(null);
      setStats({ confirmed: 0, failed: 0, pending: 0 });
      setDetailError("");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransaction = async (transactionId) => {
    if (!transactionId) return;

    try {
      setDetailLoading(true);
      setDetailError("");
      const detailResponse = await getTransactionDetail(transactionId);
      setSelectedTransaction(detailResponse.data || null);
    } catch (error) {
      console.error("Error loading transaction detail:", error);
      setSelectedTransaction(null);
      setDetailError("Không thể tải chi tiết giao dịch. Vui lòng thử lại.");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <div className="p-8 lg:p-10 max-w-375 mx-auto bg-[#f9fafb] min-h-screen space-y-8">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-[2.2rem] font-extrabold text-[#111827] tracking-tight leading-none mb-3">
            Tra soát giao dịch
          </h1>
          <p className="text-gray-500 font-medium max-w-2xl leading-relaxed">
            Theo dõi giao dịch thanh toán, xem chênh lệch số tiền và xử lý các giao dịch chờ xác nhận hoặc thất bại.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="w-5 h-5" /> Xuất Excel
          </button>
          <button
            onClick={() => loadTransactions(filters)}
            className="flex items-center gap-2 px-8 py-3.5 bg-[#0b2447] text-white rounded-full font-bold shadow-lg shadow-[#0b2447]/20 hover:bg-[#0a1e3b] transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} /> Làm mới dữ liệu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Tổng giao dịch" value={transactions.length} accent="text-gray-900" />
        <StatCard label="Đã xác nhận" value={stats.confirmed} accent="text-[#22a654]" />
        <StatCard label="Đang chờ" value={stats.pending} accent="text-[#1a56db]" />
        <StatCard label="Thất bại" value={stats.failed} accent="text-[#e02424]" />
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">
            Từ khóa
          </label>
          <div className="relative">
            <Search className="absolute left-5 top-3.5 w-4 h-4 text-gray-400" />
            <input
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              type="text"
              placeholder="Mã giao dịch, mã phiếu, hợp đồng"
              className="w-full pl-12 pr-4 py-3.5 bg-[#f4f7fa] border-none rounded-full focus:ring-2 focus:ring-blue-200 text-sm font-semibold text-gray-700 outline-none placeholder-gray-400"
            />
          </div>
        </div>
        <div className="w-full md:w-56">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">
            Trạng thái
          </label>
          <select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            className="w-full px-5 py-3.5 bg-[#f4f7fa] border-none rounded-full focus:ring-2 focus:ring-blue-200 text-sm font-semibold text-gray-700 outline-none cursor-pointer"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "Tất cả" : option}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => loadTransactions(filters)}
          className="px-8 py-3.5 bg-[#8ebbfa] hover:bg-[#a5cbfb] text-[#0b2447] font-black rounded-full transition-colors whitespace-nowrap"
        >
          Lọc kết quả
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_0.9fr] gap-8 items-start">
        <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Loại giao dịch
                  </th>
                  <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Khách hàng
                  </th>
                  <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Số tiền</th>
                  <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Trạng thái
                  </th>
                  <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày lập</th>
                  <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Ngày đến hạn
                  </th>
                  <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50">
                {loading && (
                  <tr>
                    <td colSpan={7} className="py-10 px-6 text-center text-gray-400 font-medium">
                      Đang tải giao dịch...
                    </td>
                  </tr>
                )}
                {!loading && transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 px-6 text-center text-gray-400 font-medium">
                      Chưa có giao dịch nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
                {!loading &&
                  transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className={`hover:bg-gray-50/60 transition-colors ${selectedTransaction?.id === transaction.id ? "bg-[#f8fbff]" : ""}`}
                    >
                      <td className="py-5 px-6">
                        <p className="font-black text-[13px] text-gray-900">{transaction.typeLabel}</p>
                        <p className="text-[12px] font-medium text-gray-500 mt-1">{transaction.id}</p>
                      </td>
                      <td className="py-5 px-6">
                        <p className="font-extrabold text-[13px] text-gray-900">{transaction.customerName}</p>
                        <p className="text-[12px] font-medium text-gray-500 mt-1">{transaction.phone || "--"}</p>
                      </td>
                      <td className="py-5 px-6 font-black text-[#0b2447]">{formatCurrency(transaction.amount)}</td>
                      <td className="py-5 px-6">
                        <StatusPill value={transaction.status} />
                      </td>
                      <td className="py-5 px-6 text-sm text-gray-700">
                        {transaction.createdDate ? new Date(transaction.createdDate).toLocaleDateString("vi-VN") : "--"}
                      </td>
                      <td className="py-5 px-6 text-sm text-gray-700">
                        {transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString("vi-VN") : "--"}
                      </td>
                      <td className="py-5 px-6">
                        <button
                          onClick={() => handleViewTransaction(transaction.id)}
                          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-4xl shadow-sm border border-gray-100 p-8 space-y-6 sticky top-10">
          <div className="flex items-center gap-3">
            <Landmark className="w-5 h-5 text-[#0b2447]" />
            <h2 className="text-[13px] font-black tracking-widest text-[#0b2447] uppercase">Chi tiết giao dịch</h2>
          </div>

          {!detailLoading && !detailError && !selectedTransaction && (
            <p className="text-sm text-gray-500 font-medium">Chọn một giao dịch để xem chi tiết.</p>
          )}

          {detailLoading && <p className="text-sm text-gray-500 font-medium">Đang tải chi tiết giao dịch...</p>}

          {!detailLoading && detailError && <p className="text-sm text-red-500 font-medium">{detailError}</p>}

          {!detailLoading && selectedTransaction && (
            <>
              <DetailRow label="Mã giao dịch" value={selectedTransaction.id} />
              <DetailRow label="Loại giao dịch" value={selectedTransaction.typeLabel || "--"} />
              <DetailRow label="Tên khách hàng" value={selectedTransaction.customerName || "--"} />
              <DetailRow label="Điện thoại" value={selectedTransaction.phone || "--"} />
              <DetailRow label="Mã hợp đồng" value={selectedTransaction.contractId || "--"} />
              <DetailRow label="Số tiền" value={formatCurrency(selectedTransaction.amount || 0)} />
              {selectedTransaction.paidAmount !== undefined && (
                <DetailRow label="Đã thanh toán" value={formatCurrency(selectedTransaction.paidAmount || 0)} />
              )}
              {selectedTransaction.beneficiaryName && (
                <DetailRow label="Người nhận" value={selectedTransaction.beneficiaryName} />
              )}
              <DetailRow
                label="Ngày lập"
                value={
                  selectedTransaction.createdDate
                    ? new Date(selectedTransaction.createdDate).toLocaleDateString("vi-VN")
                    : "--"
                }
              />
              <DetailRow
                label="Ngày đến hạn"
                value={
                  selectedTransaction.dueDate ? new Date(selectedTransaction.dueDate).toLocaleDateString("vi-VN") : "--"
                }
              />
              <DetailRow label="Trạng thái" value={selectedTransaction.status || "--"} />
              <div className="bg-[#f8fbff] border border-blue-100 rounded-2xl p-4 text-sm text-gray-600 font-medium">
                Giao dịch từ {selectedTransaction.typeLabel}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-full px-8 py-6 shadow-sm border border-gray-100 flex flex-col justify-center">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-3xl font-black leading-none ${accent}`}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
      <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-bold text-gray-800 text-right">{value}</span>
    </div>
  );
}

function StatusPill({ value }) {
  if (value === "CONFIRMED") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[#eaffec] text-[#22a654] px-3 py-1 rounded-full text-[10px] font-black tracking-widest">
        <CheckCircle2 className="w-3 h-3" /> CONFIRMED
      </span>
    );
  }

  if (value === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[#f0f5ff] text-[#1a56db] px-3 py-1 rounded-full text-[10px] font-black tracking-widest">
        <Clock className="w-3 h-3" /> PENDING
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">
      <AlertTriangle className="w-3 h-3" /> {value}
    </span>
  );
}
