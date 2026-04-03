import { Link } from "react-router-dom";

function RoomDetailPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans pb-24">
       {/* Breadcrumb */}
       <nav className="flex text-[12px] text-[#64748B] font-medium mb-8">
          <Link to="/" className="hover:text-[#0052CC] transition-colors">Trang chủ</Link>
          <span className="mx-2">›</span>
          <Link to="/rooms" className="hover:text-[#0052CC] transition-colors">Danh sách phòng</Link>
          <span className="mx-2">›</span>
          <span className="text-[#0F172A] font-bold">Phòng Deluxe Single - Tầng 4</span>
       </nav>

       <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
          {/* Lết Column - Gallery & Info */}
          <div>
             {/* Gallery */}
             <div className="mb-10">
                <div className="relative rounded-[32px] overflow-hidden bg-slate-100 h-[400px] md:h-[500px] mb-4 group cursor-pointer">
                   <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80" alt="Main Room" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute top-6 left-6">
                      <span className="bg-[#0A192F] text-white px-4 py-2 rounded-full text-[11px] font-extrabold tracking-widest uppercase shadow-md">
                         PHÒNG CAO CẤP
                      </span>
                   </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                   <div className="h-24 md:h-32 rounded-2xl overflow-hidden cursor-pointer border-2 border-[#0052CC]">
                      <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80" alt="Thumb" className="w-full h-full object-cover" />
                   </div>
                   <div className="h-24 md:h-32 rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-[#CBD5E1] transition-colors">
                      <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80" alt="Thumb" className="w-full h-full object-cover" />
                   </div>
                   <div className="h-24 md:h-32 rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-[#CBD5E1] transition-colors">
                      <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80" alt="Thumb" className="w-full h-full object-cover" />
                   </div>
                   <div className="h-24 md:h-32 rounded-2xl overflow-hidden cursor-pointer relative group">
                      <img src="https://images.unsplash.com/photo-1600566753086-00f18efc204b?auto=format&fit=crop&w=400&q=80" alt="Thumb" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-[#0F172A]/70 flex items-center justify-center text-white font-extrabold text-[15px] group-hover:bg-[#0F172A]/80 transition-colors">
                         +5 Ảnh
                      </div>
                   </div>
                </div>
             </div>

             {/* Mô tả chi tiết */}
             <div className="mb-12">
                <h2 className="text-[24px] font-extrabold text-[#0F172A] mb-6">Mô tả chi tiết</h2>
                <div className="text-[#475569] text-[15px] leading-relaxed space-y-4 font-medium">
                   <p>Phòng Deluxe Single tại DormStay mang đến không gian riêng tư tối đa và sự tiện nghi vượt trội. Với diện tích 25m2, phòng được thiết kế theo phong cách tối giản hiện đại, tối ưu hóa ánh sáng tự nhiên từ cửa sổ lớn hướng Đông, giúp bạn luôn cảm thấy tràn đầy năng lượng mỗi buổi sáng.</p>
                   <p>Nội thất được trang bị đồng bộ từ gỗ cao cấp, bao gồm giường đơn 1m4, bàn làm việc rộng rãi, tủ quần áo âm tường và hệ thống điều hòa Inverter tiết kiệm điện. Đây là lựa chọn lý tưởng cho sinh viên hoặc người đi làm mong muốn một môi trường sống yên tĩnh để học tập và nghỉ ngơi sau ngày dài làm việc.</p>
                </div>
             </div>

             {/* Tiện ích đặc quyền */}
             <div className="mb-12">
                <h2 className="text-[24px] font-extrabold text-[#0F172A] mb-6">Tiện ích đặc quyền</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="bg-[#F8F9FA] rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3 border border-slate-100/50 hover:-translate-y-1 transition-transform">
                      <div className="text-[#0052CC]">
                         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      </div>
                      <span className="text-[13px] font-bold text-[#0F172A]">Điều hòa Inverter</span>
                   </div>
                   <div className="bg-[#F8F9FA] rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3 border border-slate-100/50 hover:-translate-y-1 transition-transform">
                      <div className="text-[#0052CC]">
                         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.906 14.142 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
                      </div>
                      <span className="text-[13px] font-bold text-[#0F172A]">Wifi Tốc độ cao</span>
                   </div>
                   <div className="bg-[#F8F9FA] rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3 border border-slate-100/50 hover:-translate-y-1 transition-transform">
                      <div className="text-[#0052CC]">
                         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      </div>
                      <span className="text-[13px] font-bold text-[#0F172A]">WC Riêng biệt</span>
                   </div>
                   <div className="bg-[#F8F9FA] rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3 border border-slate-100/50 hover:-translate-y-1 transition-transform">
                      <div className="text-[#0052CC]">
                         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <span className="text-[13px] font-bold text-[#0F172A]">Bàn làm việc</span>
                   </div>
                </div>
             </div>

             {/* Split Rules and Policy */}
             <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border-2 border-[#F1F5F9] rounded-3xl p-8 relative overflow-hidden">
                   <div className="flex flex-col mb-6 relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                         <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                         <h3 className="font-extrabold text-[18px] text-[#0F172A]">Nội quy phòng</h3>
                      </div>
                   </div>
                   <ul className="space-y-4 relative z-10">
                      <li className="flex items-start gap-3">
                         <div className="mt-0.5 text-[#22A06B] bg-[#E4F2ED] rounded-full p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg></div>
                         <span className="text-[#475569] text-[14px] font-medium">Giờ giấc tự do (Khóa vân tay)</span>
                      </li>
                      <li className="flex items-start gap-3">
                         <div className="mt-0.5 text-[#22A06B] bg-[#E4F2ED] rounded-full p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg></div>
                         <span className="text-[#475569] text-[14px] font-medium">Giữ gìn vệ sinh không gian chung</span>
                      </li>
                      <li className="flex items-start gap-3">
                         <div className="mt-0.5 text-red-500 bg-red-100 rounded-full p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/></svg></div>
                         <span className="text-[#475569] text-[14px] font-medium">Không nuôi thú cưng</span>
                      </li>
                      <li className="flex items-start gap-3">
                         <div className="mt-0.5 text-red-500 bg-red-100 rounded-full p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/></svg></div>
                         <span className="text-[#475569] text-[14px] font-medium">Không hút thuốc trong phòng</span>
                      </li>
                   </ul>
                </div>

                <div className="bg-white border-2 border-[#F1F5F9] rounded-3xl p-8 relative overflow-hidden">
                   <div className="flex items-center gap-3 mb-8 relative z-10">
                      <svg className="w-5 h-5 text-[#0052CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      <h3 className="font-extrabold text-[18px] text-[#0F172A]">Chính sách cọc</h3>
                   </div>
                   <div className="space-y-6 relative z-10">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                         <span className="text-[#64748B] text-[14px] font-medium">Tiền đặt cọc</span>
                         <span className="text-[#0F172A] text-[15px] font-bold">1 tháng tiền phòng</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[#64748B] text-[14px] font-medium">Hoàn cọc</span>
                         <span className="text-[#0F172A] text-[15px] font-bold">Sau 3 ngày trả phòng</span>
                      </div>
                      <p className="text-[#94A3B8] text-[12px] italic mt-4">
                         * Vui lòng thông báo trước 30 ngày khi có ý định trả phòng để được hoàn cọc 100%.
                      </p>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Column - Booking Card sticky */}
          <div className="relative w-full">
             <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-slate-50 sticky top-24">
                <div className="flex justify-between items-start mb-2">
                   <h1 className="text-[26px] font-extrabold text-[#0F172A] leading-tight">Phòng 402 - Deluxe</h1>
                   <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[11px] font-extrabold tracking-wide uppercase rounded-full">Trống</span>
                </div>
                <p className="text-[#64748B] text-[13px] font-medium mb-8">Tầng 4 | Mã: DM-402-DX</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-slate-100">
                      <div className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider mb-1">GIÁ THUÊ</div>
                      <div className="flex items-baseline gap-1">
                         <span className="text-[20px] font-extrabold text-[#0052CC]">5.500.000đ</span>
                         <span className="text-[12px] text-[#64748B] font-medium">/tháng</span>
                      </div>
                   </div>
                   <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-slate-100">
                      <div className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider mb-1">ĐẶT CỌC</div>
                      <div className="flex items-baseline gap-1">
                         <span className="text-[20px] font-extrabold text-[#0F172A]">5.500.000đ</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-4 mb-8 text-[14px]">
                   <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-3 text-[#64748B] font-medium">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                         Giới tính
                      </div>
                      <span className="font-bold text-[#0F172A]">Nam/Nữ</span>
                   </div>
                   <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-3 text-[#64748B] font-medium">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         Nhận phòng từ
                      </div>
                      <span className="font-bold text-[#0F172A]">Hôm nay</span>
                   </div>
                   <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-3 text-[#64748B] font-medium">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
                         Số chỗ trống
                      </div>
                      <span className="font-bold text-[#0052CC]">1 Giường duy nhất</span>
                   </div>
                </div>

                <button className="w-full bg-[#0A192F] hover:bg-[#112240] text-white py-4 rounded-2xl font-bold text-[15px] transition-colors shadow-lg hover:shadow-xl mb-4">
                   Đặt cọc giữ chỗ ngay
                </button>

                <div className="flex gap-4 mb-6">
                   <button className="flex-1 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[#0F172A] py-3 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      Liên hệ
                   </button>
                   <button className="flex-1 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[#0F172A] py-3 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      Quan tâm
                   </button>
                </div>

                <div className="bg-[#E6F0FF] p-4 rounded-xl flex items-start gap-3">
                   <div className="text-[#0052CC] shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                   </div>
                   <p className="text-[12px] text-[#0052CC] font-medium leading-relaxed">
                      Giá thuê đã bao gồm phí quản lý và dọn dẹp vệ sinh khu vực chung 2 lần/tuần.
                   </p>
                </div>
             </div>
          </div>
       </div>

       {/* Gợi ý phòng tương tự */}
       <div className="mt-24">
          <div className="flex justify-between items-end mb-8">
             <div>
                <h2 className="text-[28px] font-extrabold text-[#0F172A] mb-2">Gợi ý phòng tương tự</h2>
                <p className="text-[#64748B] text-[15px] font-medium">Có thể bạn sẽ quan tâm đến những lựa chọn khác cùng khu vực</p>
             </div>
             <Link to="/rooms" className="hidden sm:flex items-center gap-1 font-bold text-[14px] text-[#0F172A] hover:text-[#0052CC] transition-colors">
                Xem tất cả 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
             </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
             {/* Card 1 */}
             <div className="group cursor-pointer">
                <div className="relative rounded-[24px] overflow-hidden bg-slate-100 h-[220px] mb-4">
                   <img src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80" alt="Room 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[12px] font-bold text-[#0F172A] shadow-sm">
                      Từ 4.2tr
                   </div>
                </div>
                <h3 className="font-extrabold text-[16px] text-[#0F172A] mb-1 group-hover:text-[#0052CC] transition-colors line-clamp-1">Phòng Studio Tiêu Chuẩn</h3>
                <div className="flex items-center gap-1 text-[13px] text-[#64748B] font-medium">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   Quận 7, TP. Hồ Chí Minh
                </div>
             </div>

             {/* Card 2 */}
             <div className="group cursor-pointer">
                <div className="relative rounded-[24px] overflow-hidden bg-slate-100 h-[220px] mb-4">
                   <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80" alt="Room 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[12px] font-bold text-[#0F172A] shadow-sm">
                      Từ 2.5tr
                   </div>
                </div>
                <h3 className="font-extrabold text-[16px] text-[#0F172A] mb-1 group-hover:text-[#0052CC] transition-colors line-clamp-1">Phòng Shared 4 Người</h3>
                <div className="flex items-center gap-1 text-[13px] text-[#64748B] font-medium">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   Quận 1, TP. Hồ Chí Minh
                </div>
             </div>

             {/* Card 3 */}
             <div className="group cursor-pointer">
                <div className="relative rounded-[24px] overflow-hidden bg-slate-100 h-[220px] mb-4">
                   <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80" alt="Room 3" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[12px] font-bold text-[#0F172A] shadow-sm">
                      Từ 8.0tr
                   </div>
                </div>
                <h3 className="font-extrabold text-[16px] text-[#0F172A] mb-1 group-hover:text-[#0052CC] transition-colors line-clamp-1">Phòng Penthouse Mini</h3>
                <div className="flex items-center gap-1 text-[13px] text-[#64748B] font-medium">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   Quận Bình Thạnh, TP. HCM
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

export default RoomDetailPage;
