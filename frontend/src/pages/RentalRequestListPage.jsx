import { Link } from "react-router-dom";

const requests = [
  {
    id: "#REQ-8821",
    statusText: "Đang xử lý",
    statusBadge: "bg-[#E6F0FF] text-[#0052CC]",
    roomName: "Phòng Deluxe - G01",
    date: "24/05/2024",
    amount: "2.000.000đ",
    deadline: "--/--/----",
    actionLink: "#",
    actionLabel: "Xem chi tiết",
    actionStyle: "bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A]",
    hasIcon: true,
  },
  {
    id: "#REQ-8790",
    statusText: "Chờ thanh toán cọc",
    statusBadge: "bg-[#FFF3E0] text-[#E65100]",
    roomName: "Giường đơn - B04 (P.402)",
    date: "20/05/2024",
    amount: "1.500.000đ",
    deadline: "28/05/2024",
    deadlineColor: "text-red-600",
    actionLink: "#",
    actionLabel: "Thanh toán ngay",
    actionStyle: "bg-[#0A192F] hover:bg-[#112240] text-white border border-[#0A192F]",
    iconType: "lightning",
  },
  {
    id: "#REQ-8755",
    statusText: "Chờ duyệt cọc",
    statusBadge: "bg-[#E6F0FF] text-[#0052CC]",
    roomName: "Phòng Studio - S10",
    date: "18/05/2024",
    amount: "3.500.000đ",
    statusColText: "Đã chuyển khoản",
    statusColColor: "text-[#0052CC]",
    actionLink: "#",
    actionLabel: "Xem chứng từ",
    actionStyle: "bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#0F172A]",
    iconType: "document",
  },
  {
    id: "#REQ-8610",
    statusText: "Đã xác nhận",
    statusBadge: "bg-[#E4F2ED] text-[#22A06B]",
    roomName: "Phòng Tiêu chuẩn - N05",
    date: "10/05/2024",
    amount: "1.200.000đ",
    confirmDateText: "Ngày xác nhận",
    confirmDate: "12/05/2024",
    actionLink: "#",
    actionLabel: "Tải hợp đồng",
    actionStyle: "bg-[#E6F0FF] hover:bg-[#DBEAFE] text-[#0052CC]",
    iconType: "download",
  },
  {
    id: "#REQ-8500",
    statusText: "Từ chối",
    statusBadge: "bg-[#FEE2E2] text-[#DC2626]",
    roomName: "Giường tầng - A12 (P.201)",
    date: "05/05/2024",
    rejectionReason: "Lý do: Không đủ điều kiện hồ sơ cư trú.",
    actionLink: "#",
    actionLabel: "Xem chi tiết",
    actionStyle: "bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] text-[#475569]",
  },
  {
    id: "#REQ-8422",
    statusText: "Quá hạn",
    statusBadge: "bg-[#7F1D1D] text-white",
    cardBorder: "border-l-4 border-l-[#DC2626]",
    roomName: "Phòng Studio - S02",
    date: "01/05/2024",
    amount: "3.500.000đ",
    deadlineLabel: "HẾT HẠN VÀO",
    deadline: "10/05/2024",
    deadlineColor: "text-red-600",
    multiAction: true,
  },
];

function RentalRequestListPage() {
  return (
    <div className="w-full font-sans pb-12">
      <div className="mb-10">
         <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-tight mb-2 pt-2">Danh sách Yêu cầu thuê</h1>
         <p className="text-[#64748B] text-[15px] font-medium">Quản lý các yêu cầu đặt phòng và theo dõi tình trạng thanh toán của bạn.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
         <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-[14px] font-bold text-[#0F172A] shadow-sm transition-all">
            Tất cả <span className="bg-[#E2E8F0] text-[#0F172A] text-[11px] px-2 py-0.5 rounded-full">12</span>
         </button>
         <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAFAFA] border border-transparent text-[14px] font-bold text-[#475569] hover:text-[#0F172A] transition-all">
            Chờ thanh toán <span className="bg-[#E6F0FF] text-[#0052CC] text-[11px] px-2 py-0.5 rounded-full font-extrabold">3</span>
         </button>
         <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAFAFA] border border-transparent text-[14px] font-bold text-[#475569] hover:text-[#0F172A] transition-all">
            Đã xác nhận <span className="bg-[#E4F2ED] text-[#22A06B] text-[11px] px-2 py-0.5 rounded-full font-extrabold">8</span>
         </button>
      </div>

      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
         {requests.map((req, i) => (
            <div key={i} className={`bg-white rounded-[24px] p-6 shadow-[0_4px_25px_rgb(0,0,0,0.03)] border border-slate-50 relative overflow-hidden flex flex-col ${req.cardBorder || ''}`}>
               <div className="flex justify-between items-center mb-6">
                  <div className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide flex items-center gap-1.5 ${req.statusBadge}`}>
                     {req.statusText === 'Quá hạn' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                     {req.statusText === 'Đã xác nhận' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                     {req.statusText === 'Từ chối' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/></svg>}
                     {req.statusText}
                  </div>
                  <div className="text-[12px] font-bold text-[#94A3B8]">{req.id}</div>
               </div>

               <div className="mb-8 flex-1">
                  <h3 className="text-[20px] font-extrabold text-[#0F172A] mb-2 leading-snug">{req.roomName}</h3>
                  <div className="flex items-center gap-2 text-[#64748B] text-[13px] font-medium">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     Gửi ngày: {req.date}
                  </div>
               </div>

               {req.rejectionReason ? (
                  <div className="flex-1 mt-auto shrink-0 min-h-[48px]">
                     <p className="text-[13px] text-red-500 font-medium italic">{req.rejectionReason}</p>
                  </div>
               ) : (
                  <div className="flex justify-between items-end mb-6 mt-auto">
                     <div>
                        <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1">SỐ TIỀN CỌC</div>
                        <div className="text-[18px] font-extrabold text-[#0F172A] leading-none">{req.amount}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1">{req.deadlineLabel || req.confirmDateText || 'HẠN THANH TOÁN'}</div>
                        <div className={`text-[14px] font-extrabold leading-none ${req.deadlineColor || req.statusColColor || 'text-[#0F172A]'}`}>
                           {req.deadline || req.statusColText || req.confirmDate}
                        </div>
                     </div>
                  </div>
               )}

               {req.multiAction ? (
                  <div className="flex gap-3">
                     <button className="flex-1 py-3 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] font-bold text-[14px] hover:border-[#CBD5E1] transition-all">Gia hạn</button>
                     <button className="flex-1 py-3 rounded-xl bg-[#E2E8F0] font-bold text-[14px] text-[#475569] hover:bg-[#CBD5E1] transition-all">Xóa yêu cầu</button>
                  </div>
               ) : (
                  <Link to={req.actionLink} className="block w-full">
                     <button className={`w-full py-3.5 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all ${req.actionStyle}`}>
                        {req.actionLabel}
                        {req.iconType === 'lightning' && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7v7l9-11h-7V3z"/></svg>}
                        {req.iconType === 'document' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                        {req.iconType === 'download' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                        {!req.iconType && req.hasIcon && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                     </button>
                  </Link>
               )}
            </div>
         ))}
      </div>
    </div>
  );
}

export default RentalRequestListPage;
