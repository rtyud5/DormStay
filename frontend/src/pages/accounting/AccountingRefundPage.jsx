import React, { useState } from "react";
import { 
  ChevronRight, Calendar, User, FileText, Banknote, Landmark, 
  Wallet, CheckCircle2, XCircle, Briefcase, HelpCircle, FileCheck2, CreditCard
} from "lucide-react";

export default function AccountingRefundPage() {
  const [paymentMethod, setPaymentMethod] = useState("TRANSFER");

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto bg-[#f9fafb] min-h-screen">
      
      {/* Top Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-10 border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-[2.2rem] font-extrabold text-[#0b2447] tracking-tight leading-none mb-3">
             Lập phiếu hoàn cọc
          </h1>
          <p className="text-gray-500 font-medium">
             Xác nhận các khoản khấu trừ và thông tin thụ hưởng để hoàn tất quy trình kết thúc hợp đồng.
          </p>
        </div>
        
        <button className="flex items-center justify-center gap-2 px-8 py-3.5 mt-8 xl:mt-4 bg-white border border-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-sm self-start xl:self-auto">
           Lưu bản nháp
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        
        {/* Left Main Content */}
        <div className="flex-1 space-y-6 w-full">
           
           {/* Info Card */}
           <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-[#f9fafb]">
                 <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[#0b2447]" strokeWidth={2.5} />
                    <h2 className="text-[14px] font-black tracking-widest text-[#0b2447] uppercase">THÔNG TIN ĐỐI TƯỢNG</h2>
                 </div>
                 <span className="bg-gray-200 px-3 py-1 rounded-full text-[11px] font-black text-gray-600 tracking-widest">
                    ID: 29841
                 </span>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">TÊN KHÁCH HÀNG</p>
                    <p className="font-extrabold text-[#111827] text-[1.4rem] leading-none">Nguyễn Minh Tuấn</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">MÃ HỢP ĐỒNG</p>
                    <p className="font-extrabold text-[#111827] text-[1.4rem] leading-none">HD-2024-0892</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">SỐ ĐIỆN THOẠI</p>
                    <p className="font-medium text-gray-700 text-lg leading-none">0987 654 321</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">PHÒNG / GIƯỜNG</p>
                    <div className="flex items-center gap-2">
                       <span className="bg-[#0b2447] text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-sm">P.402</span>
                       <span className="bg-[#8ebbfa] text-[#0b2447] px-4 py-1.5 rounded-full font-bold text-sm shadow-sm">G-A</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Money Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cọc gốc */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">TIỀN CỌC BAN ĐẦU</p>
                 <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-[2.5rem] font-extrabold tracking-tighter text-[#0b2447] leading-none">5.000.000</span>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">VND</span>
                 </div>
                 <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Ghi nhận: 15/01/2024</span>
                 </div>
              </div>
              
              {/* Thực hoàn */}
              <div className="bg-[#0b2447] rounded-[2rem] p-8 shadow-xl shadow-[#0b2447]/20 flex flex-col justify-center relative overflow-hidden text-white">
                 <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full"></div>
                 <div className="absolute right-10 top-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
                 
                 <div className="relative z-10">
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-4">THỰC HOÀN (SỐ TIỀN CHI)</p>
                    <div className="flex items-baseline gap-2 mb-4">
                       <span className="text-[2.5rem] font-extrabold tracking-tighter text-white leading-none">4.850.000</span>
                       <span className="text-sm font-bold text-blue-300 uppercase tracking-widest">VND</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-200/80">
                       <Banknote className="w-4 h-4" />
                       <span className="text-[11px] font-bold">Đã trừ khấu trừ hư hại (150.000đ)</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Payment Information */}
           <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                 <Wallet className="w-5 h-5 text-[#0b2447]" strokeWidth={2.5} />
                 <h2 className="text-[14px] font-black tracking-widest text-[#0b2447] uppercase">THÔNG TIN THANH TOÁN</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                 <button 
                   onClick={() => setPaymentMethod("TRANSFER")}
                   className={`p-4 rounded-full flex items-center justify-center gap-3 transition-colors font-bold text-[14px] border-2 ${
                     paymentMethod === "TRANSFER" 
                       ? "bg-[#f4f7fa] border-[#0b2447] text-[#0b2447]" 
                       : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                   }`}
                 >
                    <Landmark className="w-5 h-5" strokeWidth={2} />
                    Chuyển khoản
                 </button>
                 <button 
                   onClick={() => setPaymentMethod("CASH")}
                   className={`p-4 rounded-full flex items-center justify-center gap-3 transition-colors font-bold text-[14px] border-2 ${
                     paymentMethod === "CASH" 
                       ? "bg-[#f4f7fa] border-[#0b2447] text-[#0b2447]" 
                       : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                   }`}
                 >
                    <Banknote className="w-5 h-5" strokeWidth={2} />
                    Tiền mặt
                 </button>
              </div>

              {/* Bank Details Content */}
              {paymentMethod === "TRANSFER" && (
                 <div className="bg-[#f9fafb] border border-gray-100 rounded-[2rem] p-8 relative">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-50">
                             {/* Simple Vietcombank mock logo */}
                             <span className="text-[#00a850] font-black text-xl italic tracking-tighter">VCB</span>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">NGÂN HÀNG THỤ HƯỞNG</p>
                             <p className="font-extrabold text-gray-900">Vietcombank - HCM Branch</p>
                          </div>
                       </div>
                       <button className="text-[13px] font-extrabold text-gray-800 hover:text-blue-600 transition-colors">
                          Thay đổi
                       </button>
                    </div>

                    <div className="h-px bg-gray-200/60 w-full mb-8"></div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">SỐ TÀI KHOẢN</p>
                          <p className="font-black text-2xl tracking-[0.2em] text-[#0b2447]">0071 0001 23456</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">TÊN CHỦ TÀI KHOẢN</p>
                          <p className="font-black text-xl text-gray-700 tracking-wide">NGUYEN MINH TUAN</p>
                       </div>
                    </div>
                 </div>
              )}
           </div>

        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-[380px] shrink-0 sticky top-10 flex flex-col gap-6">
           
           {/* Kiểm soát nội bộ */}
           <div className="bg-[#fefeff] rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                 <FileCheck2 className="w-5 h-5 text-[#0b2447]" strokeWidth={2.5} />
                 <h2 className="text-[13px] font-black tracking-widest text-[#0b2447] uppercase">KIỂM SOÁT NỘI BỘ</h2>
              </div>

              <div className="space-y-4 mb-8">
                 <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-blue-500 mt-0.5 flex-shrink-0 transition-colors"></div>
                    <p className="text-[13px] text-gray-600 font-medium leading-relaxed">Đã xác nhận biên bản bàn giao CSVC & phòng ở.</p>
                 </label>
                 <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-blue-500 mt-0.5 flex-shrink-0 transition-colors"></div>
                    <p className="text-[13px] text-gray-600 font-medium leading-relaxed">Đã thu hồi chìa khóa, thẻ từ và thiết bị đi kèm.</p>
                 </label>
                 <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-blue-500 mt-0.5 flex-shrink-0 transition-colors"></div>
                    <p className="text-[13px] text-gray-600 font-medium leading-relaxed">Kiểm tra công nợ dịch vụ (Điện, nước, wifi) đã sạch.</p>
                 </label>
              </div>

              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">GHI CHÚ KẾ TOÁN</p>
                 <textarea 
                   placeholder="Nhập lưu ý cho phê duyệt viên..."
                   className="w-full h-32 bg-[#f4f7fa] border-none rounded-[1.5rem] p-5 text-sm font-medium outline-none text-gray-700 resize-none placeholder-gray-400 focus:ring-2 focus:ring-blue-100"
                 ></textarea>
              </div>
           </div>

           {/* Total Calculation */}
           <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-50 flex flex-col gap-6">
              <div className="flex justify-between items-center text-sm">
                 <span className="font-semibold text-gray-500">Tiền cọc gốc:</span>
                 <span className="font-bold text-gray-800">5.000.000đ</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="font-semibold text-gray-500">Tổng khấu trừ:</span>
                 <span className="font-bold text-[#e02424]">- 150.000đ</span>
              </div>
              
              <div className="h-px w-full bg-gray-100"></div>

              <div className="flex items-end justify-between">
                 <p className="font-black text-[13px] text-gray-900 uppercase tracking-widest pb-1">TỔNG HOÀN:</p>
                 <p className="font-black text-[2.2rem] text-[#0b2447] tracking-tight leading-none">4.850.000đ</p>
              </div>

              <button className="w-full bg-[#0b2447] text-white py-4 mt-2 rounded-[1.25rem] font-black text-[15px] shadow-lg shadow-[#0b2447]/20 hover:bg-[#0a1e3b] transition-transform hover:scale-[1.02] flex items-center justify-center gap-2">
                 <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> PHÁT HÀNH PHIẾU CHI
              </button>

              <p className="text-center text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2 leading-relaxed">
                 CHỨNG TỪ SẼ ĐƯỢC ĐẨY LÊN HỆ THỐNG ERP KẾ TOÁN SAU KHI XÁC NHẬN.
              </p>
           </div>

           {/* Cancel */}
           <button className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-700 transition-colors py-4 font-bold text-sm">
              <XCircle className="w-4 h-4" /> Hủy bỏ phiên làm việc
           </button>

        </div>

      </div>

      {/* Floating Help Button */}
      <div className="fixed bottom-10 right-10 w-14 h-14 bg-[#0b2447] rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer hover:scale-110 transition-transform">
         <HelpCircle className="w-6 h-6" />
      </div>

    </div>
  );
}
