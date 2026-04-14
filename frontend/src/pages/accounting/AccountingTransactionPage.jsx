import React from "react";
import { 
  Download, RefreshCw, Search, ChevronDown, CheckCircle2, 
  XCircle, Clock, FileScan, AlertTriangle, Eye, MoreHorizontal, 
  PenSquare, ShieldAlert, Info, ListChecks, FileText, Landmark
} from "lucide-react";

export default function AccountingTransactionPage() {
  return (
    <div className="p-8 lg:p-10 max-w-[1500px] mx-auto bg-[#f9fafb] min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
         <div>
            <h1 className="text-[2.2rem] font-extrabold text-[#111827] tracking-tight leading-none mb-3">
               Tra soát giao dịch
            </h1>
            <p className="text-gray-500 font-medium max-w-2xl leading-relaxed">
               Thực hiện kiểm tra tính toàn vẹn dữ liệu giữa hệ thống nội bộ và các cổng thanh toán ngân hàng.
            </p>
         </div>
         <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-sm">
               <Download className="w-5 h-5" /> Xuất Excel
            </button>
            <button className="flex items-center gap-2 px-8 py-3.5 bg-[#0b2447] text-white rounded-full font-bold shadow-lg shadow-[#0b2447]/20 hover:bg-[#0a1e3b] transition-colors">
               <RefreshCw className="w-5 h-5" /> Đối soát ngay
            </button>
         </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         {/* TỔNG GIAO DỊCH */}
         <div className="bg-white rounded-full px-8 py-6 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-1">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TỔNG GIAO DỊCH (24H)</p>
            </div>
            <div className="flex items-end gap-3">
               <p className="text-3xl font-black text-gray-900 leading-none">1,402</p>
               <span className="bg-[#eaffec] text-[#22a654] text-[10px] font-black px-2 py-0.5 rounded-full mb-1">+12%</span>
            </div>
         </div>

         {/* CẦN XỬ LÝ */}
         <div className="bg-white rounded-full px-8 py-6 shadow-sm border-2 border-red-500 relative overflow-hidden flex justify-between items-center">
            {/* Left accent arch */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-500"></div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">CẦN XỬ LÝ</p>
               <p className="text-3xl font-black text-[#e02424] leading-none">24</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
               <AlertTriangle className="w-4 h-4" strokeWidth={3} />
            </div>
         </div>

         {/* ĐÃ KHỚP LỆNH */}
         <div className="bg-white rounded-full px-8 py-6 shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ĐÃ KHỚP LỆNH</p>
               <p className="text-3xl font-black text-[#22a654] leading-none">1,378</p>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#eaffec] text-[#22a654] flex items-center justify-center">
               <CheckCircle2 className="w-4 h-4" strokeWidth={3} />
            </div>
         </div>

         {/* TỔNG CHÊNH LỆCH - Dark Card */}
         <div className="bg-[#0b2447] rounded-full px-8 py-6 shadow-xl shadow-[#0b2447]/30 relative overflow-hidden flex flex-col justify-center">
            <Landmark className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 text-white/5" strokeWidth={1} />
            <div className="relative z-10">
               <p className="text-[10px] font-black text-blue-200/80 uppercase tracking-widest mb-1">TỔNG CHÊNH LỆCH</p>
               <p className="text-3xl font-black text-white leading-none">+1,000,000đ</p>
            </div>
         </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-6 items-end">
         <div className="flex-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">TỪ KHÓA TÌM KIẾM</label>
            <div className="relative">
               <Search className="absolute left-5 top-3.5 w-4 h-4 text-gray-400" />
               <input 
                  type="text" 
                  placeholder="Mã giao dịch, tên khách hàng, voucher..." 
                  className="w-full pl-12 pr-4 py-3.5 bg-[#f4f7fa] border-none rounded-full focus:ring-2 focus:ring-blue-200 text-sm font-semibold text-gray-700 outline-none placeholder-gray-400"
               />
            </div>
         </div>
         <div className="w-full md:w-64">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">KHOẢNG THỜI GIAN</label>
            <div className="relative">
               <select className="w-full pl-5 pr-10 py-3.5 bg-[#f4f7fa] border-none rounded-full focus:ring-2 focus:ring-blue-200 appearance-none text-sm font-semibold text-gray-700 outline-none cursor-pointer">
                  <option>Hôm nay (08/05/2024)</option>
                  <option>Tuần này</option>
                  <option>Tháng này</option>
               </select>
               <ChevronDown className="absolute right-5 top-4 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
         </div>
         <div className="w-full md:w-48">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">TRẠNG THÁI HỆ THỐNG</label>
            <div className="relative">
               <select className="w-full pl-5 pr-10 py-3.5 bg-[#f4f7fa] border-none rounded-full focus:ring-2 focus:ring-blue-200 appearance-none text-sm font-semibold text-gray-700 outline-none cursor-pointer">
                  <option>Tất cả</option>
                  <option>Cần xử lý</option>
                  <option>Đã khớp lệch</option>
               </select>
               <ChevronDown className="absolute right-5 top-4 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
         </div>
         <button className="px-8 py-3.5 bg-[#8ebbfa] hover:bg-[#a5cbfb] text-[#0b2447] font-black rounded-full transition-colors whitespace-nowrap">
            Lọc kết quả
         </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 relative mb-8 flex flex-col">
         {/* Floating Action Button */}
         <div className="absolute -right-4 top-[50%] -translate-y-1/2 z-10 w-14 h-14 bg-[#0b2447] rounded-full flex items-center justify-center text-white shadow-xl shadow-[#0b2447]/30 cursor-pointer hover:scale-110 transition-transform">
            <ListChecks className="w-6 h-6" strokeWidth={2.5} />
         </div>

         <div className="overflow-x-auto p-2">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-gray-100">
                     <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[30%]">MÃ GIAO DỊCH / NỘI DUNG</th>
                     <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[12%]">SỐ TIỀN</th>
                     <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[15%]">HỆ THỐNG NỘI BỘ</th>
                     <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[15%]">CỔNG NGÂN HÀNG</th>
                     <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[18%]">CHÊNH LỆCH</th>
                     <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">QUẢN LÝ</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100/50">
                  {/* Row 1 - SUCCESS */}
                  <tr className="hover:bg-gray-50/50 transition-colors">
                     <td className="py-5 px-6">
                        <p className="font-extrabold text-[14px] text-gray-900 mb-0.5">TX-20240508-001</p>
                        <p className="text-[13px] font-medium text-gray-600 mb-1">Thanh toán tiền phòng T5 - Nguyễn Văn A</p>
                        <p className="text-[10px] font-semibold text-gray-400">08/05/2024 14:30</p>
                     </td>
                     <td className="py-5 px-6">
                        <p className="font-black text-[15px] text-[#0b2447]">3,500,000đ</p>
                     </td>
                     <td className="py-5 px-6">
                        <div className="inline-flex items-center gap-1.5 bg-[#eaffec] text-[#22a654] px-3 py-1 rounded-full text-[10px] font-black tracking-widest">
                           <CheckCircle2 className="w-3 h-3" strokeWidth={3} /> SUCCESS
                        </div>
                     </td>
                     <td className="py-5 px-6">
                        <div className="inline-flex items-center gap-1.5 bg-[#eaffec] text-[#22a654] px-3 py-1 rounded-full text-[10px] font-black tracking-widest">
                           <CheckCircle2 className="w-3 h-3" strokeWidth={3} /> MATCHED
                        </div>
                     </td>
                     <td className="py-5 px-6">
                        <p className="font-semibold text-gray-600">0đ</p>
                     </td>
                     <td className="py-5 px-6 text-center">
                        <button className="text-gray-400 hover:text-gray-700 transition-colors"><Eye className="w-5 h-5" /></button>
                     </td>
                  </tr>

                  {/* Row 2 - NOT FOUND / SURPLUS */}
                  <tr className="hover:bg-gray-50/50 transition-colors">
                     <td className="py-5 px-6">
                        <p className="font-extrabold text-[14px] text-[#e02424] mb-0.5">TX-20240508-012</p>
                        <p className="text-[13px] font-medium text-gray-600 mb-1">Đặt cọc giữ chỗ - Trần Thị B</p>
                        <p className="text-[10px] font-semibold text-gray-400">08/05/2024 15:12</p>
                     </td>
                     <td className="py-5 px-6">
                        <p className="font-black text-[15px] text-[#e02424]">1,000,000đ</p>
                     </td>
                     <td className="py-5 px-6">
                        <div className="inline-flex items-center gap-1.5 bg-[#eaffec] text-[#22a654] px-3 py-1 rounded-full text-[10px] font-black tracking-widest">
                           <CheckCircle2 className="w-3 h-3" strokeWidth={3} /> SUCCESS
                        </div>
                     </td>
                     <td className="py-5 px-6">
                        <div className="inline-flex items-center gap-1.5 bg-[#b91c1c] text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-sm">
                           <XCircle className="w-3 h-3" strokeWidth={3} /> NOT FOUND
                        </div>
                     </td>
                     <td className="py-5 px-6">
                        <p className="font-black text-[15px] text-[#e02424] mb-0.5">+1,000,000đ</p>
                        <p className="text-[9px] font-black text-[#991b1b] uppercase tracking-widest">SURPLUS SYSTEM</p>
                     </td>
                     <td className="py-5 px-6 text-center">
                        <button className="bg-[#b91c1c] text-white hover:bg-[#991b1b] rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm">
                           GIẢI TRÌNH
                        </button>
                     </td>
                  </tr>

                  {/* Row 3 - PENDING SCANNING */}
                  <tr className="hover:bg-gray-50/50 transition-colors">
                     <td className="py-5 px-6">
                        <p className="font-extrabold text-[14px] text-gray-900 mb-0.5">VC-DISC20-092</p>
                        <p className="text-[13px] font-medium text-gray-600 mb-1">Voucher Giảm giá 20% - Lê Văn C</p>
                        <p className="text-[10px] font-semibold text-gray-400">08/05/2024 16:05</p>
                     </td>
                     <td className="py-5 px-6">
                        <p className="font-black text-[15px] text-[#1a56db]">-500,000đ</p>
                     </td>
                     <td className="py-5 px-6">
                        <div className="inline-flex items-center gap-1.5 bg-[#8ebbfa] text-[#0b2447] px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-sm">
                           <Clock className="w-3 h-3" strokeWidth={3} /> PENDING
                        </div>
                     </td>
                     <td className="py-5 px-6">
                        <div className="inline-flex items-center gap-1.5 bg-[#e5e7eb] text-gray-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">
                           <FileScan className="w-3 h-3" strokeWidth={3} /> SCANNING
                        </div>
                     </td>
                     <td className="py-5 px-6">
                        <p className="font-semibold text-gray-400">--</p>
                     </td>
                     <td className="py-5 px-6 text-center">
                        <button className="text-gray-400 hover:text-gray-700 transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                     </td>
                  </tr>

                  {/* Row 4 - MISMATCH */}
                  <tr className="bg-[#fffbeb] hover:bg-[#fef3c7] transition-colors relative">
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ea580c]"></div>
                     <td className="py-5 px-6">
                        <p className="font-extrabold text-[14px] text-[#9a3412] mb-0.5">TX-20240508-045</p>
                        <p className="text-[13px] font-bold italic text-[#ea580c] mb-1">Chuyển khoản thiếu tiền điện - Phạm Thu D</p>
                        <p className="text-[10px] font-semibold text-gray-500">08/05/2024 16:45</p>
                     </td>
                     <td className="py-5 px-6">
                        <p className="font-black text-[15px] text-[#9a3412]">120,000đ</p>
                     </td>
                     <td className="py-5 px-6">
                        <div className="inline-flex items-center gap-1.5 bg-[#fef08a] text-[#b45309] px-3 py-1.5 rounded-sm text-[10px] font-black tracking-widest">
                           <AlertTriangle className="w-3 h-3" strokeWidth={3} /> MISMATCH ID
                        </div>
                     </td>
                     <td className="py-5 px-6">
                        <p className="font-bold text-gray-900">120,000đ</p>
                     </td>
                     <td className="py-5 px-6">
                        <p className="font-black text-[12px] text-[#ea580c]">LỆCH NỘI DUNG</p>
                     </td>
                     <td className="py-5 px-6 text-center">
                        <button className="text-[#ea580c] hover:text-[#9a3412] transition-colors"><PenSquare className="w-5 h-5" /></button>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>

         {/* Pagination */}
         <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">HIỂN THỊ BẢN GHI 1-10 TRÊN TỔNG SỐ 1,402</p>
            <div className="flex items-center gap-2">
               <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 font-bold">&lt;</button>
               <button className="w-8 h-8 rounded-full bg-[#0b2447] text-white flex items-center justify-center text-xs font-bold shadow-md">1</button>
               <button className="w-8 h-8 rounded-full bg-transparent text-gray-600 hover:bg-gray-100 flex items-center justify-center text-xs font-bold">2</button>
               <button className="w-8 h-8 rounded-full bg-transparent text-gray-600 hover:bg-gray-100 flex items-center justify-center text-xs font-bold">3</button>
               <span className="text-gray-400 text-xs">...</span>
               <button className="w-8 h-8 rounded-full bg-transparent text-gray-600 hover:bg-gray-100 flex items-center justify-center text-xs font-bold">141</button>
               <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold">&gt;</button>
            </div>
         </div>
      </div>

      {/* Info Boards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Hướng dẫn nghiệp vụ */}
         <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 rounded-full bg-[#f0f4fa] text-[#1a56db] flex items-center justify-center">
                  <FileScan className="w-4 h-4" strokeWidth={2.5} />
               </div>
               <h3 className="text-[11px] font-black text-[#0b2447] uppercase tracking-widest">NGUYÊN TẮC NGHIỆP VỤ</h3>
            </div>
            <p className="text-xs font-medium text-gray-600 leading-relaxed">
               Các giao dịch "Thừa hệ thống" cần được đối soát <strong className="text-gray-800">thủ công</strong> bằng cách tra soát lệnh chuyển tiền từ sao kê ngân hàng gốc (MT940/CSV).
            </p>
         </div>

         {/* Tần suất quét cổng */}
         <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 rounded-full bg-[#eaffec] text-[#22a654] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
               </div>
               <h3 className="text-[11px] font-black text-[#22a654] uppercase tracking-widest">TẦN SUẤT QUÉT CỔNG</h3>
            </div>
            <p className="text-xs font-medium text-gray-600 leading-relaxed">
               Dữ liệu được đồng bộ tự động mỗi 15 phút. Đối với các giao dịch quốc tế, thời gian đối soát có thể kéo dài lên đến 24 giờ làm việc.
            </p>
         </div>

         {/* Cảnh báo rủi ro */}
         <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" strokeWidth={2.5} />
               </div>
               <h3 className="text-[11px] font-black text-red-600 uppercase tracking-widest">CẢNH BÁO RỦI RO</h3>
            </div>
            <p className="text-xs font-medium text-gray-600 leading-relaxed">
               Phát hiện 2 giao dịch có dấu hiệu trùng lặp ID (TX Duplication) từ cổng Napas. Đề nghị kiểm tra kỹ trạng thái hạch toán.
            </p>
         </div>
      </div>

    </div>
  );
}
