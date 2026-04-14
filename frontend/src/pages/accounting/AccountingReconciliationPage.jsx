import React from "react";
import { 
  FileText, Wrench, Paperclip, Trash2, Plus, 
  ReceiptText, Zap, Droplet, AlertTriangle, 
  FolderOpen, CheckCircle2, ChevronRight, Printer, Mail,
  Expand, Download, PlusSquare, Info, Save
} from "lucide-react";

export default function AccountingReconciliationPage() {
  return (
    <div className="p-8 lg:p-10 max-w-[1500px] mx-auto bg-[#f9fafb] min-h-screen">
      
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8 border-b border-gray-200 pb-6">
         <div>
            <h1 className="text-[2.2rem] font-extrabold text-[#0b2447] tracking-tight leading-none mb-3">
               Lập Bảng Đối Soát Tài Chính
            </h1>
            <p className="text-gray-500 font-medium max-w-2xl leading-relaxed">
               Đối soát các khoản hoàn trả tiền cọc hoặc thu thêm dựa trên hiện trạng bàn giao phòng và công nợ tồn đọng để thực hiện lệnh chi.
            </p>
         </div>
         <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#fef0c7] text-[#dc6803] rounded-full text-xs font-black uppercase tracking-widest border border-[#fef0c7]/50 shadow-sm mt-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#dc6803] animate-pulse"></span>
            ĐANG XỬ LÝ
         </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
         
         {/* Main Content (Left) */}
         <div className="flex-1 space-y-6 w-full">
            
            {/* Dữ liệu nguồn Hợp Đồng */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-[#f0f4fa] flex items-center justify-center text-[#1a56db]">
                     <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-[1.15rem] font-extrabold text-[#111827]">Dữ liệu nguồn Hợp đồng</h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">SỐ HIỆU HỢP ĐỒNG</p>
                     <div className="bg-[#f4f7fa] px-4 py-3.5 rounded-xl font-bold text-gray-800 text-[15px]">
                        HD-2023-8842
                     </div>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">ĐỐI TƯỢNG THANH TOÁN</p>
                     <div className="bg-[#f4f7fa] px-4 py-3.5 rounded-xl font-bold text-gray-800 text-[15px]">
                        Trần Thị Thanh Thảo
                     </div>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">VỊ TRÍ TÀI SẢN</p>
                     <div className="bg-[#f4f7fa] px-4 py-3.5 rounded-xl font-bold text-gray-800 text-[15px]">
                        P.402 - Tòa Sapphire
                     </div>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">TIỀN CỌC KÝ QUỸ (VNĐ)</p>
                     <div className="bg-[#f0f4fa] px-4 py-3.5 rounded-xl font-extrabold text-[#1a56db] text-[15px] text-right">
                        10,000,000
                     </div>
                  </div>
               </div>
            </div>

            {/* Hạng mục khấu trừ */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-2xl bg-[#eaffec] flex items-center justify-center text-[#22a654]">
                        <Wrench className="w-5 h-5" />
                     </div>
                     <h2 className="text-[1.15rem] font-extrabold text-[#111827]">Hạng mục khấu trừ (Biên bản kiểm phòng)</h2>
                  </div>
                  <button className="flex items-center gap-2 text-[#1a56db] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold">
                     <Paperclip className="w-4 h-4" /> Tải tệp đính kèm (.pdf)
                  </button>
               </div>

               <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-4 bg-[#f9fafb] p-3 pl-4 rounded-2xl border border-gray-100">
                     <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">NỘI DUNG CHI PHÍ</p>
                        <p className="font-bold text-[14px] text-gray-800">Sửa chữa khóa cửa chính</p>
                     </div>
                     <div className="w-[150px] text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">THÀNH TIỀN (VNĐ)</p>
                        <p className="font-extrabold text-[15px] text-[#e02424]">750000</p>
                     </div>
                     <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 bg-white rounded-xl shadow-sm border border-gray-100 transition-colors">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>

                  <div className="flex items-center gap-4 bg-[#f9fafb] p-3 pl-4 rounded-2xl border border-gray-100">
                     <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">NỘI DUNG CHI PHÍ</p>
                        <p className="font-bold text-[14px] text-gray-800">Vệ sinh công nghiệp sau bàn giao</p>
                     </div>
                     <div className="w-[150px] text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">THÀNH TIỀN (VNĐ)</p>
                        <p className="font-extrabold text-[15px] text-[#e02424]">500000</p>
                     </div>
                     <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 bg-white rounded-xl shadow-sm border border-gray-100 transition-colors">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                  <Plus className="w-4 h-4" strokeWidth={3} /> Thêm hạng mục kế toán
               </button>
            </div>

            {/* Công nợ & Dịch vụ định kỳ */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-[#f0f5ff] flex items-center justify-center text-[#3b82f6]">
                     <ReceiptText className="w-5 h-5" />
                  </div>
                  <h2 className="text-[1.15rem] font-extrabold text-[#111827]">Công nợ & Dịch vụ định kỳ chưa thanh toán</h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Điện */}
                  <div className="bg-[#f4f7fa] p-5 rounded-2xl relative overflow-hidden group">
                     <div className="flex justify-between items-start mb-4">
                        <Zap className="w-6 h-6 text-[#1a56db]" fill="currentColor" />
                        <span className="bg-[#1a56db] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">ĐIỆN</span>
                     </div>
                     <p className="text-xs font-bold text-gray-500 mb-1">Tiền điện (Kỳ cuối)</p>
                     <p className="text-xl font-black text-gray-900">452000</p>
                  </div>
                  
                  {/* Nước */}
                  <div className="bg-[#f4f7fa] p-5 rounded-2xl relative overflow-hidden group">
                     <div className="flex justify-between items-start mb-4">
                        <Droplet className="w-6 h-6 text-[#06b6d4]" fill="currentColor" />
                        <span className="bg-[#06b6d4] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">NƯỚC</span>
                     </div>
                     <p className="text-xs font-bold text-gray-500 mb-1">Tiền nước (Kỳ cuối)</p>
                     <p className="text-xl font-black text-gray-900">120000</p>
                  </div>

                  {/* Phạt */}
                  <div className="bg-[#f4f7fa] p-5 rounded-2xl relative overflow-hidden group">
                     <div className="flex justify-between items-start mb-4">
                        <AlertTriangle className="w-6 h-6 text-[#ea580c]" fill="currentColor" />
                        <span className="bg-[#ea580c] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">PHẠT</span>
                     </div>
                     <p className="text-xs font-bold text-gray-500 mb-1">Truy thu/Phí phát sinh</p>
                     <p className="text-xl font-black text-gray-900">0</p>
                  </div>
               </div>
            </div>

            {/* Dữ liệu tham chiếu kế toán */}
            <div className="bg-transparent mt-4">
               <div className="flex items-center gap-3 mb-4 px-2">
                  <FolderOpen className="w-5 h-5 text-[#0b2447]" fill="currentColor" strokeWidth={0.5} />
                  <h2 className="text-[1.15rem] font-extrabold text-[#111827]">Dữ liệu tham chiếu kế toán</h2>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Lịch sử */}
                  <div className="lg:col-span-5 bg-[#f4f7fa] rounded-3xl p-6 relative">
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">NHẬT KÝ THANH TOÁN KỲ TRƯỚC</p>
                     
                     <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center">
                           <div>
                              <p className="text-xs font-bold text-gray-900">Tháng 08/2023</p>
                              <p className="text-[10px] font-semibold text-gray-400">TX - 48202</p>
                           </div>
                           <span className="bg-[#eaffec] text-[#22a654] px-2 py-1 rounded text-[10px] font-bold">Khớp lệnh</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <div>
                              <p className="text-xs font-bold text-gray-900">Tháng 07/2023</p>
                              <p className="text-[10px] font-semibold text-gray-400">TX - 41102</p>
                           </div>
                           <span className="bg-[#eaffec] text-[#22a654] px-2 py-1 rounded text-[10px] font-bold">Khớp lệnh</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <div>
                              <p className="text-xs font-bold text-gray-900">Tháng 06/2023</p>
                              <p className="text-[10px] font-semibold text-gray-400">TX - 47001</p>
                           </div>
                           <span className="bg-[#eaffec] text-[#22a654] px-2 py-1 rounded text-[10px] font-bold">Khớp lệnh</span>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-2 pt-4 border-t border-gray-200/50">
                        <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-[10px] italic font-medium text-gray-500">Dữ liệu đã được kiểm toán tự động.</p>
                     </div>
                  </div>

                  {/* Ảnh minh chứng */}
                  <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                     <div className="flex justify-between items-center mb-6">
                        <div>
                           <span className="bg-[#f0f5ff] text-[#1a56db] text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">MINH CHỨNG HIỆN TRẠNG</span>
                           <h3 className="text-sm font-bold text-gray-900">Ảnh hiện trạng bàn giao Checkout (05/09/2023)</h3>
                        </div>
                        <div className="flex gap-2">
                           <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                              <Expand className="w-3.5 h-3.5" />
                           </button>
                           <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                              <Download className="w-3.5 h-3.5" />
                           </button>
                        </div>
                     </div>
                     
                     <div className="flex gap-3 overflow-hidden">
                        <div className="w-[100px] h-[140px] bg-gray-200 rounded-2xl flex-shrink-0 overflow-hidden relative">
                           {/* Placeholder for image 1 */}
                           <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=280&fit=crop')"}}></div>
                        </div>
                        <div className="w-[100px] h-[140px] bg-gray-200 rounded-2xl flex-shrink-0 overflow-hidden relative">
                           {/* Placeholder for image 2 */}
                           <div className="w-full h-full bg-[#f4f7fa] flex items-center justify-center border-2 border-gray-100">
                             <CheckCircle2 className="w-6 h-6 text-gray-300" />
                           </div>
                        </div>
                        <div className="w-[100px] h-[140px] bg-gray-200 rounded-2xl flex-shrink-0 overflow-hidden relative">
                           {/* Placeholder for image 3 */}
                           <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=280&fit=crop')"}}></div>
                        </div>
                        <div className="w-[100px] h-[140px] bg-[#f9fafb] border-2 border-dashed border-gray-200 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                           <PlusSquare className="w-6 h-6 text-gray-400 mb-1" />
                           <span className="text-[10px] font-bold text-gray-400">Thêm ảnh</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

         </div>

         {/* Right Sidebar - Sticky Sticky */}
         <div className="w-full xl:w-[380px] shrink-0 sticky top-10 flex flex-col gap-6">
            
            {/* Payment Summary Card */}
            <div className="bg-[#0b2447] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/40">
               {/* Pattern overlay */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
               <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500 opacity-10 rounded-full -ml-10 -mb-10 blur-xl"></div>
               
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                     <h2 className="text-xl font-black">Quyết toán tạm<br/>tính</h2>
                     <div className="bg-white/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                        ACC REF - 2023
                     </div>
                  </div>

                  <div className="space-y-4 mb-8">
                     <div className="flex justify-between items-center text-[13px]">
                        <span className="font-semibold text-blue-200/80">Phải trả (Cọc gốc)</span>
                        <span className="font-bold tracking-wide">10,000,000</span>
                     </div>
                     <div className="flex justify-between items-center text-[13px]">
                        <span className="font-semibold text-blue-200/80">Phải thu (Hư hại)</span>
                        <span className="font-bold text-[#fca5a5] tracking-wide">- 1,250,000</span>
                     </div>
                     <div className="flex justify-between items-center text-[13px]">
                        <span className="font-semibold text-blue-200/80">Phải thu (Công nợ)</span>
                        <span className="font-bold text-[#fca5a5] tracking-wide">- 572,000</span>
                     </div>
                  </div>

                  <div className="mb-8">
                     <p className="text-[10px] font-black text-blue-300/80 uppercase tracking-widest mb-1">SỐ TIỀN TẤT TOÁN THỰC NHẬN</p>
                     <div className="flex items-baseline gap-2">
                        <span className="text-[2.2rem] font-black tracking-tighter leading-none">8,178,000</span>
                        <span className="text-sm font-bold text-blue-300">VND</span>
                     </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex gap-3 border border-white/10">
                     <div className="w-8 h-8 rounded-full bg-[#4ade80]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-[#4ade80]" fill="currentColor" />
                     </div>
                     <p className="text-xs font-semibold text-blue-50 leading-relaxed">
                        Đối soát hợp lệ theo chứng từ.<br/>Đủ điều kiện phê duyệt lệnh chi.
                     </p>
                  </div>
               </div>
            </div>

            {/* Actions Buttons */}
            <div className="flex flex-col gap-3">
               <button className="w-full bg-[#0b2447] text-white py-4 rounded-[1.25rem] font-black text-[15px] shadow-lg shadow-[#0b2447]/20 hover:bg-[#0a1e3b] transition-all hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Phê duyệt & Lập lệnh chi
               </button>
               <button className="w-full bg-[#f4f7fa] text-gray-700 py-4 rounded-[1.25rem] font-black text-[15px] border border-gray-200/50 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> Lưu nháp đối soát
               </button>
               
               <div className="grid grid-cols-2 gap-3 mt-1">
                  <button className="bg-white border border-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold flex gap-2 justify-center items-center text-sm shadow-sm hover:bg-gray-50 transition-colors">
                     <Printer className="w-4 h-4 text-gray-500" /> In phiếu
                  </button>
                  <button className="bg-white border border-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold flex gap-2 justify-center items-center text-sm shadow-sm hover:bg-gray-50 transition-colors">
                     <Mail className="w-4 h-4 text-gray-500" /> Gửi mail khách
                  </button>
               </div>
            </div>

            {/* Principles Warning */}
            <div className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm mt-2">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-4 text-center">NGUYÊN TẮC KẾ TOÁN</p>
               <div className="flex items-start gap-3 mb-4">
                  <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                     <Info className="w-3 h-3" />
                  </div>
                  <p className="text-xs font-semibold text-gray-600 leading-relaxed">
                     Khấu trừ hư hại phải có biên bản xác nhận ký bởi hai bên.
                  </p>
               </div>
               <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                     <Info className="w-3 h-3" />
                  </div>
                  <p className="text-xs font-semibold text-gray-600 leading-relaxed">
                     Lệnh chi sẽ được gửi tới Kế toán trưởng phê duyệt cuối.
                  </p>
               </div>
            </div>

         </div>

      </div>
    </div>
  );
}
