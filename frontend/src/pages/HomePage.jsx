import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import RoomService from "../services/room.service";

function HomePage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedRooms() {
      try {
        const res = await RoomService.getRooms();
        setRooms(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeaturedRooms();
  }, []);
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] font-sans pb-16">
      
      {/* Hero Section */}
      <section className="relative px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-16 lg:flex lg:items-center lg:gap-12">
        <div className="lg:w-[45%]">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#1E293B] sm:text-5xl lg:text-5xl leading-tight">
            Nâng tầm trải nghiệm <br />
            <span className="text-[#0052CC]">Lưu trú cao cấp</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-[#64748B] max-w-lg">
            DormStay không chỉ là nơi ở, mà là cộng đồng văn minh, hiện đại với dịch vụ quản lý chuẩn mực dành riêng cho sinh viên và người đi làm.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/rooms">
              <button className="flex items-center justify-center px-6 py-3 border border-transparent text-[15px] font-semibold rounded-full text-white bg-[#0A192F] hover:bg-[#112240] transition-colors shadow-lg shadow-blue-900/20">
                Xem phòng ngay
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </Link>
            <Link to="/deposit">
              <button className="flex items-center justify-center px-6 py-3 border-2 border-transparent text-[15px] font-semibold rounded-full text-[#475569] bg-[#E2E8F0] hover:bg-[#CBD5E1] transition-colors">
                Đặt cọc ngay
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-12 lg:mt-0 lg:w-[55%] relative">
           <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Phòng ngủ" className="w-full h-[460px] object-cover hover:scale-105 transition-transform duration-700" />
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl flex items-center gap-4 shadow-xl">
                 <div className="bg-[#E4F2ED] text-[#22A06B] p-2.5 rounded-full">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <div>
                    <div className="font-extrabold text-[#1E293B] text-[17px]">500+</div>
                    <div className="text-[13px] font-medium text-[#64748B]">Khách hàng tin dùng</div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 -mt-6 relative z-10 w-full hidden lg:block">
        <div className="bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-5 py-4 flex items-center gap-3 w-full backdrop-blur-lg border border-white/50">
          
          <div className="flex-1 min-w-0 border-r border-slate-100 px-3">
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Loại thuê</label>
            <div className="relative">
              <select className="block w-full outline-none bg-transparent text-[#0F172A] font-semibold text-[14px] appearance-none cursor-pointer">
                <option>Phòng riêng</option>
                <option>Dorm</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 border-r border-slate-100 px-3">
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Tòa</label>
            <div className="relative">
              <select className="block w-full outline-none bg-transparent text-[#0F172A] font-semibold text-[14px] appearance-none cursor-pointer">
                <option>Tất cả</option>
                <option>Tòa A</option>
                <option>Tòa B</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 border-r border-slate-100 px-3">
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Tầng</label>
            <div className="relative">
              <select className="block w-full outline-none bg-transparent text-[#0F172A] font-semibold text-[14px] appearance-none cursor-pointer">
                <option>Tất cả</option>
                <option>1</option>
                <option>2</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 border-r border-slate-100 px-3">
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Giá từ</label>
            <input type="text" placeholder="VNĐ" className="block w-full outline-none bg-transparent text-[#0F172A] font-semibold text-[14px] placeholder-slate-300" />
          </div>

          <div className="flex-1 min-w-0 border-r border-slate-100 px-3">
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Giới tính</label>
            <div className="relative">
              <select className="block w-full outline-none bg-transparent text-[#0F172A] font-semibold text-[14px] appearance-none cursor-pointer">
                <option>Nam & Nữ</option>
                <option>Nam</option>
                <option>Nữ</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 px-3">
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Trạng thái</label>
            <div className="relative">
              <select className="block w-full outline-none bg-transparent text-[#0F172A] font-semibold text-[14px] appearance-none cursor-pointer">
                <option>Còn chỗ</option>
                <option>Đã đầy</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="ml-2">
            <button className="flex items-center justify-center px-6 py-3.5 shadow-lg bg-[#0052CC] hover:bg-[#0043A6] text-white font-semibold rounded-full transition-colors whitespace-nowrap">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Tìm kiếm
            </button>
          </div>

        </div>
      </section>

      {/* Recommended Rooms Section */}
      <section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 mt-4">
         <div className="flex items-end justify-between mb-10">
            <div>
               <p className="text-[12px] font-extrabold text-[#0052CC] uppercase tracking-widest mb-2">PHÒNG TRỐNG TRONG NHÀ DƯƠNG</p>
               <h2 className="text-[28px] font-extrabold text-[#0F172A]">Lựa chọn chỗ ở phù hợp</h2>
            </div>
            <Link to="/rooms" className="text-[#64748B] hover:text-[#0F172A] text-[14px] font-bold flex items-center group transition-colors hidden sm:flex">
               Xem toàn bộ sơ đồ 
               <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </Link>
         </div>

         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {loading ? (
                <div className="col-span-full py-20 text-center font-bold text-[#64748B]">Đang tải...</div>
             ) : rooms.length === 0 ? (
                <div className="col-span-full py-20 text-center font-bold text-[#64748B]">Không có phòng trọ nào.</div>
             ) : rooms.slice(0, 3).map((room) => (
               <div key={room.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                   <div className="relative h-56 overflow-hidden">
                       <div className="absolute top-4 left-4 z-10 flex gap-2">
                          <span className="bg-white/95 backdrop-blur-md text-[11px] font-bold px-2.5 py-1 rounded-full text-slate-700 shadow-sm">{room.floor?.toUpperCase() || 'TẦNG 1'}</span>
                          <span className="bg-[#22A06B] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">{room.status}</span>
                       </div>
                       <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   </div>
                   <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                          <div>
                              <h3 className="text-[18px] font-bold text-[#0F172A] leading-tight line-clamp-1">{room.name}</h3>
                              <p className="text-[#64748B] text-[13px] mt-1 font-medium">{room.building}</p>
                          </div>
                          <div className="text-right shrink-0 pl-3">
                             <div className="text-[18px] font-extrabold text-[#0052CC]">{room.price}</div>
                             <div className="text-[11px] font-semibold text-[#94A3B8] uppercase">mỗi tháng</div>
                          </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-5 text-[13px] text-[#475569] font-medium border-t border-slate-100 pt-5">
                          {room.amenities && room.amenities.slice(0, 2).map((am, i) => (
                             <div key={i} className="flex items-center gap-1.5 bg-[#F8F9FA] px-2.5 py-1.5 rounded-lg whitespace-nowrap">
                                <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                {am}
                             </div>
                          ))}
                      </div>
                      <div className="mt-6 flex gap-3">
                          <button className="flex-1 bg-[#0A192F] text-white py-3 rounded-xl font-bold text-[14px] hover:bg-[#112240] transition-colors shadow-md">Đặt cọc ngay</button>
                          <Link to={`/rooms/${room.id}`} className="bg-[#F1F5F9] text-[#64748B] p-3 rounded-xl hover:bg-[#E2E8F0] transition-colors flex items-center justify-center">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </Link>
                      </div>
                   </div>
               </div>
             ))}
         </div>
      </section>

      {/* Tiện ích đặc quyền */}
      <section className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center mb-12">
              <h2 className="text-[28px] font-extrabold text-[#0F172A] mb-3">Tiện ích đặc quyền</h2>
              <p className="text-[#64748B] text-[15px]">Chúng tôi cung cấp hệ sinh thái tiện ích đầy đủ để bạn chỉ việc xách vali đến và ở.</p>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-2">
              <div className="relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] h-[400px]">
                  <img src="https://images.unsplash.com/photo-1558227099-282d8c36531c?auto=format&fit=crop&w=1200&q=80" alt="Không gian chung" className="w-full h-full object-cover brightness-50" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                      <div className="bg-white/20 backdrop-blur w-12 h-12 flex items-center justify-center rounded-xl mb-5 border border-white/10">
                         <svg className="w-6 h-6 text-white" fill="currentColor" stroke="none" viewBox="0 0 24 24"><path d="M12 2C8 2 4.5 4 4.5 4l-.5.5c0 1.5.5 4 3 6-2.5 2-3 4.5-3 6l.5.5s3.5 2 7.5 2 7.5-2 7.5-2l.5-.5c0-1.5-.5-4-3-6 2.5-2 3-4.5 3-6l-.5-.5S16 2 12 2zm0 18c-2.5 0-5.5-1-6.5-1 0-.5.5-2.5 2.5-4C8.5 14 10 14.5 12 14.5s3.5-.5 4-1.5c2 1.5 2.5 3.5 2.5 4-1 0-4 1-6.5 1z" /></svg>
                      </div>
                      <h3 className="text-[22px] font-bold mb-3 text-white">Không gian cộng đồng</h3>
                      <p className="text-slate-300 text-[14px] leading-relaxed max-w-md">Khu vực sinh hoạt chung hiện đại, nơi kết nối những người bạn mới và thư giãn sau giờ học tập.</p>
                  </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                 <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col items-center justify-center text-center">
                    <svg className="w-10 h-10 text-[#0052CC] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
                    <h4 className="font-bold text-[#0F172A] text-[16px]">Wifi Tốc độ cao</h4>
                 </div>
                 <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col items-center justify-center text-center">
                    <svg className="w-10 h-10 text-[#22A06B] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <h4 className="font-bold text-[#0F172A] text-[16px]">An ninh 24/7</h4>
                 </div>
                 <div className="sm:col-span-2 bg-[#E2E8F0] rounded-3xl p-8 flex items-center justify-start gap-6 border border-slate-200/60 shadow-inner">
                    <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                       <svg className="w-8 h-8 text-[#0F172A]" fill="currentColor" stroke="none" viewBox="0 0 24 24"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-7 14c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm4.5-9H12V7h4.5v2z" /><circle cx="12" cy="13" r="3"/></svg>
                    </div>
                    <div>
                       <h4 className="font-bold text-[#0F172A] text-[16px] mb-1">Giặt sấy thông minh</h4>
                       <p className="text-[#64748B] text-[14px]">Hệ thống máy giặt sấy hiện đại, sạch sẽ và thuận tiện sử dụng qua app.</p>
                    </div>
                 </div>
              </div>
          </div>
      </section>

      {/* Testimonials & FAQ */}
      <section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 mt-4 grid gap-12 lg:grid-cols-2">
         <div>
             <h2 className="text-[24px] font-extrabold text-[#0F172A] mb-8">Cảm nhận từ cư dân</h2>
             <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 relative">
                 <svg className="w-10 h-10 text-slate-100 absolute top-6 left-6" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true"><path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" /></svg>
                 <p className="text-[15px] italic text-[#64748B] leading-relaxed relative z-10 pl-14 pt-2">
                    "Môi trường ở đây rất tốt, sạch sẽ và an ninh. Tôi cảm thấy rất yên tâm khi cho con gái mình ở tại DormStay trong suốt 4 năm đại học."
                 </p>
                 <div className="flex items-center gap-4 mt-8">
                     <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                     <div>
                         <div className="font-bold text-[#0F172A] text-[15px]">Nguyễn Thu Hà</div>
                         <div className="text-[13px] text-[#94A3B8] font-medium">Sinh viên năm 3, ĐH Ngoại Thương</div>
                     </div>
                 </div>
             </div>
         </div>
         <div>
             <h2 className="text-[24px] font-extrabold text-[#0F172A] mb-8">Câu hỏi thường gặp</h2>
             <div className="flex flex-col gap-1">
                 {[
                   "Quy trình đặt cọc như thế nào?",
                   "Giá phòng đã bao gồm điện nước chưa?",
                   "Có được nấu ăn trong phòng không?"
                 ].map((q, i) => (
                    <div key={i} className="bg-transparent border-b border-slate-200 py-4 flex justify-between items-center cursor-pointer group">
                        <span className="font-bold text-[#475569] group-hover:text-[#0052CC] text-[15px] transition-colors">{q}</span>
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-[#0052CC] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                 ))}
             </div>
         </div>
      </section>

    </div>
  );
}

export default HomePage;
