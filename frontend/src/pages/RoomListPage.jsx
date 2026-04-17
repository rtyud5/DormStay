import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RoomService from "../services/room.service";

function RoomListPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [buildings, setBuildings] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    building: '',
    floor: 'Tất cả các tầng',
    type: '',
    minPrice: 1000000,
    maxPrice: 10000000,
    gender: 'Tất cả',
    status: [],
    sort: 'price_asc',
    isPriceFilterTouched: false
  });

  // Fetch buildings on mount
  useEffect(() => {
    async function fetchBuildings() {
      try {
        const res = await RoomService.getBuildings();
        setBuildings(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (err) {
        console.error("Failed to fetch buildings:", err);
      }
    }
    fetchBuildings();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage
      };
      if (filters.search) params.search = filters.search;
      if (filters.building) params.building = filters.building;
      if (filters.floor !== 'Tất cả các tầng') params.floor = filters.floor;
      if (filters.type) params.type = filters.type;
      if (filters.isPriceFilterTouched) {
        params.minPrice = filters.minPrice;
        params.maxPrice = filters.maxPrice;
      }
      if (filters.gender !== 'Tất cả') params.gender = filters.gender;
      if (filters.status.length > 0) params.status = filters.status;
      if (filters.sort) params.sort = filters.sort;

      const res = await RoomService.getRooms(params);
      console.log('API Response:', res.data);
      const roomData = res.data.data;
      setRooms(Array.isArray(roomData.data) ? roomData.data : []);
      setTotal(roomData.total || 0);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách phòng:", err);
    } finally {
      setLoading(false);
    }
  };
  // Hàm xử lý kéo thanh trượt
const handleSliderChange = (e, type) => {
  const value = parseFloat(e.target.value) * 1000000;
  if (type === 'min') {
    const newMin = Math.min(value, filters.maxPrice - 100000);
    setFilters({ ...filters, minPrice: newMin, isPriceFilterTouched: true });
  } else {
    const newMax = Math.max(value, filters.minPrice + 100000);
    setFilters({ ...filters, maxPrice: newMax, isPriceFilterTouched: true });
  }
};

  useEffect(() => {
    loadRooms();
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    loadRooms();
  }, [filters]);

  const totalPages = Math.ceil(total / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

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
               <button 
                  className="text-[12px] font-bold text-[#64748B] hover:text-[#0052CC] transition-colors"
                  onClick={() => setFilters({
                     search: '',
                     building: '',
                     floor: 'Tất cả các tầng',
                     type: '',
                     minPrice: 1000000,
                     maxPrice: 10000000,
                     gender: 'Tất cả',
                     status: [],
                     sort: 'price_asc',
                     isPriceFilterTouched: false
                  })}
               >
                  Xóa tất cả
               </button>
            </div>

            <div className="space-y-8">
               {/* Tìm kiếm */}
               <div>
                  <h3 className="text-[12px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">TÌM KIẾM</h3>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                     </div>
                     <input 
                        type="text" 
                        placeholder="Số phòng, mã giường..." 
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                        className="w-full bg-[#F1F5F9] text-[#0F172A] text-[13px] font-medium pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all placeholder:font-medium placeholder:text-[#94A3B8]" 
                     />
                  </div>
               </div>

               {/* Tòa nhà */}
               <div>
                  <h3 className="text-[12px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">TÒA NHÀ</h3>
                  <select 
                     value={filters.building}
                     onChange={(e) => setFilters({...filters, building: e.target.value})}
                     className="w-full bg-[#F1F5F9] text-[#0F172A] text-[13px] font-medium px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all appearance-none cursor-pointer"
                  >
                     <option value="">Tất cả tòa</option>
                     {buildings.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                     ))}
                  </select>
               </div>

               {/* Tầng */}
               <div>
                  <h3 className="text-[12px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">TẦNG</h3>
                  <select 
                     value={filters.floor}
                     onChange={(e) => setFilters({...filters, floor: e.target.value})}
                     className="w-full bg-[#F1F5F9] text-[#0F172A] text-[13px] font-medium px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all appearance-none cursor-pointer"
                  >
                     <option>Tất cả các tầng</option>
                     <option>Tầng 1</option>
                     <option>Tầng 2</option>
                     <option>Tầng 3</option>
                     <option>Tầng 4</option>
                  </select>
               </div>

               {/* Loại hình */}
               <div>
                  <h3 className="text-[12px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">LOẠI HÌNH</h3>
                  <div className="space-y-3">
                     <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setFilters({...filters, type: filters.type === 'PHONG_RIENG' ? '' : 'PHONG_RIENG'})}>
                        <div className={`w-5 h-5 rounded-full border-2 border-[#0052CC] bg-white flex items-center justify-center p-0.5 ${filters.type === 'PHONG_RIENG' ? '' : 'border-[#CBD5E1]'}`}>
                           <div className={`w-full h-full bg-[#0052CC] rounded-full ${filters.type === 'PHONG_RIENG' ? '' : 'bg-transparent'}`}></div>
                        </div>
                        <span className="text-[14px] font-medium text-[#0F172A] group-hover:text-[#0052CC] transition-colors">Phòng trọn gói / Studio</span>
                     </label>
                     <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setFilters({...filters, type: filters.type === 'PHONG_CHUNG' ? '' : 'PHONG_CHUNG'})}>
                        <div className={`w-5 h-5 rounded-full border-2 border-[#0052CC] bg-white flex items-center justify-center p-0.5 ${filters.type === 'PHONG_CHUNG' ? '' : 'border-[#CBD5E1]'}`}>
                           <div className={`w-full h-full bg-[#0052CC] rounded-full ${filters.type === 'PHONG_CHUNG' ? '' : 'bg-transparent'}`}></div>
                        </div>
                        <span className="text-[14px] font-medium text-[#0F172A] group-hover:text-[#0052CC] transition-colors">Giường đơn (Dorm)</span>
                     </label>
                  </div>
               </div>

               {/* Khoảng giá */}
               <div className="relative">
               <h3 className="text-[12px] font-extrabold text-[#64748B] uppercase tracking-wider mb-4">
                  KHOẢNG GIÁ (TRIỆU VNĐ)
               </h3>

               {/* Ô nhập số - Grid 2 cột */}
               <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="relative">
                     <input 
                     type="number" 
                     step="0.1"
                     // Vẫn giữ hiển thị số 0 khi giá trị là 0
                     value={filters.minPrice / 1000000}
                     onChange={(e) => {
                        const val = e.target.value;
                        // Loại bỏ số 0 ở đầu bằng cách ép kiểu số rồi mới cập nhật state
                        const numVal = val === "" ? 0 : parseFloat(val);
                        setFilters({
                           ...filters, 
                           minPrice: numVal * 1000000, 
                           isPriceFilterTouched: true
                        });
                     }}
                     // MẸO QUAN TRỌNG: Khi nhấn vào ô, tự động bôi đen số 0 
                     // để khi người dùng gõ số mới, nó sẽ ghi đè lên số 0 ngay lập tức
                     onFocus={(e) => e.target.select()}
                     className="w-full min-w-0 bg-[#F1F5F9] text-[#0F172A] text-[13px] font-bold px-3 py-2.5 rounded-xl outline-none border border-transparent focus:border-[#0052CC]/20"
                     />
                  </div>
                  
                  <div className="relative">
                     <input 
                     type="number" 
                     step="0.1"
                     value={filters.maxPrice / 1000000}
                     onChange={(e) => {
                        const val = e.target.value;
                        const numVal = val === "" ? 0 : parseFloat(val);
                        setFilters({
                           ...filters, 
                           maxPrice: numVal * 1000000, 
                           isPriceFilterTouched: true
                        });
                     }}
                     // Áp dụng tương tự cho ô Max
                     onFocus={(e) => e.target.select()}
                     className="w-full min-w-0 bg-[#F1F5F9] text-[#0F172A] text-[13px] font-bold px-3 py-2.5 rounded-xl outline-none border border-transparent focus:border-[#0052CC]/20"
                     />
                  </div>
               </div>

               {/* Thanh Slider Kéo được - Giữ nguyên logic cũ của bạn */}
               <div className="relative h-6 flex items-center px-1">
                  <div className="absolute left-0 right-0 h-1.5 bg-[#E2E8F0] rounded-full"></div>
                  <div 
                     className="absolute h-1.5 bg-[#0052CC] rounded-full z-10"
                     style={{ 
                     left: `${Math.min((filters.minPrice / 20000000) * 100, 100)}%`, 
                     right: `${Math.max(100 - (filters.maxPrice / 20000000) * 100, 0)}%` 
                     }}
                  ></div>

                  <input
                     type="range"
                     min="0"
                     max="20"
                     step="0.1"
                     value={Math.min(filters.minPrice / 1000000, 20)}
                     onChange={(e) => handleSliderChange(e, 'min')}
                     className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none z-20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0052CC] [&::-webkit-slider-thumb]:shadow-md"
                  />
                  <input
                     type="range"
                     min="0"
                     max="20"
                     step="0.1"
                     value={Math.min(filters.maxPrice / 1000000, 20)}
                     onChange={(e) => handleSliderChange(e, 'max')}
                     className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none z-20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0052CC] [&::-webkit-slider-thumb]:shadow-md"
                  />
               </div>

               <div className="flex justify-between text-[11px] font-bold text-[#94A3B8] mt-2">
                  <span>0tr</span>
                  <span>20tr+</span>
               </div>
               </div>
               {/* Giới tính */}
               <div>
                  <h3 className="text-[12px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">GIỚI TÍNH</h3>
                  <div className="flex gap-2">
                     <button 
                        className={`flex-1 py-2 rounded-full text-[13px] font-bold shadow-sm transition-colors ${filters.gender === 'Tất cả' ? 'bg-[#0F172A] text-white' : 'bg-white border border-slate-200 text-[#475569] hover:border-[#0F172A] hover:text-[#0F172A]'}`}
                        onClick={() => setFilters({...filters, gender: 'Tất cả'})}
                     >
                        Tất cả
                     </button>
                     <button 
                        className={`flex-1 py-2 rounded-full text-[13px] font-bold transition-colors ${filters.gender === 'Nam' ? 'bg-[#0F172A] text-white' : 'bg-white border border-slate-200 text-[#475569] hover:border-[#0F172A] hover:text-[#0F172A]'}`}
                        onClick={() => setFilters({...filters, gender: 'Nam'})}
                     >
                        Nam
                     </button>
                     <button 
                        className={`flex-1 py-2 rounded-full text-[13px] font-bold transition-colors ${filters.gender === 'Nữ' ? 'bg-[#0F172A] text-white' : 'bg-white border border-slate-200 text-[#475569] hover:border-[#0F172A] hover:text-[#0F172A]'}`}
                        onClick={() => setFilters({...filters, gender: 'Nữ'})}
                     >
                        Nữ
                     </button>
                  </div>
               </div>

               {/* Trạng thái */}
               <div>
                  <h3 className="text-[12px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">TRẠNG THÁI</h3>
                  <div className="space-y-3">
                     <label className="flex items-center gap-3 cursor-pointer group" onClick={() => {
                        const newStatus = filters.status.includes('CON_TRONG') 
                           ? filters.status.filter(s => s !== 'CON_TRONG')
                           : [...filters.status, 'CON_TRONG'];
                        setFilters({...filters, status: newStatus});
                     }}>
                        <div className={`w-5 h-5 rounded-full border-2 border-[#0F172A] bg-white flex items-center justify-center p-0.5 ${filters.status.includes('CON_TRONG') ? '' : 'border-[#CBD5E1]'}`}>
                           <div className={`w-full h-full bg-[#0F172A] rounded-full ${filters.status.includes('CON_TRONG') ? '' : 'bg-transparent'}`}></div>
                        </div>
                        <span className="text-[14px] font-medium text-[#0F172A] transition-colors">Còn trống</span>
                     </label>

                     <label className="flex items-center gap-3 cursor-pointer group" onClick={() => {
                        const newStatus = filters.status.includes('SAP_DAY') 
                           ? filters.status.filter(s => s !== 'SAP_DAY')
                           : [...filters.status, 'SAP_DAY'];
                        setFilters({...filters, status: newStatus});
                     }}>
                        <div className={`w-5 h-5 rounded-full border-2 border-[#CBD5E1] bg-white flex items-center justify-center p-0.5 ${filters.status.includes('SAP_DAY') ? 'border-[#0F172A]' : ''}`}>
                           <div className={`w-full h-full bg-[#0F172A] rounded-full ${filters.status.includes('SAP_DAY') ? '' : 'bg-transparent'}`}></div>
                        </div>
                        <span className="text-[14px] font-medium text-[#475569] group-hover:text-[#0F172A] transition-colors">Sắp đầy</span>
                     </label>

                     <label className="flex items-center gap-3 cursor-pointer group" onClick={() => {
                        const newStatus = filters.status.includes('DA_DAY') 
                           ? filters.status.filter(s => s !== 'DA_DAY')
                           : [...filters.status, 'DA_DAY'];
                        setFilters({...filters, status: newStatus});
                     }}>
                        <div className={`w-5 h-5 rounded-full border-2 border-[#CBD5E1] bg-white flex items-center justify-center p-0.5 ${filters.status.includes('DA_DAY') ? 'border-[#0F172A]' : ''}`}>
                           <div className={`w-full h-full bg-[#0F172A] rounded-full ${filters.status.includes('DA_DAY') ? '' : 'bg-transparent'}`}></div>
                        </div>
                        <span className="text-[14px] font-medium text-[#475569] group-hover:text-[#0F172A] transition-colors">Đã đầy</span>
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
                  Hiển thị <strong className="text-[#0F172A] font-extrabold">{rooms.length}</strong> phòng phù hợp
               </div>
               <div className="hidden sm:flex items-center gap-3">
                  <span className="text-[13px] font-bold text-[#64748B]">Sắp xếp:</span>
                  <select 
                     value={filters.sort}
                     onChange={(e) => setFilters({...filters, sort: e.target.value})}
                     className="bg-transparent text-[14px] font-bold text-[#0F172A] outline-none cursor-pointer"
                  >
                     <option value="price_asc">Giá thấp nhất</option>
                     <option value="price_desc">Giá cao nhất</option>
                     <option value="newest">Mới nhất</option>
                  </select>
               </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-6">
               {loading ? (
                  <div className="col-span-full py-10 text-center text-[#64748B] font-bold">Đang tải danh sách phòng...</div>
               ) : rooms.length === 0 ? (
                  <div className="col-span-full py-10 text-center text-[#64748B] font-bold">Không tìm thấy phòng nào phù hợp!</div>
               ) : rooms.map((room) => (
                  <div key={room.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group flex flex-col">
                     <Link to={`/rooms/${room.id}`} className="relative h-[200px] overflow-hidden block">
                        <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                           <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${room.statusColor}`}>
                              {room.status}
                           </span>
                           <span className="px-3 py-1 bg-white/90 backdrop-blur text-[#0052CC] rounded-full text-[10px] font-extrabold tracking-wide shadow-sm uppercase">
                              {room.gender}
                           </span>
                        </div>
                     </Link>
                     <div className="p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-4">
                           <h3 className="text-[18px] font-extrabold text-[#0F172A] hover:text-[#0052CC] cursor-pointer transition-colors block leading-tight">{room.name}</h3>
                           <div className="text-right">
                              <div className="text-[18px] font-extrabold text-[#0052CC] leading-none">{room.price}</div>
                              <div className="text-[11px] text-[#64748B] font-medium">{room.unit}</div>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-[13px] font-semibold text-[#475569] mb-4">
                           {room.type !== 'PHONG_CHUNG' && (
                              <div className="flex items-center gap-1.5 bg-[#F8F9FA] px-2.5 py-1.5 rounded-lg border border-slate-100 whitespace-nowrap">
                                 <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                 {room.capacity}
                              </div>
                           )}
                           {room.bedCount > 0 && (
                              <div className="flex items-center gap-1.5 bg-[#F8F9FA] px-2.5 py-1.5 rounded-lg border border-slate-100 whitespace-nowrap">
                                 <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h10" /></svg>
                                 {room.availableBeds}/{room.bedCount} giường trống
                              </div>
                           )}
                           <div className="flex items-center gap-1.5 bg-[#F8F9FA] px-2.5 py-1.5 rounded-lg border border-slate-100 whitespace-nowrap">
                              <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                              {room.floor}
                           </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                           {room.amenities && room.amenities.map(amenity => (
                              <span key={amenity} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[#64748B] text-[11px] font-bold uppercase tracking-wide">
                                 <svg className="w-3.5 h-3.5 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                 {amenity}
                              </span>
                           ))}
                        </div>

                        <div className="border-t border-slate-100 pt-4 flex gap-3">
                           <Link to={`/rooms/${room.id}`} className="flex-1">
                              <button className="w-full bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-slate-50 text-[#0F172A] py-2.5 rounded-xl font-bold text-[14px] transition-all cursor-pointer">Chi tiết</button>
                           </Link>
                           <Link to={`/booking/${room.id}`} className="flex-1">
                              <button className="w-full bg-[#0A192F] hover:bg-[#112240] text-white py-2.5 rounded-xl font-bold text-[14px] transition-all shadow-sm cursor-pointer">Đặt cọc ngay</button>
                           </Link>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            {/* Pagination Component */}
            {totalPages > 1 && (
              <div className="mt-12 mb-4 flex justify-center items-center gap-2">
                <button 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8F9FA] transition-colors disabled:opacity-50" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                
                {pageNumbers.map((page, index) => (
                  page === '...' ? (
                    <span key={index} className="w-10 h-10 flex items-center justify-center text-[#94A3B8] font-bold tracking-widest">...</span>
                  ) : (
                    <button 
                      key={index}
                      className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-[14px] shadow-sm transition-colors ${
                        page === currentPage 
                          ? 'bg-[#0F172A] text-white' 
                          : 'bg-white border border-slate-200 text-[#475569] hover:text-[#0F172A] hover:bg-[#F8F9FA]'
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                ))}
                
                <button 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-[#475569] hover:text-[#0F172A] hover:bg-[#F8F9FA] transition-colors disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}

export default RoomListPage;
