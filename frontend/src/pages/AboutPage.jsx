import { Link } from "react-router-dom";

function AboutPage() {
  return (
    <div className="w-full flex flex-col font-sans bg-[#F8F9FA]">
       {/* Hero Section */}
       <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center text-center px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
             <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=2000&q=80" alt="Dorm background" className="w-full h-full object-cover opacity-30" />
             <div className="absolute inset-0 bg-gradient-to-b from-[#F8F9FA]/80 via-transparent to-[#F8F9FA]"></div>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto mt-10">
             <h1 className="text-[48px] md:text-[56px] font-extrabold text-[#0A192F] tracking-tight leading-tight mb-6">
                Nâng tầm trải nghiệm lưu trú
             </h1>
             <p className="text-[16px] md:text-[18px] text-[#475569] leading-relaxed max-w-2xl mx-auto font-medium">
                DormStay không chỉ là nơi ở, mà là cộng đồng văn minh, hiện đại dành cho thế hệ tri thức mới.
             </p>
          </div>
       </section>

       {/* Về chúng tôi */}
       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
             <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 bg-[#E6F0FF] text-[#0052CC] px-3.5 py-1.5 rounded-full text-[12px] font-extrabold tracking-wider uppercase mb-6">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                   VỀ CHÚNG TÔI
                </div>
                <h2 className="text-[36px] font-extrabold text-[#0F172A] leading-tight mb-6">
                   Đơn vị vận hành chuyên nghiệp hàng đầu
                </h2>
                <p className="text-[#64748B] text-[15px] leading-relaxed mb-10">
                   Được thành lập với tâm huyết kiến tạo không gian sống chất lượng cho sinh viên và người đi làm, DormStay tự hào vận hành hệ thống KTX cao cấp với tiêu chuẩn khách sạn 5 sao, tập trung vào sự an toàn, tiện nghi và kết nối.
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                   <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
                      <h3 className="font-extrabold text-[#0F172A] text-[15px] mb-2 uppercase tracking-wide">Tầm nhìn</h3>
                      <p className="text-[#64748B] text-[13px] leading-relaxed">Trở thành chuỗi lưu trú thông minh, có mặt trên toàn quốc, thay đổi định nghĩa về ký túc xá truyền thống.</p>
                   </div>
                   <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
                      <h3 className="font-extrabold text-[#0F172A] text-[15px] mb-2 uppercase tracking-wide">Sứ mệnh</h3>
                      <p className="text-[#64748B] text-[13px] leading-relaxed">Cung cấp giải pháp lưu trú tối ưu, giúp giới trẻ an tâm phát triển sự nghiệp và học tập.</p>
                   </div>
                </div>
             </div>
             <div className="order-1 lg:order-2 relative">
                <div className="relative rounded-[40px] overflow-hidden shadow-2xl">
                   <img src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1000&q=80" alt="Room" className="w-full h-[500px] object-cover" />
                </div>
                <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center border border-slate-50 w-36 h-36">
                   <div className="text-[32px] font-black text-[#0052CC] leading-none mb-1">10+</div>
                   <div className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider text-center">cơ sở<br/>toàn quốc</div>
                </div>
             </div>
          </div>
       </section>

       {/* Cơ sở vật chất */}
       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="mb-12">
             <h2 className="text-[32px] font-extrabold text-[#0F172A] mb-3">Cơ sở vật chất hiện đại</h2>
             <p className="text-[#64748B] text-[15px]">Trang thiết bị cao cấp, không gian sống xanh và tiện nghi</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 h-[600px]">
             {/* Left Tall Image */}
             <div className="relative rounded-[32px] overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80" alt="Khu vực ngủ" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                   <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-[13px] font-bold tracking-wide shadow-sm">Khu vực ngủ</span>
                </div>
             </div>
             
             {/* Right Column Stack */}
             <div className="grid grid-rows-2 gap-6 h-full">
                {/* Top Wide */}
                <div className="relative rounded-[32px] overflow-hidden group">
                   <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" alt="Không gian chung" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/80 via-transparent to-transparent"></div>
                   <div className="absolute bottom-6 left-6">
                      <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-[13px] font-bold tracking-wide shadow-sm">Phòng sinh hoạt</span>
                   </div>
                </div>
                
                {/* Bottom Two */}
                <div className="grid grid-cols-2 gap-6 h-full">
                   <div className="relative rounded-[32px] overflow-hidden group">
                      <img src="https://images.unsplash.com/photo-1556910103-1c02745a8731?auto=format&fit=crop&w=600&q=80" alt="Bếp" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-6">
                         <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-[13px] font-bold tracking-wide shadow-sm">Bếp chung</span>
                      </div>
                   </div>
                   <div className="relative rounded-[32px] overflow-hidden group">
                      <img src="https://images.unsplash.com/photo-1600566753086-00f18efc204b?auto=format&fit=crop&w=600&q=80" alt="Vệ sinh" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-6">
                         <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-[13px] font-bold tracking-wide shadow-sm">Vệ sinh chung</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </section>

       {/* Quy định */}
       <section className="bg-white py-24 w-full border-y border-slate-100 shadow-[0_0_40px_rgba(0,0,0,0.02)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-16">
                <h2 className="text-[32px] font-extrabold text-[#0F172A]">Quy định & Chính sách</h2>
             </div>
             
             <div className="grid lg:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="bg-[#F8F9FA] rounded-[32px] p-8 border border-slate-200/60 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-2 h-full bg-[#1E293B]"></div>
                   <div className="flex items-center gap-4 mb-8 pl-4">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#1E293B] shadow-sm">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <h3 className="font-extrabold text-[18px] text-[#0F172A]">Quy trình thuê</h3>
                   </div>
                   <ul className="space-y-6 pl-4">
                      <li className="flex gap-4">
                         <span className="text-[13px] font-bold text-[#94A3B8] w-6 shrink-0 mt-0.5">01.</span>
                         <span className="text-[#475569] text-[14px] leading-relaxed font-medium">Tham quan phòng trực tiếp hoặc qua 3D Tour.</span>
                      </li>
                      <li className="flex gap-4">
                         <span className="text-[13px] font-bold text-[#94A3B8] w-6 shrink-0 mt-0.5">02.</span>
                         <span className="text-[#475569] text-[14px] leading-relaxed font-medium">Xác nhận thông tin và ký hợp đồng điện tử.</span>
                      </li>
                      <li className="flex gap-4">
                         <span className="text-[13px] font-bold text-[#94A3B8] w-6 shrink-0 mt-0.5">03.</span>
                         <span className="text-[#475569] text-[14px] leading-relaxed font-medium">Thanh toán cọc và nhận bàn giao phòng.</span>
                      </li>
                   </ul>
                </div>

                {/* Card 2 */}
                <div className="bg-[#F8F9FA] rounded-[32px] p-8 border border-slate-200/60 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-2 h-full bg-[#0052CC]"></div>
                   <div className="flex items-center gap-4 mb-8 pl-4">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#0052CC] shadow-sm">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <h3 className="font-extrabold text-[18px] text-[#0F172A]">Chính sách cọc</h3>
                   </div>
                   <ul className="space-y-6 pl-4">
                      <li className="flex gap-3">
                         <div className="w-5 h-5 rounded-full bg-[#E6F0FF] text-[#0052CC] flex items-center justify-center shrink-0 mt-0.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg></div>
                         <span className="text-[#475569] text-[14px] leading-relaxed font-medium">Mức cọc tương đương 01 tháng tiền phòng.</span>
                      </li>
                      <li className="flex gap-3">
                         <div className="w-5 h-5 rounded-full bg-[#E6F0FF] text-[#0052CC] flex items-center justify-center shrink-0 mt-0.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg></div>
                         <span className="text-[#475569] text-[14px] leading-relaxed font-medium">Hoàn trả 100% sau khi kết thúc hợp đồng đúng hạn.</span>
                      </li>
                      <li className="flex gap-3">
                         <div className="w-5 h-5 rounded-full bg-[#E6F0FF] text-[#0052CC] flex items-center justify-center shrink-0 mt-0.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg></div>
                         <span className="text-[#475569] text-[14px] leading-relaxed font-medium">Hỗ trợ chuyển nhượng cọc nếu báo trước 30 ngày.</span>
                      </li>
                   </ul>
                </div>

                {/* Card 3 */}
                <div className="bg-[#F8F9FA] rounded-[32px] p-8 border border-slate-200/60 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-2 h-full bg-[#22A06B]"></div>
                   <div className="flex items-center gap-4 mb-8 pl-4">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#22A06B] shadow-sm">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h3 className="font-extrabold text-[18px] text-[#0F172A]">Nội quy chung</h3>
                   </div>
                   <ul className="space-y-6 pl-4">
                      <li className="flex gap-3">
                         <div className="w-5 h-5 rounded-full bg-[#E4F2ED] text-[#22A06B] flex items-center justify-center shrink-0 mt-0.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg></div>
                         <span className="text-[#475569] text-[14px] leading-relaxed font-medium">Giữ gìn vệ sinh chung và tiết kiệm điện nước.</span>
                      </li>
                      <li className="flex gap-3">
                         <div className="w-5 h-5 rounded-full bg-[#E4F2ED] text-[#22A06B] flex items-center justify-center shrink-0 mt-0.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg></div>
                         <span className="text-[#475569] text-[14px] leading-relaxed font-medium">Giờ yên tĩnh từ 23h00 đến 06h00 sáng hôm sau.</span>
                      </li>
                      <li className="flex gap-3">
                         <div className="w-5 h-5 rounded-full bg-[#E4F2ED] text-[#22A06B] flex items-center justify-center shrink-0 mt-0.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg></div>
                         <span className="text-[#475569] text-[14px] leading-relaxed font-medium">Khách đến chơi cần đăng ký với Ban Quản lý.</span>
                      </li>
                   </ul>
                </div>
             </div>
          </div>
       </section>

       {/* Liên hệ và Bản đồ */}
       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16">
             <div>
                <h2 className="text-[32px] font-extrabold text-[#0F172A] mb-8">Liên hệ với chúng tôi</h2>
                <div className="space-y-8">
                   <div className="flex gap-5">
                      <div className="w-10 h-10 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#1E293B] shrink-0">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <div>
                         <h4 className="font-bold text-[#0F172A] text-[14px] mb-1">Địa chỉ trụ sở</h4>
                         <p className="text-[#64748B] text-[14px] leading-relaxed">123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</p>
                      </div>
                   </div>
                   <div className="flex gap-5">
                      <div className="w-10 h-10 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#1E293B] shrink-0">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      </div>
                      <div>
                         <h4 className="font-bold text-[#0F172A] text-[14px] mb-1">Hotline hỗ trợ</h4>
                         <p className="text-[#64748B] text-[14px] leading-relaxed">1900 6789 (Hỗ trợ 24/7)</p>
                      </div>
                   </div>
                   <div className="flex gap-5">
                      <div className="w-10 h-10 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#1E293B] shrink-0">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                         <h4 className="font-bold text-[#0F172A] text-[14px] mb-1">Email</h4>
                         <p className="text-[#64748B] text-[14px] leading-relaxed">contact@dormstay.vn</p>
                      </div>
                   </div>
                   <div className="flex gap-5">
                      <div className="w-10 h-10 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#1E293B] shrink-0">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                         <h4 className="font-bold text-[#0F172A] text-[14px] mb-1">Giờ làm việc</h4>
                         <p className="text-[#64748B] text-[14px] leading-relaxed">Thứ 2 - Thứ 7: 08:00 - 20:00<br/>Chủ nhật: 09:00 - 17:00</p>
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Map */}
             <div className="h-[400px] w-full bg-[#75A48F] rounded-[40px] overflow-hidden relative shadow-lg">
                <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")'}}></div>
                {/* Simulated Pins */}
                <div className="absolute top-[30%] left-[40%] w-3 h-3 bg-[#F6C042] rounded-full shadow-[0_0_0_4px_rgba(246,192,66,0.3)]"></div>
                <div className="absolute top-[60%] left-[60%] w-3 h-3 bg-[#F6C042] rounded-full shadow-[0_0_0_4px_rgba(246,192,66,0.3)]"></div>
                <div className="absolute top-[40%] left-[70%] w-3 h-3 bg-[#F6C042] rounded-full shadow-[0_0_0_4px_rgba(246,192,66,0.3)]"></div>
                <div className="absolute top-[75%] left-[80%] w-3 h-3 bg-[#F6C042] rounded-full shadow-[0_0_0_4px_rgba(246,192,66,0.3)]"></div>
             </div>
          </div>
       </section>

       {/* Call to action */}
       <section className="px-4 pb-24 mx-auto max-w-5xl w-full">
          <div className="bg-[#0A192F] rounded-[40px] border border-[#1E293B] shadow-2xl p-12 lg:p-16 text-center text-white relative overflow-hidden">
             <div className="absolute inset-0 bg-[#0052CC] opacity-10 filter blur-3xl"></div>
             <div className="relative z-10">
                <h2 className="text-[32px] md:text-[36px] font-extrabold mb-4 leading-tight">Bạn đã sẵn sàng để trở thành một phần của DormStay?</h2>
                <p className="text-[#94A3B8] text-[15px] max-w-xl mx-auto mb-10 leading-relaxed font-medium">Chỉ cần vài thao tác đăng ký lại cơ sở mong muốn, không lo phòng trống nội vi lưu trú mới dành cho bạn.</p>
                <Link to="/rooms">
                   <button className="bg-white text-[#0F172A] hover:bg-slate-50 border border-transparent px-8 py-4 rounded-full font-bold text-[15px] shadow-lg transition-all hover:shadow-xl">
                      Xem phòng trống ngay
                   </button>
                </Link>
             </div>
          </div>
       </section>

    </div>
  );
}

export default AboutPage;
