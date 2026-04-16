import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Home, Building2, Filter, FileText, Plus, Clock } from "lucide-react";
import { getContracts } from "../../services/accounting.service";
import { ACCOUNTING_ROUTES } from "../../constants/accounting.constants";
import AccountingInvoiceTable from "../../components/accounting/AccountingInvoiceTable";
import { formatCurrency } from "../../utils/accounting.utils";
import { CONTRACT_STATUS } from "../../constants/accounting.constants";

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

  const applyFilters = (sourceContracts = contracts) => {
    let nextContracts = [...sourceContracts];

    if (filters.date === "This Month") {
      const currentDate = new Date();
      nextContracts = nextContracts.filter((contract) => {
        const startDate = new Date(contract.startDate);
        return startDate.getMonth() === currentDate.getMonth() && startDate.getFullYear() === currentDate.getFullYear();
      });
    }

    if (filters.type === "PHONG" || filters.type === "GIUONG") {
      nextContracts = nextContracts.filter((contract) => contract.rentalType === filters.type);
    }

    if (filters.floor === "Floor 1" || filters.floor === "Floor 2") {
      const floorNumber = filters.floor.replace("Floor ", "");
      nextContracts = nextContracts.filter((contract) => String(contract.floorName || "").includes(floorNumber));
    }

    setFilteredContracts(nextContracts);
  };

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
        <h1 className="text-[2rem] font-extrabold text-[#111827] mb-2 tracking-tight">
          Danh sách hợp đồng chờ lập khoản thu
        </h1>
        <p className="text-gray-500 font-medium">Quản lý các hợp đồng đang chờ và khởi tạo phiếu thu ban đầu.</p>
      </div>

      {/* Filters Block */}
      <div className="bg-[#f4f7fa] rounded-3xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Ngày Ký Hợp Đồng
          </label>
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
              <option value="All Types">Tất cả loại thuê</option>
              <option value="PHONG">Thuê phòng</option>
              <option value="GIUONG">Thuê giường</option>
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

        <button
          onClick={() => applyFilters()}
          className="px-8 py-3 bg-[#0b2447] text-white rounded-xl hover:bg-blue-900 transition-colors font-bold shadow-md shadow-blue-900/20 flex items-center gap-2 h-12"
        >
          <Filter className="w-4 h-4" />
          Lọc Dữ Liệu
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100/50">
        <AccountingInvoiceTable
          data={filteredContracts}
          hideSelection={true}
          columns={[
            {
              key: "id",
              label: "MÃ HỢP ĐỒNG",
              width: "12%",
              render: (item) => <span className="font-extrabold text-[#0b2447] text-[13px]">#{item.id}</span>,
            },
            {
              key: "customerName",
              label: "TÊN KHÁCH HÀNG",
              width: "25%",
              render: (item) => (
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-sans bg-blue-100 text-blue-700">
                    {item.avatarInitials || "KT"}
                  </div>
                  <span className="font-bold text-[#111827]">{item.customerName}</span>
                </div>
              ),
            },
            {
              key: "rentalType",
              label: "LOẠI PHÒNG",
              width: "20%",
              render: (item) => (
                <span className="font-medium text-gray-700">
                  {item.rentalType === "PHONG" ? "Thuê phòng" : "Thuê giường"}
                </span>
              ),
            },
            {
              key: "startDate",
              label: "NGÀY BẮT ĐẦU",
              width: "15%",
              render: (item) => (
                <span className="text-gray-500 font-medium">
                  {new Date(item.startDate).toLocaleDateString("vi-VN")}
                </span>
              ),
            },
            {
              key: "baseRent",
              label: "SỐ TIỀN DỰ KIẾN",
              width: "15%",
              render: (item) => <span className="font-extrabold text-[#111827]">{formatCurrency(item.baseRent)}</span>,
            },
            {
              key: "status",
              label: "TRẠNG THÁI",
              width: "13%",
              render: (item) => (
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${CONTRACT_STATUS[item.status]?.color || "bg-[#f0f4fa]"} ${CONTRACT_STATUS[item.status]?.textColor || "text-blue-700"}`}
                >
                  <Clock className="w-3 h-3" strokeWidth={3} /> {CONTRACT_STATUS[item.status]?.label || item.status}
                </div>
              ),
            },
          ]}
          actions={[
            {
              icon: <FileText className="w-4 h-4 text-white" fill="currentColor" />,
              label: "Lập khoản thu",
              primary: true,
              onClick: (row) => navigate(ACCOUNTING_ROUTES.BILLING, { state: { contractId: row.id } }),
            },
          ]}
          loading={loading}
        />

        {/* Pagination mock */}
        <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">
            Đang hiển thị <span className="text-gray-900 font-bold">{filteredContracts.length}</span> trên{" "}
            <span className="text-gray-900 font-bold">{contracts.length}</span> hợp đồng
          </p>
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
