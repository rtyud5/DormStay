import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RentalRequestService from "../services/rentalRequest.service";
import { formatCurrency } from "../utils/accounting.utils";
import PayOS from "./PayOS"; // Import trực tiếp component PayOS thật của bạn

function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await RentalRequestService.getDetail(id);
        setRequest(res.data.data);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết yêu cầu:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Đang tải thông tin yêu cầu...</div>;
  if (!request) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">Không tìm thấy yêu cầu thuê này.</div>;

  const isPendingPayment = request.trang_thai === 'DANG_XU_LY' || request.trang_thai === 'CHO_THANH_TOAN' || request.trang_thai === 'MOI_TAO';
  const deadline = request.thoi_gian_het_han ? new Date(request.thoi_gian_het_han) : null;
  const isExpired = deadline ? new Date() > deadline : false;
  
  const canPay = isPendingPayment && !isExpired;

  const formatDateTime = (dateObj) => {
    if (!dateObj) return "--/--/----";
    const time = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${time} ${date}`;
  };

  const currentStep = canPay ? 3 : isExpired ? 0 : 5; 

  const handlePaymentSuccess = () => {
    alert("Thanh toán thành công! Hồ sơ của bạn sẽ được duyệt trong thời gian sớm nhất.");
    setShowPayment(false);
    window.location.reload();
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-[#E2E8F0] text-[#0F172A] font-bold text-xs px-3 py-1 rounded-full uppercase tracking-widest">{id}</span>
              {isExpired ? (
                <span className="bg-[#FEE2E2] text-[#DC2626] font-bold text-xs px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Đã hủy (Quá hạn)
                </span>
              ) : (
                <span className="bg-[#DBEAFE] text-[#0052CC] font-bold text-xs px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0052CC] animate-pulse"></span>
                  {request.statusText || request.trang_thai}
                </span>
              )}
            </div>
            <h1 className="text-[36px] font-extrabold text-[#0F172A] leading-tight tracking-tight mb-2">Chi tiết yêu cầu thuê</h1>
            <button onClick={() => navigate(-1)} className="text-[#64748B] hover:text-[#0F172A] text-sm font-bold flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Quay lại danh sách
            </button>
          </div>
          {canPay && !showPayment && (
            <button onClick={() => setShowPayment(true)} className="bg-[#0F172A] hover:bg-[#1E293B] text-white px-6 py-3.5 rounded-2xl font-bold text-[15px] transition-colors shadow-lg shadow-slate-200 whitespace-nowrap">
              Thanh toán ngay
            </button>
          )}
        </div>

        {/* Progress Tracker */}
        {!isExpired && (
          <div className="bg-white p-6 rounded-[32px] border border-[#E2E8F0] shadow-sm mb-8 hidden md:block">
            <div className="flex items-center justify-between relative max-w-4xl mx-auto">
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#E2E8F0] -z-10 translate-y-[-14px]"></div>
              {[
                { label: 'Gửi yêu cầu', active: true },
                { label: 'Xác nhận sơ bộ', active: true },
                { label: 'Thanh toán cọc', active: currentStep >= 3, current: currentStep === 3 },
                { label: 'Xác nhận cọc', active: currentStep >= 4 },
                { label: 'Duyệt hồ sơ', active: currentStep >= 5 }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${step.current ? 'bg-[#0F172A] text-white shadow-md' : step.active ? 'bg-[#3B82F6] text-white' : 'bg-[#E2E8F0] text-[#94A3B8]'}`}>
                    {step.active && !step.current ? (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <span className={`text-[11px] font-extrabold uppercase tracking-widest ${step.current ? 'text-[#0F172A]' : step.active ? 'text-[#3B82F6]' : 'text-[#94A3B8]'}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                <img src={request.phong?.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80"} alt="Room" className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded">
                  {request.loai_muc_tieu === 'PHONG' ? 'Nguyên phòng' : 'Giường đơn'}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-[24px] font-extrabold text-[#0F172A] mb-3 leading-tight">
                  Phòng {request.phong?.ma_phong_hien_thi || request.roomName || 'Đang cập nhật'}
                </h2>
                <div className="flex items-center gap-4 text-sm font-medium text-[#64748B] mb-6">
                  <div className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg> 25m²</div>
                  <div className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> Full Furnished</div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl px-4 py-3 flex-1 min-w-[150px]">
                    <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-widest mb-1">NGƯỜI THUÊ</div>
                    <div className="text-[14px] font-bold text-[#0F172A] truncate">
                       {request.ho_so?.ho_ten || 'Đang cập nhật'}
                    </div>
                  </div>
                  <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl px-4 py-3 flex-1 min-w-[150px]">
                    <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-widest mb-1">DỰ KIẾN VÀO Ở</div>
                    <div className="text-[14px] font-bold text-[#0F172A]">
                      {request.ngay_du_kien_vao_o ? new Date(request.ngay_du_kien_vao_o).toLocaleDateString('vi-VN') : '--/--/----'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-5 h-5 text-[#0F172A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <h3 className="text-[18px] font-extrabold text-[#0F172A]">Chính sách & Điều khoản</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "DormiCare standard: Cam kết chất lượng dịch vụ phòng ở và an ninh 24/7 theo tiêu chuẩn quản lý chuyên nghiệp.",
                  "Thời gian thuê tối thiểu 06 tháng. Hoàn trả tiền cọc sau khi kết thúc hợp đồng theo đúng hiện trạng bàn giao.",
                  "Nội quy cư dân: Đảm bảo vệ sinh chung và trật tự khu dân cư sau 23:00."
                ].map((text, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#E4F2ED] text-[#22A06B] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                    <span className="text-[14px] leading-relaxed text-[#475569] font-medium">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {!showPayment ? (
              <div className="bg-[#0A192F] text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10">
                  <span className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">TỔNG TIỀN CỌC</span>
                  <div className="text-[40px] font-black tracking-tight mb-8 leading-none">
                    {formatCurrency(request.so_tien_dat_coc || 0)}
                  </div>

                  <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                    <span className="text-slate-400 text-sm font-medium">Hạn thanh toán</span>
                    <span className="font-bold">{formatDateTime(deadline)}</span>
                  </div>

                  {isExpired ? (
                     <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 flex gap-3 items-start mb-6">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <span className="text-[13px] font-medium leading-relaxed">Yêu cầu đã quá hạn thanh toán. Vui lòng tạo yêu cầu đặt phòng mới để tiếp tục.</span>
                    </div>
                  ) : canPay ? (
                    <>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-3 items-start mb-6">
                        <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        <span className="text-[13px] text-slate-300 font-medium leading-relaxed">Vui lòng thanh toán cọc trong vòng 24h để giữ chỗ.</span>
                      </div>
                      <button onClick={() => setShowPayment(true)} className="w-full bg-white text-[#0A192F] hover:bg-slate-100 py-4 rounded-xl font-extrabold text-[15px] transition-colors">
                        THANH TOÁN NGAY
                      </button>
                    </>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-3 items-start">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-[13px] text-slate-300 font-medium leading-relaxed">Hồ sơ đã được ghi nhận. Hệ thống đang tiến hành xử lý yêu cầu của bạn.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <PayOS 
                amount={request.so_tien_dat_coc} 
                description={`Thanh toan coc cho ${id}`} 
                onSuccess={handlePaymentSuccess} 
                onCancel={handlePaymentCancel} 
              />
            )}

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
              <h4 className="font-extrabold text-[#0F172A] mb-4">Cần trợ giúp?</h4>
              <div className="space-y-3">
                <a href="tel:19001234" className="flex items-center gap-4 bg-white p-4 rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors group">
                  <div className="text-[#0052CC]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-widest mb-0.5">HOTLINE SUPPORT</div>
                    <div className="text-[14px] font-bold text-[#0F172A] group-hover:text-[#0052CC] transition-colors">1900 1234</div>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-4 bg-white p-4 rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors group">
                  <div className="text-[#0052CC]">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.82 1.45 5.31 3.73 6.95l-1.02 3.05c-.14.41.24.77.62.62l3.4-1.36c1.02.26 2.11.4 3.27.4 5.52 0 10-4.03 10-9s-4.48-9-10-9zm0 16c-1.02 0-2-.13-2.92-.37L6.4 18.7l.79-2.37C5.39 15.02 4.25 13.13 4.25 11c0-3.86 3.47-7 7.75-7s7.75 3.14 7.75 7-3.47 7-7.75 7z"/></svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-widest mb-0.5">ZALO TƯ VẤN</div>
                    <div className="text-[14px] font-bold text-[#0F172A] group-hover:text-[#0052CC] transition-colors">DormiCare Official</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestDetailPage;