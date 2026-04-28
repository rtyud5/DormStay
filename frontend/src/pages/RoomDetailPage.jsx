import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import RoomService from "../services/room.service";

function RoomDetailPage() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bedsLoading, setBedsLoading] = useState(false);

  useEffect(() => {
    async function loadRoom() {
      try {
        const res = await RoomService.getRoomDetail(id);
        setRoom(res.data.data);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết phòng:", err);
      } finally {
        setLoading(false);
      }
    }

    async function loadBeds() {
      setBedsLoading(true);
      try {
        const res = await RoomService.getRoomBeds(id);
        setBeds(res.data.data || []);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách giường:", err);
      } finally {
        setBedsLoading(false);
      }
    }

    loadRoom();
    loadBeds();
  }, [id]);

  if (loading) {
     return <div className="py-32 text-center text-[#64748B] font-bold text-xl">Đang tải chi tiết phòng...</div>;
  }

  if (!room) {
     return (
        <div className="py-32 text-center">
           <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Không tìm thấy phòng</h2>
           <Link to="/rooms" className="text-[#0052CC] hover:underline">Quay lại danh sách</Link>
        </div>
     );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans pb-24">
       {/* Breadcrumb */}
       <nav className="flex text-[12px] text-[#64748B] font-medium mb-8">
          <Link to="/" className="hover:text-[#0052CC] transition-colors">Trang chủ</Link>
          <span className="mx-2">›</span>
          <Link to="/rooms" className="hover:text-[#0052CC] transition-colors">Danh sách phòng</Link>
          <span className="mx-2">›</span>
          <span className="text-[#0F172A] font-bold">{room.name} - {room.floor} - {room.building}</span>
       </nav>

       <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
          {/* Lết Column - Gallery & Info */}
          <div>
             {/* Gallery */}
             <div className="mb-10">
                <div className="relative rounded-[32px] overflow-hidden bg-slate-100 h-[400px] md:h-[500px] mb-4 group cursor-pointer">
                   <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute top-6 left-6">
                      <span className="bg-[#0A192F] text-white px-4 py-2 rounded-full text-[11px] font-extrabold tracking-widest uppercase shadow-md">
                         {room.type === 'PHONG_STUDIO' ? 'PHÒNG STUDIO' : 'PHÒNG CHUNG'}
                      </span>
                   </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                   {room.gallery && room.gallery.slice(0, 4).map((imgUrl, idx) => (
                       <div key={idx} className={`h-24 md:h-32 rounded-2xl overflow-hidden cursor-pointer relative group border-2 ${idx === 0 ? 'border-[#0052CC]' : 'border-transparent hover:border-[#CBD5E1]'} transition-colors`}>
                           <img src={imgUrl} alt="Thumb" className="w-full h-full object-cover" />
                           {idx === 3 && room.gallery.length > 4 && (
                              <div className="absolute inset-0 bg-[#0F172A]/70 flex items-center justify-center text-white font-extrabold text-[15px] group-hover:bg-[#0F172A]/80 transition-colors">
                                 +{room.gallery.length - 4} Ảnh
                              </div>
                           )}
                       </div>
                   ))}
                </div>
             </div>

             {/* Mô tả chi tiết */}
             <div className="mb-12">
                <h2 className="text-[24px] font-extrabold text-[#0F172A] mb-6">Mô tả chi tiết</h2>
                <div className="text-[#475569] text-[15px] leading-relaxed space-y-4 font-medium">
                   <p>{room.name} tại DormStay mang đến không gian lưu trú an ninh và sự tiện nghi vượt trội. Trang bị hệ thống nội thất hiện đại, tối ưu hóa công năng sử dụng để bạn luôn cảm thấy thoải mái.</p>
                   <p>Trải nghiệm dịch vụ chuyên nghiệp, cộng đồng nội trú văn minh tại hệ thống DormStay.</p>
                </div>
             </div>

             {/* Tiện ích đặc quyền */}
             {room.amenities && room.amenities.length > 0 && (
                <div className="mb-12">
                   <h2 className="text-[24px] font-extrabold text-[#0F172A] mb-6">Tiện ích bao gồm</h2>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {room.amenities.map((am, i) => (
                         <div key={i} className="bg-[#F8F9FA] rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3 border border-slate-100/50 hover:-translate-y-1 transition-transform">
                            <div className="text-[#0052CC]">
                               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span className="text-[13px] font-bold text-[#0F172A]">{am}</span>
                         </div>
                      ))}
                   </div>
                </div>
             )}

            {beds && beds.length > 0 && (
            <div className="mb-12">
               <h2 className="text-[24px] font-extrabold text-[#0F172A] mb-6">Danh sách giường</h2>
               {bedsLoading ? (
                  <div className="text-center py-8 text-[#64748B]">Đang tải danh sách giường...</div>
               ) : (
                  <div className="grid gap-4">
                  {beds.map((bed) => {
                     // 1. Tạo object map để dịch status
                     const statusTextMap = {
                        DA_THUE: 'Đã thuê',
                        CON_TRONG: 'Còn trống',
                        DANG_GIU : 'Đang giữ chỗ' // Thêm nếu có trạng thái này trong DB
                     };

                     // 2. Lấy text hiển thị (nếu DB trả về mã khác chưa có trong map thì hiển thị mã gốc)
                     const displayStatus = statusTextMap[bed.status] || bed.status;

                     return (
                        // 3. Sửa lại toàn bộ điều kiện CSS: check với 'DA_THUE' thay vì 'Đã thuê'
                        <div key={bed.id} className={`bg-[#F8F9FA] rounded-3xl p-6 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${bed.status === 'DA_THUE' ? 'opacity-90' : ''}`}>
                        <div>
                           <div className={`text-[14px] font-bold mb-1 ${bed.status === 'DA_THUE' || bed.status === 'DANG_GIU' ? ' text-[#94A3B8]' : 'text-[#0F172A]'}`}>
                              {bed.code}
                           </div>
                           <div className={`text-[13px] ${bed.status === 'DA_THUE' || bed.status === 'DANG_GIU' ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                              {bed.label || 'Giường tiêu chuẩn'}
                           </div>
                        </div>
                        <div className="text-right">
                           <div className={`text-[16px] font-extrabold ${bed.status === 'DA_THUE' || bed.status === 'DANG_GIU' ? ' text-[#94A3B8]' : 'text-[#0052CC]'}`}>
                              {bed.price}
                           </div>
                           <div className={`text-[12px] uppercase tracking-wide ${bed.status === 'DA_THUE' || bed.status === 'DANG_GIU' ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
                              {/* 4. Render biến text đã được dịch ra đây */}
                              {displayStatus}
                           </div>
                        </div>
                        </div>
                     );
                  })}
                  </div>
               )}
            </div>
            )}

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
                         <span className="text-[#0F172A] text-[15px] font-bold">2 tháng tiền phòng</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[#64748B] text-[14px] font-medium">Hoàn cọc</span>
                         <span className="text-[#0F172A] text-[15px] font-bold">Sau 3 ngày trả phòng</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Column - Booking Card sticky */}
          <div className="relative w-full">
             <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-slate-50 sticky top-24">
                <div className="flex justify-between items-start mb-2">
                   <h1 className="text-[26px] font-extrabold text-[#0F172A] leading-tight">{room.name}</h1>
                   <span className={`px-3 py-1 ${room.statusColor} text-[11px] font-extrabold tracking-wide uppercase rounded-full`}>{room.status}</span>
                </div>
                <p className="text-[#64748B] text-[13px] font-medium mb-8">{room.floor} | Thuộc: {room.building}</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-slate-100">
                      <div className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider mb-1">GIÁ THUÊ</div>
                      <div className="flex items-baseline gap-1">
                         <span className="text-[20px] font-extrabold text-[#0052CC]">{room.price}</span>
                      </div>
                   </div>
                   <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-slate-100">
                      <div className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider mb-1">ĐẶT CỌC</div>
                      <div className="flex items-baseline gap-1">
                         <span className="text-[20px] font-extrabold text-[#0F172A]">{room.price}</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-4 mb-8 text-[14px]">
                   <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-3 text-[#64748B] font-medium">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                         Giới tính
                      </div>
                      <span className="font-bold text-[#0F172A]">{room.gender}</span>
                   </div>
                   <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-3 text-[#64748B] font-medium">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
                         Sức chứa
                      </div>
                      <span className="font-bold text-[#0052CC]">{room.capacity}</span>
                   </div>
                </div>

                <Link to={`/booking/${room.id}`} className="block text-center w-full bg-[#0A192F] hover:bg-[#112240] text-white py-4 rounded-2xl font-bold text-[15px] transition-colors shadow-lg hover:shadow-xl mb-4">
                   Đặt cọc giữ chỗ ngay
                </Link>

                <div className="flex gap-4 mb-6">
                   <button className="flex-1 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[#0F172A] py-3 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all">
                      Gọi Hotline
                   </button>
                   <button className="flex-1 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[#0F172A] py-3 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all">
                      Zalo Hỗ Trợ
                   </button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

export default RoomDetailPage;
