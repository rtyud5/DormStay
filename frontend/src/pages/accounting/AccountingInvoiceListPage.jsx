import React, { useEffect, useState } from "react";
import { Calendar, CreditCard, FileText, CheckCircle2, AlertTriangle, Clock, Wallet, TrendingUp } from "lucide-react";
import AccountingInvoiceTable from "../../components/accounting/AccountingInvoiceTable";
import { getInvoices } from "../../services/accounting.service";
import { formatCurrency } from "../../utils/accounting.utils";

export default function AccountingInvoiceListPage() {
  const [invoices, setInvoices] = useState([]);
  const [summaryInvoices, setSummaryInvoices] = useState([]);
  const [summaryTotalInvoices, setSummaryTotalInvoices] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTimeRange, setFilterTimeRange] = useState("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("all");
  const [filterContractId, setFilterContractId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [pageSize] = useState(10);

  const invoiceTotal = Math.max(summaryTotalInvoices || summaryInvoices.length, 1);
  const completedCount = summaryInvoices.filter((invoice) => invoice.status === "COMPLETED").length;
  const pendingCount = summaryInvoices.filter((invoice) => invoice.status === "PENDING").length;
  const overdueCount = summaryInvoices.filter((invoice) => invoice.status === "OVERDUE").length;
  const completedPercent = Math.round((completedCount / invoiceTotal) * 100);
  const pendingPercent = Math.round((pendingCount / invoiceTotal) * 100);
  const overduePercent = Math.round((overdueCount / invoiceTotal) * 100);

  const totalRevenue = summaryInvoices.reduce(
    (sum, invoice) => sum + (invoice.paidAmount || (invoice.status === "COMPLETED" ? invoice.amount || 0 : 0)),
    0,
  );

  const completedAmount = summaryInvoices
    .filter((invoice) => invoice.status === "COMPLETED")
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  const pendingAmount = summaryInvoices
    .filter((invoice) => invoice.status === "PENDING")
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  const overdueAmount = summaryInvoices
    .filter((invoice) => invoice.status === "OVERDUE")
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  useEffect(() => {
    const loadSummaryInvoices = async () => {
      try {
        const response = await getInvoices({ page: 1, limit: 1000 });
        const allInvoices = response.data?.items || response.data || [];
        const totalAllInvoices = response.data?.total || allInvoices.length || 0;
        setSummaryInvoices(allInvoices);
        setSummaryTotalInvoices(totalAllInvoices);
      } catch (error) {
        console.error("Error loading summary invoices:", error);
      }
    };

    loadSummaryInvoices();
  }, []);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);

        const paginationFilters = {};
        if (searchTerm.trim()) {
          paginationFilters.search = searchTerm.trim();
        }
        if (filterTimeRange !== "all") {
          paginationFilters.timeRange = filterTimeRange;
        }
        if (filterPaymentMethod !== "all") {
          paginationFilters.paymentMethod = filterPaymentMethod;
        }
        if (filterContractId.trim()) {
          paginationFilters.contractId = filterContractId.trim();
        }
        if (filterState !== "all") {
          paginationFilters.status = filterState.toUpperCase();
        }
        paginationFilters.page = currentPage;
        paginationFilters.limit = pageSize;

        const response = await getInvoices(paginationFilters);
        const pageInvoices = response.data?.items || response.data || [];
        const total = response.data?.total || pageInvoices.length || 0;

        setInvoices(pageInvoices);
        setTotalInvoices(total);
      } catch (error) {
        console.error("Error loading invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [filterState, searchTerm, filterTimeRange, filterPaymentMethod, filterContractId, currentPage, pageSize]);

  const renderStatusBadge = (status, text) => {
    switch (status) {
      case "COMPLETED":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eaffec] text-[#22a654] rounded-full text-[11px] font-bold border border-[#b2eac7]">
            <CheckCircle2 className="w-3.5 h-3.5" /> {text}
          </div>
        );
      case "OVERDUE":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fdf2f2] text-[#e02424] rounded-full text-[11px] font-bold border border-[#fbd5d5]">
            <AlertTriangle className="w-3.5 h-3.5" /> {text}
          </div>
        );
      case "PENDING":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f0f5ff] text-[#1a56db] rounded-full text-[11px] font-bold border border-[#e1effe]">
            <Clock className="w-3.5 h-3.5" /> {text}
          </div>
        );
      case "REFUNDED":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f3f4f6] text-[#4b5563] rounded-full text-[11px] font-bold border border-[#e5e7eb]">
            <Wallet className="w-3.5 h-3.5" /> {text}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[2rem] font-extrabold text-[#111827] tracking-tight">Danh sách Phiếu thu</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0b2447] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-[#0b2447]/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>

          <p className="text-[11px] font-bold text-blue-200 uppercase tracking-widest mb-4">TỔNG DOANH THU</p>
          <h2 className="text-[2.5rem] font-extrabold tracking-tight leading-none mb-6">
            {formatCurrency(totalRevenue).replace("₫", "")} <span className="text-2xl">đ</span>
          </h2>

          <div className="inline-flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#4ade80]" strokeWidth={3} />
            <span className="text-sm font-bold text-blue-100">Luôn tính theo toàn bộ phiếu thu</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute bottom-4 right-4 opacity-5 pointer-events-none">
            <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 10h16v10H4zM2 22h20v-2H2v2zm10-18.5L2 8h20L12 3.5zM10 12h4v6h-4z" />
            </svg>
          </div>

          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-6">PHÂN TÍCH THANH TOÁN</p>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-gray-800">Đã thanh toán ({completedPercent}%)</span>
                <span className="text-gray-900">
                  {formatCurrency(completedAmount).replace("₫", "")} <span>đ</span>
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-[#22a654] h-1.5 rounded-full" style={{ width: `${completedPercent}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-gray-800">Đang chờ ({pendingPercent}%)</span>
                <span className="text-gray-900">
                  {formatCurrency(pendingAmount).replace("₫", "")} <span>đ</span>
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-[#1a56db] h-1.5 rounded-full" style={{ width: `${pendingPercent}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-gray-800">Quá hạn ({overduePercent}%)</span>
                <span className="text-gray-900">
                  {formatCurrency(overdueAmount).replace("₫", "")} <span>đ</span>
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-[#e02424] h-1.5 rounded-full" style={{ width: `${overduePercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 bg-[#fbfeff] rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">THỜI GIAN</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
              <select
                value={filterTimeRange}
                onChange={(event) => setFilterTimeRange(event.target.value)}
                className="w-full pl-11 pr-8 py-3 bg-[#f4f7fa] border-none rounded-xl text-sm font-semibold text-gray-800 appearance-none focus:ring-2 focus:ring-[#0b2447]"
              >
                <option value="all">Tất cả</option>
                <option value="this_month">Tháng này</option>
                <option value="last_month">Tháng trước</option>
                <option value="this_quarter">Quý này</option>
                <option value="this_year">Năm nay</option>
              </select>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">PHƯƠNG THỨC</label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
              <select
                value={filterPaymentMethod}
                onChange={(event) => setFilterPaymentMethod(event.target.value)}
                className="w-full pl-11 pr-8 py-3 bg-[#f4f7fa] border-none rounded-xl text-sm font-semibold text-gray-800 appearance-none focus:ring-2 focus:ring-[#0b2447]"
              >
                <option value="all">Tất cả</option>
                <option value="TIEN_MAT">Tiền mặt</option>
                <option value="TRANSFER">Chuyển khoản</option>
              </select>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">MÃ HỢP ĐỒNG</label>
            <div className="relative">
              <FileText className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
              <input
                value={filterContractId}
                onChange={(event) => setFilterContractId(event.target.value)}
                type="text"
                placeholder="Ví dụ: CTR-904"
                className="w-full pl-11 pr-4 py-3 bg-[#f4f7fa] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0b2447] placeholder-gray-400 font-medium"
              />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">TÌM KIẾM</label>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              type="text"
              placeholder="Tên khách, mã phiếu..."
              className="w-full px-4 py-3 bg-[#f4f7fa] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0b2447] placeholder-gray-400 font-medium"
            />
          </div>
        </div>

        <div className="bg-[#fbfeff] rounded-3xl p-6 shadow-sm border border-gray-100 min-w-[300px]">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
            LỌC NHANH TRẠNG THÁI
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setFilterState("all");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filterState === "all" ? "bg-[#0b2447] text-white shadow-md shadow-blue-900/20" : "bg-[#f4f7fa] text-gray-600 hover:bg-gray-200"}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => {
                setFilterState("completed");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filterState === "completed" ? "bg-[#0b2447] text-white shadow-md shadow-blue-900/20" : "bg-[#f4f7fa] text-gray-600 hover:bg-gray-200"}`}
            >
              Đã trả
            </button>
            <button
              onClick={() => {
                setFilterState("overdue");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filterState === "overdue" ? "bg-[#0b2447] text-white shadow-md shadow-blue-900/20" : "bg-[#f4f7fa] text-gray-600 hover:bg-gray-200"}`}
            >
              Quá hạn
            </button>
            <button
              onClick={() => {
                setFilterState("pending");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filterState === "pending" ? "bg-[#0b2447] text-white shadow-md shadow-blue-900/20" : "bg-[#f4f7fa] text-gray-600 hover:bg-gray-200"}`}
            >
              Chưa trả
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
        <AccountingInvoiceTable
          data={invoices}
          loading={loading}
          hideSelection={true}
          columns={[
            {
              key: "id",
              label: "MÃ PHIẾU",
              width: "12%",
              render: (item) => <span className="font-extrabold text-[#0b2447] text-[13px]">#{item.id}</span>,
            },
            {
              key: "customerName",
              label: "KHÁCH HÀNG",
              width: "20%",
              render: (item) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f4f7fa] text-[#0b2447] flex items-center justify-center text-[11px] font-extrabold shrink-0">
                    {item.avatarInitials}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#111827] leading-tight">{item.customerName?.split(" ")[0]}</span>
                    <span className="font-bold text-[#111827] leading-tight">
                      {item.customerName?.split(" ").slice(1).join(" ")}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              key: "amount",
              label: "SỐ TIỀN",
              width: "15%",
              render: (item) => <span className="font-extrabold text-[#111827]">{formatCurrency(item.amount)}</span>,
            },
            {
              key: "dueDate",
              label: "HẠN TRẢ",
              width: "12%",
              render: (item) => (
                <span className={`font-semibold ${item.isOverdue ? "text-red-500" : "text-gray-600"}`}>
                  {item.dueDate ? new Date(item.dueDate).toLocaleDateString("vi-VN") : "—"}
                </span>
              ),
            },
            {
              key: "status",
              label: "TRẠNG THÁI",
              width: "15%",
              render: (item) => renderStatusBadge(item.status, item.statusText),
            },
            {
              key: "method",
              label: "PHƯƠNG THỨC",
              width: "13%",
              render: (item) => (
                <div className="flex flex-col text-gray-600 font-medium leading-tight">
                  {String(item.method || "—")
                    .split(" ")
                    .map((word, i) => (
                      <span key={i}>{word}</span>
                    ))}
                </div>
              ),
            },
            {
              key: "paidDate",
              label: "NGÀY TRẢ",
              width: "13%",
              render: (item) => (
                <span className="text-gray-600 font-medium">
                  {item.paidDate && item.paidDate !== "—" ? new Date(item.paidDate).toLocaleDateString("vi-VN") : "—"}
                </span>
              ),
            },
          ]}
        />

        <div className="pt-6 mt-2 border-t border-gray-100 flex items-center justify-between px-2">
          <p className="text-sm text-gray-500 font-medium">
            Hiển thị <span className="text-gray-900 font-bold">{invoices.length}</span> /{" "}
            <span className="text-gray-900 font-bold">{totalInvoices}</span> phiếu thu
            {filterState !== "all" && (
              <span className="text-gray-600 ml-2">
                (lọc: {filterState.charAt(0).toUpperCase() + filterState.slice(1)})
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Trước
            </button>
            <span className="text-sm text-gray-700 font-medium px-3 py-1.5">
              Trang <span className="font-bold text-gray-900">{currentPage}</span> /{" "}
              <span className="font-bold text-gray-900">{Math.ceil(totalInvoices / pageSize) || 1}</span>
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalInvoices / pageSize)}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Tiếp →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
