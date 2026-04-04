import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RentalRequestService from "../services/rentalRequest.service";
import { formatCurrency } from "../lib/format";

function RentalRequestListPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await RentalRequestService.getList();
        setRequests(res.data.data || []);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách yêu cầu thuê:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'MOI_TAO': return { label: 'MỚI TẠO', color: 'bg-blue-100 text-blue-700', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' };
      case 'CHO_THANH_TOAN': return { label: 'CHỜ CỌC', color: 'bg-amber-100 text-amber-700', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' };
      case 'DA_XAC_NHAN': return { label: 'ĐÃ XÁC NHẬN', color: 'bg-green-100 text-green-700', icon: 'M5 13l4 4L19 7' };
      case 'TU_CHOI': return { label: 'TỪ CHỐI', color: 'bg-red-100 text-red-700', icon: 'M6 18L18 6M6 6l12 12' };
      default: return { label: status, color: 'bg-slate-100 text-slate-700', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' };
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-[#0052CC] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-[#64748B]">Đang tải danh sách yêu cầu...</p>
      </div>
    );
  }

  return (
    <div className="w-full font-sans pb-12 text-[#0F172A]">
      <div className="mb-10 pt-2">
         <h1 className="text-[28px] font-extrabold tracking-tight mb-2 uppercase">Yêu cầu thuê phòng</h1>
         <p className="text-[#64748B] text-[15px] font-medium leading-relaxed max-w-2xl">
           Theo dõi tiến độ xét duyệt hồ sơ và trạng thái đặt cọc giữ chỗ cho các căn phòng bạn đã đăng ký.
         </p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-[48px] p-12 md:p-20 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-[32px] bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8] mb-8 ring-8 ring-[#F8FAFC]">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-10V4m0 10V4m0 10h1m-1 4h1m-1 4h1" /></svg>
          </div>
          <h2 className="text-[28px] font-extrabold text-[#1E293B] mb-4">Chưa có yêu cầu nào</h2>
          <p className="text-[#64748B] text-[16px] font-medium max-w-md mx-auto mb-10 leading-relaxed">
            Bạn chưa thực hiện gửi yêu cầu thuê phòng nào. Hãy bắt đầu bằng việc tìm kiếm một căn phòng ưng ý nhé!
          </p>
          <Link to="/rooms">
            <button className="bg-[#0A192F] hover:bg-[#0052CC] text-white px-10 py-5 rounded-3xl font-extrabold text-[15px] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 uppercase tracking-wide">
              Khám phá phòng ngay
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 mb-10">
            <button className="px-6 py-3 rounded-2xl bg-[#0F172A] text-white text-[13px] font-black uppercase tracking-tighter shadow-xl">
              TẤT CẢ ({requests.length})
            </button>
            <button className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-[#64748B] text-[13px] font-bold uppercase tracking-tighter hover:border-[#0052CC] hover:text-[#0052CC] transition-all">
              ĐANG CHỜ ({requests.filter(r => r.trang_thai === 'MOI_TAO' || r.trang_thai === 'CHO_THANH_TOAN').length})
            </button>
          </div>

          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {requests.map((req) => {
              const config = getStatusConfig(req.trang_thai);
              return (
                <div key={req.ma_yeu_cau_thue} className="bg-white rounded-[40px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-50 flex flex-col hover:shadow-[0_12px_45px_rgb(0,0,0,0.06)] transition-all group">
                  <div className="flex justify-between items-start mb-10">
                    <div className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 ${config.color} shadow-sm uppercase`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={config.icon} /></svg>
                      {config.label}
                    </div>
                    <div className="text-[12px] font-black text-[#94A3B8] tracking-widest italic pt-1">#{req.ma_yeu_cau_thue}</div>
                  </div>

                  <div className="mb-10 flex-1">
                    <h3 className="text-[24px] font-black text-[#0F172A] mb-2 leading-tight uppercase">
                      P.{req.phong?.ma_phong_hien_thi || 'N/A'}
                    </h3>
                    <div className="flex items-center gap-2 text-[#64748B] text-[13px] font-bold">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      Gửi ngày: {new Date(req.created_at).toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-10 pt-6 border-t border-slate-50">
                    <div>
                      <div className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-2">TIỀN CỌC</div>
                      <div className="text-[20px] font-black text-[#0F172A] leading-none">{formatCurrency(req.so_tien_dat_coc || 0)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-2">LOẠI THUÊ</div>
                      <div className="text-[14px] font-black text-[#0F172A] leading-none uppercase tracking-tighter">
                        {req.loai_muc_tieu === 'PHONG' ? 'Nguyên phòng' : 'Giường lẻ'}
                      </div>
                    </div>
                  </div>

                  <Link to={`/deposits/${req.ma_yeu_cau_thue}`} className="block w-full">
                    <button className="w-full py-4 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 transition-all bg-[#0A192F] hover:bg-[#0052CC] text-white shadow-lg active:scale-95 uppercase tracking-wide">
                      Xem chi tiết hồ sơ
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default RentalRequestListPage;
