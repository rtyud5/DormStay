import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardKPI, getContracts, getInvoices } from "../../services/accounting.service";
import { ACCOUNTING_ROUTES } from "../../constants/accounting.constants";
import AccountingKpiCard from "../../components/accounting/AccountingKpiCard";
import AccountingInvoiceTable from "../../components/accounting/AccountingInvoiceTable";
import { INVOICE_STATUS, CONTRACT_STATUS } from "../../constants/accounting.constants";
import { formatCurrency } from "../../utils/accounting.utils";
import { 
  ChevronRight, LayoutDashboard, Wallet, ReceiptText, ArrowLeftRight, Clock,
  ArrowUpRight, TrendingUp, TrendingDown, Edit3, CornerUpLeft, Search, Scale, FileText, ChevronRightCircle
} from "lucide-react";

export default function AccountingDashboardPage() {
  const navigate = useNavigate();
  const [kpi, setKpi] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [overdueContracts, setOverdueContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load KPI
        const kpiRes = await getDashboardKPI();
        setKpi(kpiRes.data);

        // Load recent invoices
        const invoicesRes = await getInvoices({
          limit: 5,
          status: "PENDING",
        });
        setRecentInvoices(invoicesRes.data);

        // Load contracts needing billing
        const contractsRes = await getContracts({ status: "ACTIVE" });
        setOverdueContracts(contractsRes.data.slice(0, 5));
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 lg:p-10 max-w-[1500px] mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
           <div className="w-12 h-12 border-4 border-blue-200 border-t-[#0b2447] rounded-full animate-spin mx-auto"></div>
           <p className="text-[10px] font-black tracking-widest text-[#0b2447] uppercase animate-pulse">ĐANG TẢI DỮ LIỆU TÀI CHÍNH...</p>
        </div>
      </div>
    );
  }

  // Calculate percentages rounded
  const invoiceTotal = kpi?.invoiceStats?.total || 1;
  const invoiceCompleted = kpi?.invoiceStats?.completed || 0;
  const invoiceOverdue = kpi?.invoiceStats?.overdue || 0;
  const invoicePending = invoiceTotal - invoiceCompleted - invoiceOverdue;
  
  const pctCompleted = Math.round((invoiceCompleted / invoiceTotal) * 100);
  const pctPending = Math.round((invoicePending / invoiceTotal) * 100);
  const pctOverdue = Math.round((invoiceOverdue / invoiceTotal) * 100);

  return (
    <div className="p-8 lg:p-10 max-w-[1500px] mx-auto bg-[#f9fafb] min-h-screen">
      
      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-[2.2rem] font-extrabold text-[#0b2447] tracking-tight leading-none mb-3">
                 Trang chủ Kế toán
              </h1>
              <p className="text-gray-500 font-medium">Báo cáo hiệu suất, dòng tiền và kiểm soát tình hình công nợ thời gian thực.</p>
           </div>
           
           <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-sm self-start md:self-auto">
              <DownloadReportIcon /> Báo cáo tổng thể
           </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <AccountingKpiCard
          title="TỔNG DOANH THU"
          value={kpi?.totalRevenue || 0}
          icon={<Wallet className="w-5 h-5 text-white/50" />}
          subtext="Tháng này"
          change={kpi?.monthlyChange}
          changePercent={kpi?.monthlyChangePercent}
          onClick={() => navigate(ACCOUNTING_ROUTES.INVOICES)}
          isPrimary={true}
        />

        <AccountingKpiCard
          title="PHIẾU THU THÁNG NÀY"
          value={kpi?.invoiceStats?.total || 0}
          icon={<ReceiptText className="w-4 h-4" />}
          subtext={`Đã thanh toán: ${kpi?.invoiceStats?.completed || 0}`}
          valueFormat="number"
          onClick={() => navigate(ACCOUNTING_ROUTES.INVOICES)}
        />

        <AccountingKpiCard
          title="YÊU CẦU HOÀN CỌC"
          value={kpi?.refundStats?.pending || 0}
          icon={<CornerUpLeft className="w-4 h-4" />}
          subtext="Đang chờ phê duyệt"
          valueFormat="number"
          change={1}
          changePercent={kpi?.refundStats?.pending || 0 > 0 ? 100 : 0}
          changeColor="text-[#ea580c]"
          bgChangeColor="bg-[#ffedd5]"
          onClick={() => navigate(ACCOUNTING_ROUTES.REFUNDS)}
        />

        <AccountingKpiCard
          title="GIAO DỊCH QUA CỔNG"
          value={kpi?.transactionStats?.total || 0}
          icon={<ArrowLeftRight className="w-4 h-4" />}
          subtext={`Khớp lệnh: ${kpi?.transactionStats?.successful || 0}`}
          valueFormat="number"
          change={12}
          changePercent={12}
          changeColor="text-green-600"
          bgChangeColor="bg-green-100"
          onClick={() => navigate(ACCOUNTING_ROUTES.TRANSACTIONS)}
        />
      </div>

      {/* Dashboard Config panels grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Progress Box */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 flex flex-col justify-between">
           <div>
              <h3 className="text-[13px] font-black tracking-widest text-[#0b2447] uppercase mb-8 flex items-center gap-3">
                 <Scale className="w-5 h-5" /> PHÂN BỔ CÔNG NỢ
              </h3>
              
              <div className="space-y-6">
                 {/* Item Complete */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[13px] font-bold text-gray-700">Đã thanh toán ({invoiceCompleted})</span>
                       <span className="text-[13px] font-black text-[#22a654]">{pctCompleted}%</span>
                    </div>
                    <div className="w-full bg-[#f4f7fa] h-2.5 rounded-full overflow-hidden">
                       <div className="bg-[#22a654] h-full rounded-full" style={{ width: `${pctCompleted}%` }}></div>
                    </div>
                 </div>

                 {/* Item Pending */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[13px] font-bold text-gray-700">Chờ nhận tiền ({invoicePending})</span>
                       <span className="text-[13px] font-black text-[#facc15]">{pctPending}%</span>
                    </div>
                    <div className="w-full bg-[#f4f7fa] h-2.5 rounded-full overflow-hidden">
                       <div className="bg-[#facc15] h-full rounded-full" style={{ width: `${pctPending}%` }}></div>
                    </div>
                 </div>

                 {/* Item Overdue */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[13px] font-bold text-gray-700">Quá hạn, nợ xấu ({invoiceOverdue})</span>
                       <span className="text-[13px] font-black text-[#e02424]">{pctOverdue}%</span>
                    </div>
                    <div className="w-full bg-[#f4f7fa] h-2.5 rounded-full overflow-hidden">
                       <div className="bg-[#e02424] h-full rounded-full" style={{ width: `${pctOverdue}%` }}></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-[#0b2447] rounded-[2rem] shadow-xl shadow-[#0b2447]/20 p-8 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
           
           <div>
              <h3 className="text-[13px] font-black tracking-widest text-blue-200/80 uppercase mb-6 flex items-center gap-3 relative z-10">
                 <ArrowUpRight className="w-5 h-5" /> THAO TÁC NHANH
              </h3>
              
              <div className="grid grid-cols-2 gap-4 relative z-10">
                 <button 
                   onClick={() => navigate(ACCOUNTING_ROUTES.BILLING)}
                   className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition-colors rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-white group"
                 >
                    <div className="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Edit3 className="w-5 h-5 text-blue-300" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest">Lập thu</span>
                 </button>

                 <button 
                   onClick={() => navigate(ACCOUNTING_ROUTES.REFUNDS)}
                   className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition-colors rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-white group"
                 >
                    <div className="w-10 h-10 rounded-full bg-orange-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <CornerUpLeft className="w-5 h-5 text-orange-300" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-center leading-tight">Hoàn cọc</span>
                 </button>

                 <button 
                   onClick={() => navigate(ACCOUNTING_ROUTES.TRANSACTIONS)}
                   className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition-colors rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-white group"
                 >
                    <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Search className="w-5 h-5 text-green-300" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest">Tra soát</span>
                 </button>

                 <button 
                   onClick={() => navigate(ACCOUNTING_ROUTES.RECONCILIATION)}
                   className="bg-white hover:bg-gray-100 transition-colors rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-[#0b2447] group shadow-lg"
                 >
                    <div className="w-10 h-10 rounded-full bg-[#0b2447]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Scale className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest">Đối soát</span>
                 </button>
              </div>
           </div>
        </div>

        {/* Monthly Summary Alert Box */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 flex flex-col justify-between overflow-hidden relative group">
           <div className="absolute right-0 bottom-0 w-40 h-40 bg-blue-50 rounded-tl-full -z-0"></div>
           
           <div className="relative z-10">
              <h3 className="text-[13px] font-black tracking-widest text-[#0b2447] uppercase mb-8 flex items-center gap-3">
                 <FileText className="w-5 h-5 text-[#1a56db]" /> TỔNG KẾT THÁNG
              </h3>

              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">DOANH THU ƯỚC TÍNH</p>
                    <p className="text-3xl font-black text-gray-900 leading-none">{formatCurrency(kpi?.totalRevenue || 0).replace('₫', '')} <span className="text-lg font-bold text-gray-400">đ</span></p>
                 </div>

                 <div className="w-full h-px bg-gray-100"></div>

                 <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${(kpi?.monthlyChange || 0) >= 0 ? "bg-[#eaffec] text-[#22a654]" : "bg-red-100 text-red-600"}`}>
                       {(kpi?.monthlyChange || 0) >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                       <p className="text-[13px] font-bold text-gray-800 mb-1 leading-tight">
                          {(kpi?.monthlyChange || 0) >= 0 ? "Tăng trưởng tốt" : "Có dấu hiệu suy giảm"}
                       </p>
                       <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                          Doanh thu {(kpi?.monthlyChange || 0) >= 0 ? "tăng" : "giảm"} <strong className="text-gray-700">{Math.abs(kpi?.monthlyChangePercent || 0)}%</strong> so với tháng trước.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>

      {/* Data tables area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Invoices List */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col p-2">
          <div className="px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-[#f4f7fa] flex items-center justify-center">
                  <ReceiptText className="w-4 h-4 text-[#1a56db]" />
               </div>
               <h3 className="text-[13px] font-black tracking-widest text-[#0b2447] uppercase">Phiếu thu chờ xử lý</h3>
            </div>
            <button
              onClick={() => navigate(ACCOUNTING_ROUTES.INVOICES)}
              className="text-[11px] font-black tracking-widest uppercase text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1.5"
            >
              Tất cả <ChevronRightCircle className="w-4 h-4" />
            </button>
          </div>
          
          <div className="px-2 pb-2">
             <AccountingInvoiceTable
               data={recentInvoices.slice(0, 5)}
               columns={[
                 { key: "id", label: "Mã phiếu", width: "100px" },
                 { key: "customerName", label: "Khách hàng" },
                 { key: "amount", label: "Số tiền", type: "currency" },
                 { key: "status", label: "Trạng thái", type: "status" },
               ]}
               statusMap={INVOICE_STATUS}
               onRowClick={(row) => navigate(`${ACCOUNTING_ROUTES.INVOICES}/${row.id}`)}
               actions={[
                 {
                   icon: "👁️",
                   label: "Xem",
                   onClick: (row) => navigate(`${ACCOUNTING_ROUTES.INVOICES}/${row.id}`),
                 },
               ]}
             />
          </div>
        </div>

        {/* Active Contracts */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col p-2">
          <div className="px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-[#f4f7fa] flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#1a56db]" />
               </div>
               <h3 className="text-[13px] font-black tracking-widest text-[#0b2447] uppercase">Hợp đồng đến hạn</h3>
            </div>
            <button
              onClick={() => navigate(ACCOUNTING_ROUTES.CONTRACTS)}
              className="text-[11px] font-black tracking-widest uppercase text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1.5"
            >
              Tất cả <ChevronRightCircle className="w-4 h-4" />
            </button>
          </div>
          
          <div className="px-2 pb-2">
             <AccountingInvoiceTable
               data={overdueContracts.slice(0, 5)}
               columns={[
                 { key: "id", label: "Mã HĐ", width: "100px" },
                 { key: "customerName", label: "Khách hàng" },
                 { key: "baseRent", label: "Tiền thuê", type: "currency" },
                 { key: "status", label: "Trạng thái", type: "status" },
               ]}
               statusMap={CONTRACT_STATUS}
               onRowClick={(row) => navigate(`${ACCOUNTING_ROUTES.CONTRACTS}/${row.id}`)}
               actions={[
                 {
                   icon: "✏️",
                   label: "Lập phiếu",
                   primary: true,
                   onClick: (row) => navigate(ACCOUNTING_ROUTES.BILLING),
                 },
               ]}
             />
          </div>
        </div>

      </div>

    </div>
  );
}

// Icon Component
function DownloadReportIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
       <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
       <polyline points="7 10 12 15 17 10"></polyline>
       <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  )
}
