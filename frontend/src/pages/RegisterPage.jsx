import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", cccd: "", dob: "", password: "", confirmPassword: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    try {
      await AuthService.register(form);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="w-full flex flex-col justify-between">
       <div className="bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8 flex justify-center w-full grow">
          <div className="max-w-6xl w-full grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-24">
             
             {/* Left Column */}
             <div className="pt-8">
                <h1 className="text-[40px] font-extrabold text-[#0F172A] leading-tight mb-4 tracking-tight">
                   Trở thành cư dân <br/> của <span className="text-[#0052CC]">DormStay</span>
                </h1>
                <p className="text-[15px] text-[#475569] leading-relaxed mb-10 max-w-sm">
                   Hệ thống quản lý lưu trú thông minh, minh bạch và an toàn tuyệt đối cho hành trình sinh viên của bạn.
                </p>

                <div className="bg-white rounded-3xl p-8 shadow-[0_4px_25px_rgb(0,0,0,0.03)] mb-8 space-y-8">
                   <div className="flex gap-4">
                      <div className="bg-[#E2E8F0] text-[#0A192F] w-12 h-12 rounded-full flex items-center justify-center shrink-0">
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" /></svg>
                      </div>
                      <div>
                         <h3 className="font-bold text-[#0F172A] text-[15px] mb-1.5">Cam kết bảo mật</h3>
                         <p className="text-[#64748B] text-[13px] leading-relaxed pr-2">Dữ liệu của bạn được mã hóa chuẩn quân đội (AES-256) và chỉ sử dụng cho mục đích xác thực danh tính cư dân theo quy định pháp luật.</p>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      <div className="bg-[#A7F3D0] text-[#065F46] w-12 h-12 rounded-full flex items-center justify-center shrink-0">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                         <h3 className="font-bold text-[#0F172A] text-[15px] mb-1.5">Tại sao cần CCCD?</h3>
                         <p className="text-[#64748B] text-[13px] leading-relaxed pr-2">Chúng tôi yêu cầu CCCD để hoàn tất thủ tục đăng ký tạm trú bắt buộc và đảm bảo môi trường sống an toàn, không có đối tượng giả danh trong khu lưu trú.</p>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-4 text-[14px] font-bold">
                    <div className="flex items-center gap-3">
                       <span className="w-8 h-8 rounded-full bg-[#0A192F] text-white flex items-center justify-center">1</span>
                       <span className="text-[#0F172A]">Thông tin</span>
                    </div>
                    <div className="w-16 h-px bg-slate-300"></div>
                    <div className="flex items-center gap-3">
                       <span className="w-8 h-8 rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center">2</span>
                       <span className="text-[#64748B]">Xác thực OTP</span>
                    </div>
                </div>
             </div>

             {/* Right Column - Form */}
             <div>
                <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_4px_30px_rgb(0,0,0,0.03)] border border-slate-50">
                   <div className="mb-8">
                      <div className="border-l-[3px] border-[#0052CC] pl-4">
                          <h2 className="text-[19px] font-extrabold text-[#0F172A] tracking-wider uppercase mb-1">THÔNG TIN CÁ NHÂN</h2>
                          <p className="text-[#64748B] text-[13px] font-medium">Vui lòng nhập chính xác theo giấy tờ tùy thân</p>
                      </div>
                   </div>

                   <form onSubmit={handleRegister} className="space-y-5">
                      <div className="grid grid-cols-2 gap-5">
                         <div>
                            <label className="block text-[13px] font-bold text-[#0F172A] mb-2">Họ và tên</label>
                            <input name="fullName" value={form.fullName} onChange={handleChange} className="w-full bg-[#F8F9FA] text-[#0F172A] text-[15px] font-medium px-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all placeholder:font-normal placeholder:text-[#94A3B8]" placeholder="Nguyễn Văn A" />
                         </div>
                         <div>
                            <label className="block text-[13px] font-bold text-[#0F172A] mb-2">Số điện thoại</label>
                            <input name="phone" value={form.phone} onChange={handleChange} className="w-full bg-[#F8F9FA] text-[#0F172A] text-[15px] font-medium px-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all placeholder:font-normal placeholder:text-[#94A3B8]" placeholder="0901 234 567" />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                         <div>
                            <label className="block text-[13px] font-bold text-[#0F172A] mb-2">Email sinh viên</label>
                            <input name="email" value={form.email} onChange={handleChange} className="w-full bg-[#F8F9FA] text-[#0F172A] text-[15px] font-medium px-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all placeholder:font-normal placeholder:text-[#94A3B8]" placeholder="example@student.edu.vn" />
                         </div>
                         <div>
                            <label className="block text-[13px] font-bold text-[#0F172A] mb-2">Số CCCD / Định danh</label>
                            <input name="cccd" value={form.cccd} onChange={handleChange} className="w-full bg-[#F8F9FA] text-[#0F172A] text-[15px] font-medium px-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all placeholder:font-normal placeholder:text-[#94A3B8]" placeholder="012345678901" />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                         <div>
                            <label className="block text-[13px] font-bold text-[#0F172A] mb-2">Ngày sinh</label>
                            <div className="relative">
                               <input type="text" name="dob" value={form.dob} onChange={handleChange} className="w-full bg-[#F8F9FA] text-[#0F172A] text-[15px] font-medium px-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all placeholder:font-normal placeholder:text-[#94A3B8]" placeholder="mm/dd/yyyy" />
                               <div className="absolute inset-y-0 right-4 flex items-center text-[#94A3B8] pointer-events-none">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                               </div>
                            </div>
                         </div>
                         <div className="relative">
                            <label className="block text-[13px] font-bold text-[#0F172A] mb-2">Mật khẩu</label>
                            <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full bg-[#F8F9FA] text-[#0F172A] text-[15px] font-medium px-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all placeholder:font-normal placeholder:text-[#94A3B8]" placeholder="••••••••" />
                         </div>
                      </div>

                      <div>
                          <label className="block text-[13px] font-bold text-[#0F172A] mb-2">Xác nhận mật khẩu</label>
                          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="w-full bg-[#F8F9FA] text-[#0F172A] text-[15px] font-medium px-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all placeholder:font-normal placeholder:text-[#94A3B8]" placeholder="••••••••" />
                      </div>

                      <div className="pt-2">
                         <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white py-4 rounded-xl font-bold text-[15px] transition-colors shadow-md">
                            Tiếp theo: Xác thực OTP
                            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                         </button>
                         <p className="text-center text-[#64748B] text-[12px] italic mt-4">
                            Bằng cách nhấn "Tiếp theo", bạn đồng ý với <Link to="#" className="text-[#0052CC] hover:underline">Điều khoản dịch vụ</Link> của chúng tôi.
                         </p>
                      </div>
                   </form>
                </div>
             </div>
          </div>
       </div>

       {/* Footer */}
       <footer className="bg-[#F8F9FA] py-10 w-full flex flex-col items-center border-t border-slate-200">
          <div className="text-[24px] font-extrabold tracking-tight mb-4">
              <span className="text-[#0052CC]">Dorm</span><span className="text-[#0F172A]">Stay</span>
          </div>
          <div className="flex items-center gap-6 text-[13px] text-[#64748B] font-medium mb-3">
             <Link to="#" className="hover:text-[#0052CC] transition-colors">Điều khoản</Link>
             <Link to="#" className="hover:text-[#0052CC] transition-colors">Bảo mật</Link>
             <Link to="#" className="hover:text-[#0052CC] transition-colors">Liên hệ</Link>
             <Link to="#" className="hover:text-[#0052CC] transition-colors">Sitemap</Link>
          </div>
          <p className="text-[12px] text-[#94A3B8] italic">© 2026 DormStay. Nền tảng quản lý lưu trú cao cấp.</p>
       </footer>

    </div>
  );
}

export default RegisterPage;
