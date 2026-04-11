import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import RentalRequestService from "../services/rentalRequest.service";
import PaymentService from "../services/payment.service";

function DashboardPage() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [reqRes, payRes] = await Promise.all([
          RentalRequestService.getMyRequests(),
          PaymentService.getList()
        ]);
        setRequests(reqRes.data.data || []);
        setPayments(payRes.data.data || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
     return (
       <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans">
          <div className="w-12 h-12 border-4 border-[#0052CC] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-bold text-[#64748B]">Đang tải dữ liệu của bạn...</p>
       </div>
     );
  }

  const latestRequest = requests.length > 0 ? requests[0] : null;
  const latestPayment = payments.length > 0 ? payments[0] : null;

  const calculateCompletion = (prof) => {
    if (!prof) return 0;
    const fields = [
      'ho_ten', 'email', 'so_dien_thoai', 'dia_chi_thuong_tru', 'avatar_url',
      'ngan_hang_ten', 'ngan_hang_so_tai_khoan', 'ngan_hang_chu_tai_khoan',
      'so_cccd', 'ngay_cap_cccd', 'cccd_mat_truoc_url', 'cccd_mat_sau_url',
      'lien_he_khan_cap_ho_ten', 'lien_he_khan_cap_sdt', 'lien_he_khan_cap_moi_quan_he'
    ];
    const filledFields = fields.filter(f => prof[f] && prof[f] !== "").length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateCompletion(profile);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-[32px] font-extrabold text-[#0F172A] tracking-tight">
            Chào, {profile?.full_name?.split(' ').pop() || "bạn"}!
          </h1>
          <p className="text-[15px] text-[#64748B] font-medium leading-relaxed max-w-xl">
            Chào mừng bạn trở lại. Đây là bản tóm tắt tình trạng cư trú và các giao dịch mới nhất của bạn.
          </p>
        </div>
        <div className="bg-white px-6 py-4 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center gap-6">
           <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1.5">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[13px] font-black text-[#475569] uppercase tracking-tight">Hồ sơ: {profileCompletion}%</span>
              </div>
              <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-[#0052CC] rounded-full transition-all duration-1000" style={{ width: `${profileCompletion}%` }}></div>
              </div>
           </div>
           <Link to="/profile">
             <button className="bg-slate-50 hover:bg-[#0052CC] hover:text-white text-[#0F172A] px-4 py-2 rounded-xl text-[12px] font-black transition-all border border-slate-200 uppercase tracking-tighter shadow-sm">
                Chi tiết
             </button>
           </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        {/* Main Content Area */}
        <div className="space-y-8">
          {/* Latest Request Card */}
          {latestRequest ? (
             <div className="bg-white rounded-[40px] p-8 shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-slate-50 relative overflow-hidden group hover:shadow-[0_12px_50px_rgb(0,0,0,0.06)] transition-all">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[20px] font-black text-[#0F172A] tracking-tight uppercase">Phòng {latestRequest.phong?.ma_phong_hien_thi || 'N/A'}</h2>
                  <span className="bg-[#E0F2FE] text-[#0369A1] px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest">Yêu cầu mới nhất</span>
               </div>

               <div className="grid md:grid-cols-[300px_1fr] gap-10">
                  <div className="rounded-[32px] overflow-hidden aspect-[4/3] relative bg-slate-100 shadow-inner">
                     <img 
                       src={latestRequest.phong?.hinh_anh_bia || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"} 
                       alt="Room" 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>

                  <div className="flex flex-col justify-between py-2">
                     <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                           <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1.5">Ngày gửi yêu cầu</p>
                           <p className="text-[16px] font-extrabold text-[#0F172A]">{new Date(latestRequest.created_at).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1.5">Trạng thái hiện tại</p>
                           <div className={`flex items-center gap-2 ${latestRequest.trang_thai === 'DA_XAC_NHAN' ? 'text-[#22A06B]' : 'text-[#0052CC]'}`}>
                              <div className={`w-2 h-2 rounded-full ${latestRequest.trang_thai === 'DA_XAC_NHAN' ? 'bg-[#22A06B]' : 'bg-[#0052CC]'} animate-pulse`}></div>
                              <span className="text-[14px] font-black uppercase tracking-tighter">{latestRequest.trang_thai}</span>
                           </div>
                        </div>
                     </div>

                     <div className="bg-[#F8FAFC] p-6 rounded-3xl border border-dashed border-slate-200 mb-8">
                        <p className="text-[10px] font-extrabold text-[#64748B] mb-2 uppercase tracking-tight">Số tiền cọc giữ chỗ</p>
                        <p className="text-[24px] text-[#0F172A] font-black">
                          {new Intl.NumberFormat('vi-VN').format(latestRequest.so_tien_dat_coc || 0)}đ
                        </p>
                     </div>

                     <Link to="/deposits" className="flex items-center justify-center gap-2 text-[14px] font-black text-[#0F172A] hover:text-[#0052CC] transition-colors self-end group/btn uppercase tracking-tight">
                       Quản lý danh sách yêu cầu
                       <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                     </Link>
                  </div>
               </div>
             </div>
          ) : (
             <div className="bg-white rounded-[40px] p-16 shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-dashed border-slate-200 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 shadow-inner ring-8 ring-slate-50/50">
                   <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-10V4m0 10V4m0 10h1m-1 4h1m-1 4h1" /></svg>
                </div>
                <h3 className="text-[24px] font-black text-[#0F172A] mb-4 uppercase">Bạn chưa đăng ký phòng nào</h3>
                <p className="text-[16px] text-[#64748B] font-medium max-w-sm mb-10 leading-relaxed">
                  Hãy bắt đầu tìm kiếm bến đỗ mới của bạn bằng cách khám phá danh sách phòng hiện trống tại DormStay.
                </p>
                <Link to="/rooms" className="bg-[#0A192F] text-white px-10 py-5 rounded-2xl font-black text-[15px] hover:bg-[#0052CC] transition-all shadow-lg active:scale-95 uppercase tracking-wide">
                  Tìm phòng ngay
                </Link>
             </div>
          )}

          {/* Recommended section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[20px] font-black text-[#0F172A] tracking-tight uppercase">Gợi ý dành riêng cho bạn</h2>
              <Link to="/rooms" className="text-[13px] font-bold text-[#64748B] hover:text-[#0052CC] transition-colors">Xem tất cả phòng</Link>
            </div>
            
            <div className="bg-[#F8F9FA] rounded-[40px] p-12 border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#0052CC] filter blur-[100px] opacity-10 -mr-20 -mt-20"></div>
               <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl mb-6 relative z-10">
                  <svg className="w-10 h-10 text-[#0052CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               </div>
               <p className="text-[16px] text-[#64748B] font-bold mb-8 max-w-md leading-relaxed relative z-10">
                  Hệ thống AI sẽ đề xuất các phòng dựa trên thói quen tìm kiếm và khu vực mong muốn của bạn.
               </p>
               <Link to="/rooms" className="text-[14px] font-black text-[#0052CC] hover:underline bg-white px-8 py-3 rounded-2xl shadow-md border border-slate-200 relative z-10 transition-transform active:scale-95 uppercase tracking-tight">
                  Sử dụng bộ lọc tìm phòng
               </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          {/* Latest Payment Sidebar Card */}
          {latestPayment ? (
             <div className="bg-[#0A192F] rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#0052CC] rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-all duration-1000"></div>
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 relative z-10">Khoản đóng gần nhất</p>
               <h3 className="text-[32px] font-black mb-10 tracking-tighter relative z-10 leading-none">
                  {new Intl.NumberFormat('vi-VN').format(latestPayment.so_tien || 0)}đ
               </h3>
               <div className="flex items-center gap-3 mb-10 relative z-10 bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${latestPayment.trang_thai === 'DA_XAC_NHAN' ? 'bg-[#22A06B] text-white' : 'bg-[#0052CC] text-white'}`}>
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <span className="text-[13px] font-black text-slate-100 uppercase tracking-tight">{latestPayment.trang_thai}</span>
               </div>
               <button className="w-full bg-white/10 hover:bg-white text-white hover:text-[#0A192F] py-4 rounded-2xl font-black text-[13px] transition-all border border-white/10 relative z-10 uppercase tracking-wide">
                  Chi tiết giao dịch
               </button>
             </div>
          ) : (
             <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-[0_4px_25px_rgb(0,0,0,0.02)] flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6 shadow-inner ring-1 ring-slate-100">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <h4 className="text-[18px] font-black text-[#0F172A] mb-3 uppercase tracking-tight">Chưa có giao dịch</h4>
                <p className="text-[13px] text-[#64748B] font-bold leading-relaxed">
                  Toàn bộ lịch sử nộp tiền cọc và tiền phòng hàng tháng sẽ được lưu trữ tự động tại đây.
                </p>
             </div>
          )}

          {/* Support Widget */}
          <div className="bg-[#F8FAFC] rounded-[40px] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#0F172A] shadow-xl mb-6 ring-1 ring-slate-100">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
             </div>
             <h4 className="text-[19px] font-black text-[#0F172A] mb-3 uppercase tracking-tight leading-tight">Cần hỗ trợ <br /> cư dân?</h4>
             <p className="text-[14px] text-[#64748B] font-bold leading-relaxed mb-8">
                Gặp sự cố về kỹ thuật hoặc cần liên hệ văn phòng quản lý tòa nhà?
             </p>
             <button className="w-full bg-[#0F172A] text-white py-4 rounded-2xl font-black text-[13px] hover:bg-[#0052CC] transition-all shadow-lg uppercase tracking-widest">
                Gửi hỗ trợ ngay
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
