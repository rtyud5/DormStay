import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await AuthService.login(form);
      navigate("/");
    } catch (err) {
      setError(err.message || "Tên đăng nhập hoặc mật khẩu không chính xác.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex min-h-[calc(100vh-80px)]">
       {/* Left Side */}
       <div className="hidden lg:flex lg:w-1/2 relative bg-[#1E293B] overflow-hidden flex-col justify-between p-12 lg:p-16">
          <div className="absolute inset-0 z-0">
             <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80" alt="Phòng ngủ" className="w-full h-full object-cover opacity-50 mix-blend-multiply" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-[#0F172A]/40"></div>
          </div>
          <div className="relative z-10 max-w-lg mt-8">
             <h1 className="text-[48px] font-extrabold text-white leading-[1.15] mb-6">
                Nâng tầm trải<br/>nghiệm lưu trú.
             </h1>
             <p className="text-[16px] text-slate-300 leading-relaxed font-medium">
                Hệ thống quản lý ký túc xá thông minh, giúp bạn tối ưu vận hành và chăm sóc khách hàng chuyên nghiệp như một quản gia cao cấp.
             </p>
          </div>
          
          <div className="relative z-10 flex items-center gap-4 text-slate-300 text-[14px]">
             <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-[#1E293B]" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt=""/>
                <img className="w-10 h-10 rounded-full border-2 border-[#1E293B]" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt=""/>
                <div className="w-10 h-10 rounded-full border-2 border-[#1E293B] bg-[#E2E8F0] flex items-center justify-center text-[#0F172A] font-extrabold text-xs">+</div>
             </div>
             <span className="font-medium">+2,500 quản trị viên tin dùng</span>
          </div>
       </div>

       {/* Right Side */}
       <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
          <div className="max-w-md w-full">
             <div className="mb-10 text-center lg:text-left">
                <h2 className="text-[32px] font-extrabold text-[#0F172A] mb-2 tracking-tight">Chào mừng trở lại</h2>
                <p className="text-[15px] text-[#64748B] font-medium">Vui lòng nhập thông tin để truy cập hệ thống quản lý.</p>
             </div>

             {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-xl flex items-center gap-3 font-medium">
                   <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                   {error}
                </div>
             )}

             <form onSubmit={handleLogin} className="space-y-6">
                <div>
                   <label className="block text-[13px] font-bold text-[#0F172A] mb-2">Email hoặc Số điện thoại</label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <svg className="w-5 h-5 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <input name="email" value={form.email} onChange={handleChange} className="w-full bg-[#F8F9FA] text-[#0F172A] text-[15px] font-medium pl-12 pr-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all placeholder:font-normal placeholder:text-[#94A3B8]" placeholder="example@dormstay.vn" />
                   </div>
                </div>

                <div>
                   <label className="block text-[13px] font-bold text-[#0F172A] mb-2">Mật khẩu</label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <svg className="w-5 h-5 text-[#94A3B8]" fill="currentColor" stroke="none" viewBox="0 0 24 24"><path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zm-3 5c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm3 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" /></svg>
                      </div>
                      <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full bg-[#F8F9FA] text-[#0F172A] text-[15px] font-medium pl-12 pr-12 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all placeholder:font-normal placeholder:text-[#94A3B8]" placeholder="••••••••" />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer hover:text-[#0F172A] transition-colors">
                         <svg className="w-5 h-5 text-[#94A3B8] hover:text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between text-[13px] font-bold pt-1">
                   <label className="flex items-center gap-2.5 cursor-pointer text-[#475569]">
                      <div className="w-[18px] h-[18px] rounded-full border border-[#CBD5E1] bg-[#F1F5F9] flex items-center justify-center"></div>
                      Ghi nhớ đăng nhập
                   </label>
                   <Link to="/forgot-password" className="text-[#0052CC] hover:underline">Quên mật khẩu?</Link>
                </div>

                <div className="pt-2">
                   <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#0A192F] hover:bg-[#112240] text-white py-4 rounded-xl font-bold text-[15px] transition-colors shadow-md">
                      Đăng nhập
                      <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                   </button>
                </div>

                <div className="py-2 flex items-center">
                   <div className="flex-1 h-px bg-slate-100"></div>
                   <span className="px-4 text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">HOẶC TIẾP TỤC VỚI</span>
                   <div className="flex-1 h-px bg-slate-100"></div>
                </div>

                <div>
                   <button type="button" className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-[#0F172A] py-3.5 rounded-xl font-bold text-[15px] transition-colors shadow-sm">
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                      Google
                   </button>
                </div>

                <div className="text-center pt-2">
                   <p className="text-[14px] text-[#475569]">
                      Chưa có tài khoản? <Link to="/register" className="font-bold text-[#0F172A] hover:text-[#0052CC] transition-colors">Đăng ký ngay</Link>
                   </p>
                </div>
             </form>
          </div>

          <div className="absolute bottom-6 right-6 hidden sm:block">
             <button className="bg-white px-4 py-2.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-2.5 text-[13px] font-bold text-[#0F172A] hover:shadow-xl transition-all hover:-translate-y-0.5">
                <div className="w-5 h-5 rounded-full bg-[#0052CC] text-white flex items-center justify-center text-[11px]">?</div>
                Hỗ trợ 24/7
             </button>
          </div>
       </div>

    </div>
  );
}

export default LoginPage;
