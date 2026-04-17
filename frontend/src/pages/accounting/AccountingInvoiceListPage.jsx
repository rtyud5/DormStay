import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Plus,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { ACCOUNTING_ROUTES } from "../../constants/accounting.constants";
import AccountingInvoiceTable from "../../components/accounting/AccountingInvoiceTable";
import { getInvoices, confirmPayment } from "../../services/accounting.service";
import { formatCurrency } from "../../utils/accounting.utils";

export default function AccountingInvoiceListPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const invoiceTotal = Math.max(invoices.length, 1);
  const completedCount = invoices.filter((invoice) => invoice.status === "COMPLETED").length;
  const pendingCount = invoices.filter((invoice) => invoice.status === "PENDING").length;
  const overdueCount = invoices.filter((invoice) => invoice.status === "OVERDUE").length;
  const completedPercent = Math.round((completedCount / invoiceTotal) * 100);
  const pendingPercent = Math.round((pendingCount / invoiceTotal) * 100);
  const overduePercent = Math.round((overdueCount / invoiceTotal) * 100);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);

        const filters = {};
        if (filterState !== "all") {
          filters.status = filterState.toUpperCase();
        }

        if (searchTerm.trim()) {
          filters.search = searchTerm.trim();
        }

        const response = await getInvoices(filters);
        setInvoices(response.data || []);
      } catch (error) {
        console.error("Error loading invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [filterState, searchTerm]);

  const getConfirmablePaymentId = (invoice) => {
    const pendingPayment = invoice.payments?.find((payment) =>
      String(payment.trang_thai || "")
        .toUpperCase()
        .includes("CHO"),
    );
    return pendingPayment?.ma_thanh_toan || null;
  };

  const handleConfirmPayment = async (invoice) => {
    const paymentId = getConfirmablePaymentId(invoice);

    if (!paymentId) {
      window.alert("Phiếu này chưa có thanh toán chờ xác nhận.");
      return;
    }

    try {
      await confirmPayment(paymentId);
      const refreshed = await getInvoices(filterState === "all" ? {} : { status: filterState.toUpperCase() });
      setInvoices(refreshed.data || []);
    } catch (error) {
      console.error("Error confirming payment:", error);
      window.alert("Không thể xác nhận thanh toán. Kiểm tra console để xem chi tiết.");
    }
  };

  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + (invoice.paidAmount || (invoice.status === "COMPLETED" ? invoice.amount || 0 : 0)),
    0,
  );

  const completedAmount = invoices
    .filter((invoice) => invoice.status === "COMPLETED")
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  const pendingAmount = invoices
    .filter((invoice) => invoice.status === "PENDING")
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  const overdueAmount = invoices
    .filter((invoice) => invoice.status === "OVERDUE")
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[2rem] font-extrabold text-[#111827] mb-2 tracking-tight">Danh sách Phiếu thu</h1>
          <p className="text-gray-500 font-medium max-w-lg leading-relaxed">
            Giám sát thanh toán bất động sản, theo dõi trạng thái và duy trì sức khỏe tài chính.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#f3f4f6] text-gray-700 rounded-full font-bold hover:bg-gray-200 transition-colors text-sm">
            <Download className="w-4 h-4" /> Xuất CSV
          </button>
          <button
            onClick={() => navigate(ACCOUNTING_ROUTES.BILLING)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0b2447] text-white rounded-full font-bold hover:bg-blue-900 transition-colors shadow-md shadow-blue-900/20 text-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={3} /> Tạo mới
          </button>
        </div>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Filters Cards */}
        <div className="flex-1 bg-[#fbfeff] rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">THỜI GIAN</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
              <select className="w-full pl-11 pr-8 py-3 bg-[#f4f7fa] border-none rounded-xl text-sm font-semibold text-gray-800 appearance-none focus:ring-2 focus:ring-[#0b2447]">
                <option>Tháng này</option>
              </select>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">PHƯƠNG THỨC</label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
              <select className="w-full pl-11 pr-8 py-3 bg-[#f4f7fa] border-none rounded-xl text-sm font-semibold text-gray-800 appearance-none focus:ring-2 focus:ring-[#0b2447]">
                <option>Tất cả</option>
              </select>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">MÃ HỢP ĐỒNG</label>
            <div className="relative">
              <FileText className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                type="text"
                placeholder="Ví dụ: CTR-904"
                className="w-full pl-11 pr-4 py-3 bg-[#f4f7fa] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0b2447] placeholder-gray-400 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Quick Filter Status Card */}
        <div className="bg-[#fbfeff] rounded-3xl p-6 shadow-sm border border-gray-100 min-w-[#300px]">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
            LỌC NHANH TRẠNG THÁI
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterState("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filterState === "all" ? "bg-[#0b2447] text-white shadow-md shadow-blue-900/20" : "bg-[#f4f7fa] text-gray-600 hover:bg-gray-200"}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterState("completed")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filterState === "completed" ? "bg-[#0b2447] text-white shadow-md shadow-blue-900/20" : "bg-[#f4f7fa] text-gray-600 hover:bg-gray-200"}`}
            >
              Đã trả
            </button>
            <button
              onClick={() => setFilterState("overdue")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filterState === "overdue" ? "bg-[#0b2447] text-white shadow-md shadow-blue-900/20" : "bg-[#f4f7fa] text-gray-600 hover:bg-gray-200"}`}
            >
              Quá hạn
            </button>
            <button
              onClick={() => setFilterState("pending")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filterState === "pending" ? "bg-[#0b2447] text-white shadow-md shadow-blue-900/20" : "bg-[#f4f7fa] text-gray-600 hover:bg-gray-200"}`}
            >
              Chưa trả
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
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
          actions={[
            {
              icon: <CheckCircle className="w-5 h-5 text-gray-700" fill="#374151" color="white" />,
              label: "Xác nhận",
              condition: (row) => Boolean(getConfirmablePaymentId(row)),
              onClick: (row) => handleConfirmPayment(row),
            },
          ]}
        />

        {/* Pagination */}
        <div className="pt-6 mt-2 border-t border-gray-100 flex items-center justify-between px-2">
          <p className="text-sm text-gray-500 font-medium">
            Hiển thị <span className="text-gray-900 font-bold">{invoices.length}</span> phiếu thu
          </p>
        </div>
      </div>

      {/* Bottom Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Revenue Block */}
        <div className="bg-[#0b2447] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-[#0b2447]/10">
          {/* Background elements mock */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>

          <p className="text-[11px] font-bold text-blue-200 uppercase tracking-widest mb-4">TỔNG DOANH THU</p>
          <h2 className="text-[2.5rem] font-extrabold tracking-tight leading-none mb-6">
            {formatCurrency(totalRevenue).replace("₫", "")}{" "}
            <span className="text-2xl line-through decoration-white/40 decoration-2">đ</span>
          </h2>

          <div className="inline-flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#4ade80]" strokeWidth={3} />
            <span className="text-sm font-bold text-blue-100">Dữ liệu đang lấy từ invoice đã fetch</span>
          </div>
        </div>

        {/* Analytics Block */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
          {/* Background Bank icon watermark mock */}
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
                  {formatCurrency(completedAmount).replace("₫", "")}{" "}
                  <span className="line-through decoration-gray-400">đ</span>
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
                  {formatCurrency(pendingAmount).replace("₫", "")}{" "}
                  <span className="line-through decoration-gray-400">đ</span>
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
                  {formatCurrency(overdueAmount).replace("₫", "")}{" "}
                  <span className="line-through decoration-gray-400">đ</span>
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-[#e02424] h-1.5 rounded-full" style={{ width: `${overduePercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
