import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ContractService from "../services/contract.service";

function ContractListPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContracts() {
      try {
        const res = await ContractService.getList();
        // Assuming the backend returns standard Supabase response { data: { data: [...] } }
        setContracts(res.data.data || []);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách hợp đồng:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchContracts();
  }, []);

  const activeContractsCount = contracts.filter(c => c.trang_thai === 'HIEU_LUC').length;
  const expiringContractsCount = 0; // Logic for expiring can be added later

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0052CC] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#64748B] font-bold">Đang tải danh sách hợp đồng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-sans pb-12 text-[#0F172A]">
      <div className="mb-10 pt-2">
         <h1 className="text-[28px] font-extrabold tracking-tight mb-2 uppercase">Hợp đồng của tôi</h1>
         <p className="text-[#64748B] text-[15px] font-medium leading-relaxed max-w-2xl">
           Quản lý và cập nhật thông tin chi tiết về các hợp đồng cư trú cá nhân của bạn tại hệ thống cư trú DormStay.
         </p>
      </div>

      {contracts.length === 0 ? (
        <div className="bg-white rounded-[48px] p-12 md:p-20 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-[32px] bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8] mb-8 ring-8 ring-[#F8FAFC]">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h2 className="text-[28px] font-extrabold text-[#1E293B] mb-4">Bạn chưa có hợp đồng nào</h2>
          <p className="text-[#64748B] text-[16px] font-medium max-w-md mx-auto mb-10 leading-relaxed text-balance">
            Hiện tại tài khoản chưa ghi nhận dữ liệu hợp đồng cư trú. Hãy tìm và chọn phòng ưng ý để bắt đầu đăng ký cư trú ngay nhé!
          </p>
          <Link to="/rooms">
            <button className="bg-[#0A192F] hover:bg-[#0052CC] text-white px-10 py-5 rounded-3xl font-extrabold text-[15px] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              Tìm và đặt phòng ngay
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-3xl p-7 flex items-center gap-6 shadow-[0_4px_25px_rgb(0,0,0,0.03)] border border-slate-50 ring-1 ring-slate-100/50">
                <div className="w-16 h-16 rounded-2xl bg-[#E6F0FF] flex items-center justify-center text-[#0052CC] shadow-inner">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#64748B] mb-1 uppercase tracking-wider">Tổng số hợp đồng</div>
                  <div className="text-[32px] font-black text-[#0F172A] leading-none">{String(contracts.length).padStart(2, '0')}</div>
                </div>
            </div>
            <div className="bg-white rounded-3xl p-7 flex items-center gap-6 shadow-[0_4px_25px_rgb(0,0,0,0.03)] border border-slate-50 ring-1 ring-slate-100/50">
                <div className="w-16 h-16 rounded-2xl bg-[#E4F2ED] flex items-center justify-center text-[#22A06B] shadow-inner">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#64748B] mb-1 uppercase tracking-wider uppercase">Đang hiệu lực</div>
                  <div className="text-[32px] font-black text-[#0F172A] leading-none">{String(activeContractsCount).padStart(2, '0')}</div>
                </div>
            </div>
            <div className="bg-white rounded-3xl p-7 flex items-center gap-6 shadow-[0_4px_25px_rgb(0,0,0,0.03)] border border-slate-50 ring-1 ring-slate-100/50">
                <div className="w-16 h-16 rounded-2xl bg-[#F8F9FA] flex items-center justify-center text-[#94A3B8] shadow-inner">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#64748B] mb-1 uppercase tracking-wider">Sắp hết hạn</div>
                  <div className="text-[32px] font-black text-[#0F172A] leading-none">{String(expiringContractsCount).padStart(2, '0')}</div>
                </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {contracts.map((contract) => (
              <div key={contract.ma_hop_dong} className="bg-white rounded-[40px] p-6 pr-8 shadow-[0_4px_30px_rgb(0,0,0,0.04)] border border-slate-50 flex flex-col sm:flex-row gap-8 relative overflow-hidden group hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all">
                <div className="w-full sm:w-[220px] shrink-0 h-[260px] sm:h-full relative rounded-[32px] overflow-hidden">
                  <img 
                    src={contract.phong?.hinh_anh_bia || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"} 
                    alt="Room" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/60 via-transparent to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-2 text-white text-[11px] font-black tracking-widest rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md ${contract.trang_thai === 'HIEU_LUC' ? 'bg-[#22A06B]/90' : 'bg-[#64748B]/90'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full bg-white ${contract.trang_thai === 'HIEU_LUC' ? 'animate-pulse' : ''}`}></div>
                      {contract.trang_thai === 'HIEU_LUC' ? 'ĐANG HIỆU LỰC' : 'TẠM NGƯNG'}
                    </span>
                  </div>
                </div>
                <div className="flex-1 py-6 flex flex-col justify-center">
                  <h2 className="text-[26px] font-black text-[#0F172A] leading-tight mb-1 uppercase">
                    P. {contract.phong?.ma_phong_hien_thi || 'N/A'} {contract.ma_giuong ? `- B${contract.ma_giuong}` : ''}
                  </h2>
                  <p className="text-[#64748B] text-[13px] font-bold tracking-tight mb-8">Mã hđ: #{contract.ma_hop_dong}</p>
                  
                  <div className="flex gap-10 mb-8">
                    <div>
                      <div className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1.5">NGÀY BẮT ĐẦU</div>
                      <div className="text-[15px] font-extrabold text-[#0F172A]">{new Date(contract.ngay_vao_o).toLocaleDateString('vi-VN')}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1.5">Dự kiến kết thúc</div>
                      <div className="text-[15px] font-extrabold text-[#0F172A]">Chưa xác định</div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-auto">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[24px] font-black text-[#0F172A]">{new Intl.NumberFormat('vi-VN').format(contract.gia_thue_co_ban_thang || 0)}đ</span>
                      <span className="text-[13px] text-[#64748B] font-bold">/tháng</span>
                    </div>
                    <Link to={`/contracts/${contract.ma_hop_dong}`} className="w-16 h-16 rounded-[24px] bg-[#0A192F] hover:bg-[#0052CC] text-white flex flex-col items-center justify-center transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                      <span className="text-[11px] font-black mb-0.5">XEM</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Info Banner */}
      <div className="bg-[#1E293B] rounded-[48px] p-10 md:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl border border-slate-800">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-[#0052CC] filter blur-[120px] opacity-20 -mr-20"></div>
         <div className="relative z-10 w-full md:w-3/5">
            <h2 className="text-[32px] font-black mb-8 leading-tight">Quy định và lưu ý cư dân</h2>
            <ul className="space-y-6">
               <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-xl bg-[#22A06B] flex items-center justify-center text-white shrink-0 font-bold text-xs">!</div>
                  <span className="text-[#CBD5E1] text-[15px] font-medium leading-relaxed">
                    Hợp đồng cần được gia hạn ít nhất **30 ngày** trước khi hết hạn để đảm bảo giữ chỗ tốt nhất.
                  </span>
               </li>
               <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-xl bg-[#22A06B] flex items-center justify-center text-white shrink-0 font-bold text-xs">!</div>
                  <span className="text-[#CBD5E1] text-[15px] font-medium leading-relaxed">
                    Mọi thay đổi về thông tin cá nhân cần được cập nhật trong phụ lục hợp đồng tại văn phòng quản lý.
                  </span>
               </li>
               <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-xl bg-[#22A06B] flex items-center justify-center text-white shrink-0 font-bold text-xs">!</div>
                  <span className="text-[#CBD5E1] text-[15px] font-medium leading-relaxed">
                    Việc thanh toán tiền phòng cần được thực hiện qua ứng dụng hoặc chuyển khoản trước ngày mùng 5 hàng tháng.
                  </span>
               </li>
            </ul>
         </div>
         <div className="relative z-10 shrink-0 w-full md:w-auto">
            <button className="w-full md:w-auto bg-white hover:bg-slate-50 text-[#0F172A] px-10 py-5 rounded-[24px] font-black text-[15px] shadow-[0_10px_20px_rgba(255,255,255,0.1)] transition-all">
               Tải nội quy (.PDF)
            </button>
         </div>
      </div>
    </div>
  );
}

export default ContractListPage;
