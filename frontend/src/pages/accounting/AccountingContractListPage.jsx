import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Home, Building2, Filter, FileText, Plus, Clock } from "lucide-react";
import { getContracts, generateInitialBilling } from "../../services/accounting.service";
import { ACCOUNTING_ROUTES } from "../../constants/accounting.constants";
import AccountingInvoiceTable from "../../components/accounting/AccountingInvoiceTable";

export default function AccountingContractListPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters mock
  const [filters, setFilters] = useState({ date: "All Dates", type: "All Types", floor: "All Floors" });

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const res = await getContracts();
      setContracts(res.data || []);
      setFilteredContracts(res.data || []);
    } catch (error) {
      console.error("Error loading contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[2rem] font-extrabold text-[#111827] mb-2 tracking-tight">Danh sách hợp đồng chờ lập khoản thu</h1>
        <p className="text-gray-500 font-medium">Quản lý các hợp đồng đang chờ và khởi tạo phiếu thu ban đầu.</p>
      </div>

      {/* Filters Block */}
      <div className="bg-[#f4f7fa] rounded-[1.5rem] p-6 mb-8 flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Ngày Ký Hợp Đồng</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <select
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-gray-700 shadow-sm"
            >
              <option value="All Dates">Tất cả các ngày</option>
              <option value="This Month">Trong tháng này</option>
            </select>
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Loại Phòng</label>
          <div className="relative">
            <Home className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-gray-700 shadow-sm"
            >
              <option value="All Types">Tất cả loại phòng</option>
              <option value="Studio">Studio</option>
              <option value="Shared">Phòng ghép</option>
            </select>
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tầng / Khu Vực</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <select
              value={filters.floor}
              onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
              className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-gray-700 shadow-sm"
            >
              <option value="All Floors">Tất cả các tầng</option>
              <option value="Floor 1">Tầng 1</option>
              <option value="Floor 2">Tầng 2</option>
            </select>
          </div>
        </div>

        <button className="px-8 py-3 bg-[#0b2447] text-white rounded-xl hover:bg-blue-900 transition-colors font-bold shadow-md shadow-blue-900/20 flex items-center gap-2 h-[48px]">
          <Filter className="w-4 h-4" />
          Lọc Dữ Liệu
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100/50">
        <AccountingInvoiceTable
          data={filteredContracts.length > 0 ? filteredContracts : [
            { id: "CTR-9021", customerName: "Nguyễn Văn Toàn", rentalType: "Studio A-102", startDate: "12 Thg 10, 2023", baseRent: "4.500.000 đ", status: "ĐANG XỬ LÝ", _initial: "NT", _bg: "bg-blue-100", _text: "text-blue-700" },
            { id: "CTR-8842", customerName: "Lê Hồng Hạnh", rentalType: "Shared 4-B1", startDate: "15 Thg 10, 2023", baseRent: "1.200.000 đ", status: "ĐANG XỬ LÝ", _initial: "LH", _bg: "bg-green-100", _text: "text-green-700" },
            { id: "CTR-7721", customerName: "Vũ Minh Mạnh", rentalType: "Dorm Room 202", startDate: "18 Thg 10, 2023", baseRent: "2.800.000 đ", status: "ĐANG XỬ LÝ", _initial: "VM", _bg: "bg-indigo-100", _text: "text-indigo-700" },
            { id: "CTR-7501", customerName: "Trần Thị B", rentalType: "Studio A-105", startDate: "20 Thg 10, 2023", baseRent: "4.500.000 đ", status: "ĐANG XỬ LÝ", _initial: "TB", _bg: "bg-purple-100", _text: "text-purple-700" },
          ]}
          hideSelection={true}
          columns={[
            { key: "id", label: "MÃ HỢP ĐỒNG", width: "12%", render: (item) => <span className="font-extrabold text-[#0b2447] text-[13px]">#{item.id}</span> },
            { key: "customerName", label: "TÊN KHÁCH HÀNG", width: "25%", render: (item) => (
              <div className="flex items-center gap-4">
                 <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-sans ${item._bg || 'bg-blue-100'} ${item._text || 'text-blue-700'}`}>
                    {item._initial || 'NT'}
                 </div>
                 <span className="font-bold text-[#111827]">{item.customerName}</span>
              </div>
            ) },
            { key: "rentalType", label: "LOẠI PHÒNG", width: "20%", render: (item) => <span className="font-medium text-gray-700">{item.rentalType}</span> },
            { key: "startDate", label: "NGÀY BẮT ĐẦU", width: "15%", render: (item) => <span className="text-gray-500 font-medium">{item.startDate}</span> },
            { key: "baseRent", label: "SỐ TIỀN DỰ KIẾN", width: "15%", render: (item) => <span className="font-extrabold text-[#111827]">{item.baseRent}</span> },
            { key: "status", label: "TRẠNG THÁI", width: "13%", render: (item) => (
               <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f0f4fa] text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100/50">
                  <Clock className="w-3 h-3 text-blue-500" strokeWidth={3} /> {item.status}
               </div>
            ) },
          ]}
          actions={[
             {
                icon: <FileText className="w-4 h-4 text-white" fill="currentColor" />,
                label: "Lập khoản thu",
                primary: true,
                onClick: (row) => navigate(ACCOUNTING_ROUTES.BILLING)
             }
          ]}
          loading={loading}
        />
        
        {/* Pagination mock */}
        <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">Đang hiển thị <span className="text-gray-900 font-bold">3</span> trên 42 hợp đồng</p>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">❮</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0b2447] text-white font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50 font-bold">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50 font-bold">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50">❯</button>
          </div>
        </div>
      </div>
      
      {/* Floating Action Button - Mock */}
      <div className="fixed bottom-8 left-72">
        <button className="px-8 py-3.5 bg-[#0b2447] text-white rounded-[1.25rem] font-bold shadow-xl shadow-blue-900/30 hover:bg-blue-900 transition-colors">
          Xuất báo cáo
        </button>
      </div>
      <div className="fixed bottom-8 right-8">
        <button className="w-14 h-14 bg-[#0b2447] text-white rounded-[1.25rem] font-bold shadow-xl shadow-blue-900/30 flex items-center justify-center hover:bg-blue-900 transition-transform hover:scale-105">
           <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
