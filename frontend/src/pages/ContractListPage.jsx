import { Link } from "react-router-dom";

function ContractListPage() {
  return (
    <div className="w-full font-sans pb-12">
      <div className="mb-10 pt-2">
         <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-tight mb-2">Hợp đồng của tôi</h1>
         <p className="text-[#64748B] text-[15px] font-medium">Quản lý và theo dõi các hợp đồng thuê phòng của bạn tại hệ thống DormStay.</p>
      </div>

      {/* Stats row */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
         <div className="bg-white rounded-3xl p-6 flex items-center gap-5 shadow-[0_4px_25px_rgb(0,0,0,0.03)] border border-slate-50">
            <div className="w-14 h-14 rounded-2xl bg-[#E6F0FF] flex items-center justify-center text-[#0052CC]">
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
               <div className="text-[12px] font-bold text-[#64748B] mb-0.5">Tổng số hợp đồng</div>
               <div className="text-[28px] font-extrabold text-[#0F172A] leading-none">03</div>
            </div>
         </div>
         <div className="bg-white rounded-3xl p-6 flex items-center gap-5 shadow-[0_4px_25px_rgb(0,0,0,0.03)] border border-slate-50">
            <div className="w-14 h-14 rounded-2xl bg-[#E4F2ED] flex items-center justify-center text-[#22A06B]">
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
               <div className="text-[12px] font-bold text-[#64748B] mb-0.5">Đang hiệu lực</div>
               <div className="text-[28px] font-extrabold text-[#0F172A] leading-none">01</div>
            </div>
         </div>
         <div className="bg-white rounded-3xl p-6 flex items-center gap-5 shadow-[0_4px_25px_rgb(0,0,0,0.03)] border border-slate-50">
            <div className="w-14 h-14 rounded-2xl bg-[#F8F9FA] flex items-center justify-center text-[#94A3B8]">
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
               <div className="text-[12px] font-bold text-[#64748B] mb-0.5">Sắp hết hạn</div>
               <div className="text-[28px] font-extrabold text-[#0F172A] leading-none">0</div>
            </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 mb-12">
         {/* Main Active Contract */}
         <div className="bg-white rounded-[40px] p-6 pr-8 shadow-[0_4px_30px_rgb(0,0,0,0.04)] border border-slate-50 flex flex-col sm:flex-row gap-8 relative overflow-hidden group">
            <div className="w-full sm:w-[220px] shrink-0 h-[260px] sm:h-full relative rounded-3xl overflow-hidden">
               <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80" alt="Room" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/60 via-transparent to-transparent"></div>
               <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-[#22A06B] text-white text-[11px] font-extrabold tracking-wide rounded-full flex items-center gap-1.5 shadow-sm">
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                     Đang hiệu lực
                  </span>
               </div>
            </div>
            <div className="flex-1 py-6 flex flex-col justify-center">
               <h2 className="text-[28px] font-extrabold text-[#0F172A] leading-tight mb-1">Phòng 402 - Giường A</h2>
               <p className="text-[#64748B] text-[14px] font-medium mb-8">Hợp đồng: #DS-2024-00182</p>
               
               <div className="flex gap-12 mb-8">
                  <div>
                     <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1">NGÀY BẮT ĐẦU</div>
                     <div className="text-[15px] font-bold text-[#0F172A]">01/01/2024</div>
                  </div>
                  <div>
                     <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1">NGÀY KẾT THÚC</div>
                     <div className="text-[15px] font-bold text-[#0F172A]">31/12/2024</div>
                  </div>
               </div>

               <div className="flex items-end justify-between mt-auto">
                  <div className="flex items-baseline gap-1">
                     <span className="text-[24px] font-extrabold text-[#0F172A]">3.500.000đ</span>
                     <span className="text-[13px] text-[#64748B] font-medium">/tháng</span>
                  </div>
                  <button className="w-16 h-16 rounded-full bg-[#0A192F] hover:bg-[#0052CC] text-white flex flex-col items-center justify-center transition-colors shadow-md">
                     <span className="text-[11px] font-bold mb-0.5">Xem <br/>chi tiết</span>
                     <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
               </div>
            </div>
         </div>

         {/* Secondary Column */}
         <div className="flex flex-col gap-6">
            {/* Old Contract 1 */}
            <div className="bg-[#F8F9FA] rounded-[32px] p-7 border border-slate-200/60 shadow-sm relative overflow-hidden flex flex-col">
               <div className="absolute top-6 left-6">
                  <span className="px-3 py-1 bg-[#E2E8F0] text-[#475569] text-[10px] font-extrabold tracking-wide rounded-full flex items-center gap-1.5">
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                     Đã hoàn thành
                  </span>
               </div>
               <div className="pt-10 mb-6">
                  <h3 className="text-[18px] font-extrabold text-[#0F172A]">Phòng 201 - Giường C</h3>
                  <p className="text-[#64748B] text-[12px] font-medium mt-1">Hợp đồng: #DS-2023-00045</p>
               </div>
               
               <div className="flex items-center justify-between mb-8">
                  <div className="bg-white px-4 py-2 rounded-xl text-[12px] font-bold text-[#0F172A] shadow-sm"><span className="block text-[9px] text-[#94A3B8] font-extrabold tracking-wide uppercase mb-0.5">Thời hạn</span>01/01/23 - 31/12/23</div>
                  <div className="bg-white px-4 py-2 rounded-xl text-[12px] font-bold text-[#0F172A] shadow-sm text-right"><span className="block text-[9px] text-[#94A3B8] font-extrabold tracking-wide uppercase mb-0.5">Loại phòng</span>Phòng 4 người (AC)</div>
               </div>

               <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-auto">
                  <span className="text-[13px] text-[#64748B] font-medium italic">Hợp đồng cũ</span>
                  <Link to="#" className="text-[#0052CC] text-[13px] font-bold hover:underline flex items-center gap-1">
                     Xem hồ sơ <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </Link>
               </div>
            </div>

            {/* Contract Request Renewal CTA */}
            <div className="bg-white rounded-[32px] p-7 border-2 border-dashed border-slate-300 hover:border-[#0052CC] hover:bg-[#F8F9FA] transition-all cursor-pointer flex flex-col items-center justify-center text-center group h-full">
               <div className="w-14 h-14 rounded-full bg-[#E2E8F0] group-hover:bg-[#0052CC] group-hover:text-white text-[#475569] flex items-center justify-center mb-4 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
               </div>
               <h3 className="text-[18px] font-extrabold text-[#0F172A] mb-2 px-4">Bạn muốn gia hạn hoặc đăng ký mới?</h3>
               <p className="text-[#64748B] text-[13px] font-medium mb-6 px-4 leading-relaxed">Gửi yêu cầu đăng ký hợp đồng mới ngay tại đây để tiếp tục lưu trú tại DormStay.</p>
               <button className="bg-[#E6F0FF] group-hover:bg-[#0052CC] text-[#0052CC] group-hover:text-white px-6 py-2.5 rounded-full font-bold text-[14px] transition-colors">Đăng ký ngay</button>
            </div>
         </div>
      </div>

      {/* Info Banner */}
      <div className="bg-[#1E293B] rounded-[40px] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl border border-slate-800">
         <div className="absolute inset-0 bg-[#0052CC]/10 backdrop-blur-3xl filter opacity-50"></div>
         <div className="relative z-10 w-full md:w-2/3">
            <h2 className="text-[28px] font-extrabold mb-6">Lưu ý quan trọng về hợp đồng</h2>
            <ul className="space-y-4">
               <li className="flex items-start gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#34D399] shrink-0 border border-[#10B981]/30">i</div>
                  <span className="text-[#CBD5E1] text-[15px] font-medium leading-relaxed">Hợp đồng cần được gia hạn ít nhất 30 ngày trước khi hết hạn để đảm bảo giữ chỗ.</span>
               </li>
               <li className="flex items-start gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#34D399] shrink-0 border border-[#10B981]/30">i</div>
                  <span className="text-[#CBD5E1] text-[15px] font-medium leading-relaxed">Mọi thay đổi về thông tin cá nhân cần được cập nhật trong phụ lục hợp đồng.</span>
               </li>
               <li className="flex items-start gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#34D399] shrink-0 border border-[#10B981]/30">i</div>
                  <span className="text-[#CBD5E1] text-[15px] font-medium leading-relaxed">Việc thanh toán tiền phòng cần được thực hiện theo đúng kỳ hạn ghi trên hợp đồng.</span>
               </li>
            </ul>
         </div>
         <div className="relative z-10 shrink-0 w-full md:w-auto mt-4 md:mt-0">
            <button className="w-full md:w-auto bg-white hover:bg-slate-50 text-[#0F172A] px-8 py-4 rounded-full font-bold text-[15px] shadow-lg hover:shadow-xl transition-all">
               Tải nội quy cư trú (.PDF)
            </button>
         </div>
      </div>
    </div>
  );
}

export default ContractListPage;
