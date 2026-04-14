import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, User, Save, Building, Users, CalendarDays, 
  MapPin, Plus, X, LayoutTemplate, ShieldCheck, Landmark, 
  Wand2, DivideSquare, FileSpreadsheet
} from "lucide-react";
import { formatCurrency } from "../../utils/accounting.utils";
import { ACCOUNTING_ROUTES } from "../../constants/accounting.constants";

export default function AccountingBillingPage() {
  const navigate = useNavigate();
  const [selectedContractId, setSelectedContractId] = useState("");
  
  // Mock data cho danh sách hợp đồng chờ tạo phiếu
  const pendingContracts = [
    {
      id: "CTR-8892-HN",
      customerId: "CUS-0412-VMA",
      customerName: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "090-123-4567",
      moveInDate: "15/08/2024",
      roomTitle: "Phòng 402 - Giường B",
      roomType: "Phòng cao cấp • Tòa A",
      baseRate: 4500000,
      daysInMonth: 31,
      rentDays: 17,
    },
    {
      id: "CTR-9021-HCM",
      customerId: "CUS-0991-KMB",
      customerName: "Lê Thị B",
      email: "lethib@email.com",
      phone: "098-765-4321",
      moveInDate: "10/09/2024",
      roomTitle: "Phòng 105 - Giường A",
      roomType: "Phòng tiêu chuẩn • Tòa B",
      baseRate: 3000000,
      daysInMonth: 30,
      rentDays: 21,
    }
  ];

  const [contract, setContract] = useState(null);
  
  // Các khoản phụ phí có thể chỉnh sửa
  const [extraCharges, setExtraCharges] = useState([
    { id: 1, name: "Phí thẻ từ", price: 200000 },
    { id: 2, name: "Bộ kit chào mừng", price: 150000 }
  ]);

  useEffect(() => {
    if (selectedContractId) {
      const found = pendingContracts.find(c => c.id === selectedContractId);
      setContract(found);
    } else {
      setContract(null);
    }
  }, [selectedContractId]);

  const handleAddExtraCharge = () => {
    setExtraCharges([...extraCharges, { id: Date.now(), name: "Phụ phí mới", price: 0 }]);
  };

  const handleRemoveExtraCharge = (id) => {
    setExtraCharges(extraCharges.filter(c => c.id !== id));
  };

  const handleUpdateExtraCharge = (id, field, value) => {
    setExtraCharges(extraCharges.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // Tính toán
  const proratedRent = contract ? Math.round((contract.baseRate / contract.daysInMonth) * contract.rentDays) : 0;
  const deposit = contract ? contract.baseRate : 0; // 1 tháng tiền nhà
  const totalExtra = extraCharges.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const grandTotal = proratedRent + deposit + totalExtra;

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto bg-[#f9fafb] min-h-screen">
      
      {/* Top Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8 mt-4">
        <div>
          <div className="flex items-center gap-3 text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
             <span className="bg-gray-200 px-2.5 py-1 rounded-md text-gray-700">Lập khoản thu nhận phòng</span>
             <span className="text-gray-400">•</span>
             <span>BẢN NHÁP ID: #GEN-2024-0812</span>
          </div>
          <h1 className="text-[2.5rem] font-extrabold text-[#0b2447] tracking-tight leading-none mb-4">
            Tạo Hóa Đơn Đầu Kỳ
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 mt-4">
             {/* Chọn Hợp đồng */}
             <div className="relative inline-flex items-center bg-white border-2 border-gray-100 rounded-full pl-4 pr-2 py-1.5 shadow-sm hover:border-blue-200 transition-colors">
                <FileText className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-bold text-gray-600 mr-2">Hợp đồng:</span>
                <select 
                  value={selectedContractId}
                  onChange={(e) => setSelectedContractId(e.target.value)}
                  className="bg-transparent text-sm font-extrabold outline-none text-[#0b2447] cursor-pointer appearance-none pr-6"
                >
                  <option value="">-- Chọn Hợp Đồng --</option>
                  {pendingContracts.map(c => (
                    <option key={c.id} value={c.id}>{c.id}</option>
                  ))}
                </select>
                {/* Custom chevron */}
                <div className="absolute right-3 pointer-events-none text-gray-400 text-xs">▼</div>
             </div>

             {/* Khách hàng (Auto-filled) */}
             <div className="inline-flex items-center bg-white border-2 border-gray-100 rounded-full px-4 py-1.5 shadow-sm opacity-80">
                <User className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-bold text-gray-600 mr-2">Khách hàng:</span>
                <span className="text-sm font-extrabold text-[#0b2447]">{contract ? contract.customerId : "Chưa chọn"}</span>
             </div>
          </div>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-800 rounded-xl font-extrabold hover:bg-gray-50 transition-colors shadow-sm self-start xl:self-auto">
          <Save className="w-5 h-5" /> Lưu bản nháp
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* Left Main Content */}
        <div className="flex-1 space-y-6 w-full">
           
           {/* Row 1: Resident Info & Room Details */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Resident Info Card */}
              <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 relative overflow-hidden">
                 <div className="flex items-center gap-3 mb-6">
                    <User className="w-5 h-5 text-gray-400" />
                    <h2 className="text-[1.1rem] font-extrabold text-[#111827]">Thông tin khách thuê</h2>
                 </div>

                 {contract ? (
                   <>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-full bg-[#f0f4fa] text-[#1a56db] flex items-center justify-center font-extrabold text-xl shadow-inner border border-blue-100/50">
                          {contract.customerName.split(' ').map(n=>n[0]).join('').slice(-2)}
                        </div>
                        <div>
                          <p className="font-extrabold text-lg text-gray-900 leading-tight">{contract.customerName}</p>
                          <p className="text-sm text-gray-500 font-medium">{contract.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Số điện thoại</p>
                          <p className="font-bold text-gray-800">{contract.phone}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ngày nhận phòng</p>
                          <p className="font-bold text-gray-800">{contract.moveInDate}</p>
                        </div>
                    </div>
                   </>
                 ) : (
                    <div className="h-32 flex items-center justify-center text-gray-400 font-medium italic border-2 border-dashed border-gray-100 rounded-xl">
                       Vui lòng chọn hợp đồng ở trên...
                    </div>
                 )}
              </div>

              {/* Room Details Card */}
              <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 relative overflow-hidden">
                 <div className="flex items-center gap-3 mb-6">
                    <Building className="w-5 h-5 text-gray-400" />
                    <h2 className="text-[1.1rem] font-extrabold text-[#111827]">Chi tiết Phòng/Giường</h2>
                 </div>

                 {contract ? (
                   <>
                     <div className="bg-[#f8f9fc] border border-gray-200/60 rounded-[1.5rem] p-5 mb-6 text-center">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">ĐƠN VỊ ĐÃ CHỌN</p>
                        <p className="font-black text-xl text-gray-900 leading-tight mb-1">{contract.roomTitle}</p>
                        <p className="text-xs font-bold text-gray-500">{contract.roomType}</p>
                     </div>
                     <div className="flex items-center justify-between px-2">
                        <span className="text-sm font-bold text-gray-500">Giá thuê cơ bản</span>
                        <span className="font-extrabold text-gray-900">{formatCurrency(contract.baseRate)} <span className="text-xs font-bold text-gray-500">VNĐ/tháng</span></span>
                     </div>
                   </>
                 ) : (
                    <div className="h-32 flex items-center justify-center text-gray-400 font-medium italic border-2 border-dashed border-gray-100 rounded-xl">
                       Đợi thông tin hợp đồng...
                    </div>
                 )}
              </div>
           </div>

           {/* Initial Rent Period Breakdown Card */}
           <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <LayoutTemplate className="w-5 h-5 text-gray-400" />
                <h2 className="text-[1.2rem] font-extrabold text-[#111827]">Chi Tiết Kỳ Thuê Đầu Tiên</h2>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-[#f9fafb] border-y border-gray-100">
                          <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] w-2/5">Mô tả</th>
                          <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-center">Đơn giá</th>
                          <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-center">Số lượng</th>
                          <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-right rounded-r-lg">Thành tiền</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50">
                       <tr className="group">
                          <td className="py-6 px-4">
                             <p className="font-extrabold text-[15px] text-gray-900 leading-tight">Tiền thuê theo ngày thực ở</p>
                             <p className="font-bold text-[15px] text-gray-900 mb-1">(T.8 15 - T.8 31)</p>
                             <p className="text-[12px] font-medium text-gray-500">{contract ? `${contract.rentDays} ngày trên tổng số ${contract.daysInMonth} ngày` : '--'}</p>
                          </td>
                          <td className="py-6 px-4 text-center">
                             <p className="font-bold text-gray-700">{contract ? formatCurrency(Math.round(contract.baseRate / contract.daysInMonth)) : '0'}</p>
                             <p className="text-[11px] font-bold text-gray-400 uppercase">VNĐ/ngày</p>
                          </td>
                          <td className="py-6 px-4 text-center font-bold text-gray-700">
                             {contract ? `${contract.rentDays} ngày` : '0'}
                          </td>
                          <td className="py-6 px-4 text-right">
                             <p className="font-black text-[17px] text-gray-900">{formatCurrency(proratedRent)}</p>
                             <p className="text-[11px] font-extrabold text-gray-400 uppercase">VNĐ</p>
                          </td>
                       </tr>
                       <tr className="group">
                          <td className="py-6 px-4">
                             <p className="font-extrabold text-[15px] text-gray-900 leading-tight mb-1">Tiền đặt cọc</p>
                             <p className="text-[12px] font-medium text-gray-500">Sẽ hoàn trả (1 tháng tiền nhà)</p>
                          </td>
                          <td className="py-6 px-4 text-center">
                             <p className="font-bold text-gray-700">{formatCurrency(deposit)}</p>
                             <p className="text-[11px] font-bold text-gray-400 uppercase">VNĐ</p>
                          </td>
                          <td className="py-6 px-4 text-center font-bold text-gray-700">
                             1.0
                          </td>
                          <td className="py-6 px-4 text-right">
                             <p className="font-black text-[17px] text-gray-900">{formatCurrency(deposit)}</p>
                             <p className="text-[11px] font-extrabold text-gray-400 uppercase">VNĐ</p>
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Extra Charges */}
           <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0b2447] flex items-center justify-center text-white font-bold text-sm leading-none">+</div>
                  <h2 className="text-[1.2rem] font-extrabold text-[#111827]">Phụ Phí & Điều Chỉnh</h2>
                </div>
                <button 
                  onClick={handleAddExtraCharge}
                  className="text-[#1a56db] font-bold text-sm flex items-center gap-1 hover:text-blue-800 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Thêm dòng
                </button>
              </div>

              <div className="space-y-4">
                 {extraCharges.map((charge, idx) => (
                    <div key={charge.id} className="flex items-center gap-4 bg-[#f9fafb] p-3 rounded-2xl border border-gray-100/50 relative group">
                       <input 
                         type="text" 
                         value={charge.name}
                         onChange={(e) => handleUpdateExtraCharge(charge.id, 'name', e.target.value)}
                         className="flex-1 bg-transparent border-none outline-none font-bold text-[14px] text-gray-800 px-3 py-2"
                       />
                       <div className="flex items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                         <input 
                           type="number" 
                           value={charge.price}
                           onChange={(e) => handleUpdateExtraCharge(charge.id, 'price', e.target.value)}
                           className="w-28 bg-transparent border-none outline-none text-right font-extrabold text-[15px] text-gray-900"
                           dir="rtl"
                         />
                         <span className="ml-2 text-xs font-bold text-gray-500 uppercase">VNĐ</span>
                       </div>
                       <button 
                         onClick={() => handleRemoveExtraCharge(charge.id)}
                         className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors ml-1"
                       >
                         <X className="w-5 h-5" />
                       </button>
                    </div>
                 ))}
                 {extraCharges.length === 0 && (
                    <p className="text-sm text-gray-400 font-medium italic text-center py-4">Không có phụ phí nào.</p>
                 )}
              </div>
           </div>

           {/* Notes */}
           <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <FileSpreadsheet className="w-5 h-5 text-[#0b2447]" />
                <h2 className="text-[1.1rem] font-extrabold text-[#111827]">Ghi Chú Nội Bộ</h2>
              </div>
              <textarea 
                placeholder="Thêm ghi chú riêng cho phòng kế toán (khách hàng sẽ không thấy)..."
                className="w-full h-32 bg-[#f9fafb] border border-gray-200/60 rounded-2xl p-5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all text-gray-700 resize-none"
              ></textarea>
           </div>
        </div>

        {/* Right Sidebar - Sticky Payment Card */}
        <div className="w-full xl:w-[420px] shrink-0 sticky top-10 space-y-6">
           
           {/* Dark Blue Total Card */}
           <div className="bg-[#0b2447] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/40">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
              
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                 <div>
                   <p className="text-[10px] font-black text-blue-300/80 uppercase tracking-widest mb-1.5">TRẠNG THÁI KHỞI TẠO</p>
                   <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80] animate-pulse"></span>
                     <span className="font-extrabold text-sm tracking-wide">SẴN SÀNG TẠO</span>
                   </div>
                 </div>
                 <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                   <ShieldCheck className="w-5 h-5 text-blue-200" />
                 </div>
              </div>

              <p className="text-[10px] font-black text-blue-300/80 uppercase tracking-widest mb-5">TỔNG HỢP CHI PHÍ</p>
              <div className="space-y-4 mb-8">
                 <div className="flex justify-between items-center text-sm">
                   <span className="font-semibold text-blue-100 text-opacity-80">Tiền thuê (Tính theo ngày)</span>
                   <span className="font-bold">{formatCurrency(proratedRent)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="font-semibold text-blue-100 text-opacity-80">Tiền cọc</span>
                   <span className="font-bold">{formatCurrency(deposit)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm pb-2">
                   <span className="font-semibold text-blue-100 text-opacity-80">Phí quản lý & Phụ phí</span>
                   <span className="font-bold">{formatCurrency(totalExtra)}</span>
                 </div>
              </div>

              <div className="flex items-end justify-between mb-8">
                 <span className="text-xl font-extrabold">Tổng cộng</span>
                 <div className="text-right">
                    <span className="text-[2rem] font-black tracking-tight leading-none text-[#8ebbf8]">{formatCurrency(grandTotal)}</span>
                    <span className="text-xs font-bold text-blue-300 ml-1">VNĐ</span>
                 </div>
              </div>

              <button 
                disabled={!contract}
                className="w-full flex items-center justify-center gap-2 bg-[#8ebbfa] hover:bg-[#a1c9fa] text-[#0b2447] py-4 rounded-xl font-black text-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 <Wand2 className="w-5 h-5" strokeWidth={3} /> Tạo Phiếu Thu
              </button>
              
              <p className="text-center text-[11px] font-medium text-blue-200 mt-5 leading-relaxed opacity-80 px-4">
                 Thao tác này sẽ tạo một phiếu thu chờ thanh toán và thông báo cho khách hàng qua email và ứng dụng DormiCare.
              </p>
           </div>

           {/* Info blocks below the card */}
           <div className="flex gap-4 items-start px-2">
              <ShieldCheck className="w-8 h-8 text-green-600 flex-shrink-0" strokeWidth={1.5} />
              <p className="text-xs font-medium text-gray-500 leading-snug">
                Hệ thống lưu trữ bảo mật. Tất cả thay đổi tài chính đều được ghi nhận phục vụ kiểm toán.
              </p>
           </div>
           <div className="flex gap-4 items-start px-2">
              <Landmark className="w-8 h-8 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
              <p className="text-xs font-medium text-gray-500 leading-snug">
                Tuân thủ nghiêm ngặt quy định thuế VAT và quy chế quản lý bất động sản khu vực.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
