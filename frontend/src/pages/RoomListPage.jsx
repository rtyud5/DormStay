import { Link } from "react-router-dom";

const mockRooms = [
  {
    id: "room-1",
    name: "Phòng P.303",
    price: "2.5tr",
    unit: "/tháng/người",
    status: "SẮP ĐẦY",
    statusColor: "text-orange-600 bg-orange-100",
    gender: "NAM / NỮ",
    capacity: "Còn 1/4 giường",
    floor: "Tầng 3",
    amenities: ["Điều hòa", "Wifi"],
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "room-2",
    name: "Phòng P.301",
    price: "1.8tr",
    unit: "/tháng/người",
    status: "CÒN TRỐNG",
    statusColor: "text-emerald-700 bg-emerald-100",
    gender: "NỮ",
    capacity: "Còn 4/4 giường",
    floor: "Tầng 3",
    amenities: ["Ban công", "Máy giặt"],
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "room-3",
    name: "Phòng P.204",
    price: "2.2tr",
    unit: "/tháng/người",
    status: "CÒN TRỐNG",
    statusColor: "text-emerald-700 bg-emerald-100",
    gender: "NAM",
    capacity: "Còn 2/2 giường",
    floor: "Tầng 2",
    amenities: ["Bàn làm việc"],
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "room-4",
    name: "Phòng P.102 (VIP)",
    price: "4.5tr",
    unit: "/tháng/phòng",
    status: "CÒN TRỐNG",
    statusColor: "text-emerald-700 bg-emerald-100",
    gender: "NAM / NỮ",
    capacity: "Phòng riêng",
    floor: "Tầng 1",
    amenities: ["Tủ lạnh", "WC Riêng"],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
  },
];

function RoomListPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Breadcrumb */}
      <nav className="flex text-[13px] text-[#64748B] font-medium mb-6">
         <Link to="/" className="hover:text-[#0052CC] transition-colors">Trang chủ</Link>
         <span className="mx-2">›</span>
         <span className="text-[#0F172A] font-bold">Tìm phòng & Giường</span>
      </nav>

      {/* Page Header */}
      <div className="mb-10">
         <h1 className="text-[32px] font-extrabold text-[#0F172A] tracking-tight mb-2">Hệ thống phòng trống</h1>
         <p className="text-[#64748B] text-[15px] font-medium">Tìm kiếm và lựa chọn không gian lưu trú lý tưởng với bộ lọc thông minh theo nhu cầu của bạn.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
         
         {/* Filter Sidebar */}
         <aside className="w-full lg:w-[280px] shrink-0 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sticky top-24">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
               <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#0F172A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  <h2 className="font-extrabold text-[16px] text-[#0F172A]">Bộ lọc</h2>
               </div>
               <button className="text-[12px] font-bold text-[#64748B] hover:text-[#0052CC] transition-colors">Xóa tất cả</button>
            </div>

            <div className="space-y-8">
               {/* Tìm kiếm */}
               <div>
                  <h3 className="text-[12px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">TÌM KIẾM</h3>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                     </div>
                     <input type="text" placeholder="Số phòng, mã giường..." className="w-full bg-[#F1F5F9] text-[#0F172A] text-[13px] font-medium pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all placeholder:font-medium placeholder:text-[#94A3B8]" />
                  </div>
               </div>

               {/* Tầng */}
               <div>
                  <h3 className="text-[12px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">TẦNG</h3>
                  <select className="w-full bg-[#F1F5F9] text-[#0F172A] text-[13px] font-medium px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all appearance-none cursor-pointer">
                     <option>Tất cả các tầng</option>
                     <option>Tầng 1</option>
                     <option>Tầng 2</option>
                     <option>Tầng 3</option>
                  </select>
               </div>

               {/* Loại hình */}
               <div>
                  <h3 className="text-[12px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">LOẠI HÌNH</h3>
                  <div className="space-y-3">
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 rounded-full border-2 border-[#0052CC] bg-white flex items-center justify-center p-0.5"><div className="w-full h-full bg-[#0052CC] rounded-full"></div></div>
                        <span className="text-[14px] font-medium text-[#0F172A] group-hover:text-[#0052CC] transition-colors">Phòng trọn gói</span>
                     </label>
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 rounded-full border-2 border-[#0052CC] bg-white flex items-center justify-center p-0.5"><div className="w-full h-full bg-[#0052CC] rounded-full"></div></div>
                        <span className="text-[14px] font-medium text-[#0F172A] group-hover:text-[#0052CC] transition-colors">Giường đơn (Dorm)</span>
                     </label>
                  </div>
               </div>

               {/* Khoảng giá */}
               <div>
                  <h3 className="text-[12px] font-extrabold text-[#64748B] uppercase tracking-wider mb-4">KHOẢNG GIÁ (TRIỆU VNĐ)</h3>
                  <div className="px-1 relative h-6 w-full flex items-center">
                     <div className="absolute w-full h-1 bg-[#E2E8F0] rounded-full"></div>
                     <div className="absolute w-2/3 left-[20%] h-1 bg-[#0052CC] rounded-full"></div>
                     <div className="absolute w-4 h-4 bg-white border-2 border-[#0052CC] rounded-full left-[20%] shadow-sm cursor-grab"></div>
                     <div className="absolute w-4 h-4 bg-white border-2 border-[#0052CC] rounded-full left-[85%] shadow-sm cursor-grab"></div>
                  </div>
                  <div className="flex justify-between text-[12px] font-bold text-[#64748B] mt-2">
                     <span>1tr</span>
                     <span>10tr+</span>
                  </div>
               </div>

               {/* Giới tính */}
               <div>
                  <h3 className="text-[12px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">GIỚI TÍNH</h3>
                  <div className="flex gap-2">
                     <button className="flex-1 bg-[#0F172A] text-white py-2 rounded-full text-[13px] font-bold shadow-sm">Tất cả</button>
                     <button className="flex-1 bg-white border border-slate-200 text-[#475569] hover:border-[#0F172A] hover:text-[#0F172A] py-2 rounded-full text-[13px] font-bold transition-colors">Nam</button>
                     <button className="flex-1 bg-white border border-slate-200 text-[#475569] hover:border-[#0F172A] hover:text-[#0F172A] py-2 rounded-full text-[13px] font-bold transition-colors">Nữ</button>
                  </div>
               </div>

               {/* Trạng thái */}
               <div>
                  <h3 className="text-[12px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">TRẠNG THÁI</h3>
                  <div className="space-y-3">
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 rounded-full border-2 border-[#0F172A] bg-white flex items-center justify-center p-0.5"><div className="w-full h-full bg-[#0F172A] rounded-full"></div></div>
                        <span className="text-[14px] font-medium text-[#0F172A] group-hover:text-[#0F172A] transition-colors">Còn trống</span>
                     </label>
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 rounded-full border-2 border-[#CBD5E1] bg-white flex items-center justify-center"></div>
                        <span className="text-[14px] font-medium text-[#475569] group-hover:text-[#0F172A] transition-colors">Sắp đầy</span>
                     </label>
                  </div>
               </div>
            </div>
         </aside>

         {/* Results Area */}
         <div className="flex-1">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
               <div className="text-[14px] text-[#475569] font-medium text-center sm:text-left w-full sm:w-auto">
                  Hiển thị <strong className="text-[#0F172A] font-extrabold">12</strong> phòng phù hợp
               </div>
               <div className="hidden sm:flex items-center gap-3">
                  <span className="text-[13px] font-bold text-[#64748B]">Sắp xếp:</span>
                  <select className="bg-transparent text-[14px] font-bold text-[#0F172A] outline-none cursor-pointer">
                     <option>Giá thấp nhất</option>
                     <option>Giá cao nhất</option>
                     <option>Mới nhất</option>
                  </select>
               </div>
            </div>

            {/* Room Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-6">
               {mockRooms.map((room) => (
                  <div key={room.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group flex flex-col">
                     <div className="relative h-[200px] overflow-hidden">
                        <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                           <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${room.statusColor}`}>
                              {room.status}
                           </span>
                           <span className="px-3 py-1 bg-white/90 backdrop-blur text-[#0052CC] rounded-full text-[10px] font-extrabold tracking-wide shadow-sm uppercase">
                              {room.gender}
                           </span>
                        </div>
                     </div>
                     <div className="p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-4">
                           <h3 className="text-[18px] font-extrabold text-[#0F172A] hover:text-[#0052CC] cursor-pointer transition-colors block leading-tight">{room.name}</h3>
                           <div className="text-right">
                              <div className="text-[18px] font-extrabold text-[#0052CC] leading-none">{room.price}</div>
                              <div className="text-[11px] text-[#64748B] font-medium">{room.unit}</div>
                           </div>
                        </div>

                        <div className="flex items-center gap-4 text-[13px] font-semibold text-[#475569] mb-4">
                           <div className="flex items-center gap-1.5 bg-[#F8F9FA] px-2.5 py-1.5 rounded-lg border border-slate-100">
                              <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                              {room.capacity}
                           </div>
                           <div className="flex items-center gap-1.5 bg-[#F8F9FA] px-2.5 py-1.5 rounded-lg border border-slate-100">
                              <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                              {room.floor}
                           </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                           {room.amenities.map(amenity => (
                              <span key={amenity} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[#64748B] text-[11px] font-bold uppercase tracking-wide">
                                 <svg className="w-3.5 h-3.5 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                 {amenity}
                              </span>
                           ))}
                        </div>

                        <div className="border-t border-slate-100 pt-4 flex gap-3">
                           <Link to={`/rooms/${room.id}`} className="flex-1">
                              <button className="w-full bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-slate-50 text-[#0F172A] py-2.5 rounded-xl font-bold text-[14px] transition-all">Chi tiết</button>
                           </Link>
                           <Link to={`/rooms/${room.id}`} className="flex-1">
                              <button className="w-full bg-[#0A192F] hover:bg-[#112240] text-white py-2.5 rounded-xl font-bold text-[14px] transition-all shadow-sm">Đặt cọc ngay</button>
                           </Link>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            {/* Pagination Component */}
            <div className="mt-12 mb-4 flex justify-center items-center gap-2">
               <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8F9FA] transition-colors disabled:opacity-50" disabled>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
               </button>
               <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0F172A] text-white font-bold text-[14px] shadow-sm">1</button>
               <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-[#475569] font-bold text-[14px] hover:text-[#0F172A] hover:bg-[#F8F9FA] transition-colors">2</button>
               <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-[#475569] font-bold text-[14px] hover:text-[#0F172A] hover:bg-[#F8F9FA] transition-colors">3</button>
               <span className="w-10 h-10 flex items-center justify-center text-[#94A3B8] font-bold tracking-widest">...</span>
               <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-[#475569] hover:text-[#0F172A] hover:bg-[#F8F9FA] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

export default RoomListPage;
