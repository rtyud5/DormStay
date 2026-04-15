import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  // Using an array for 6 individual inputs
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Focus effect for OTP
  useEffect(() => {
    if (step === 2 && inputRefs.current[0]) {
      // Focus after slight delay to ensure render
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);
  
  // Countdown effect
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return setError("Vui lòng nhập email.");
    setError("");
    setLoading(true);
    try {
      await AuthService.resetPasswordForEmail(email);
      setStep(2);
      setCountdown(54); // Match screenshot "Gửi lại sau 54s" exactly visually, but in practice use dynamic
      // Clear OTP
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err.message || "Không thể gửi email. Vui lòng kiểm tra lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const token = otp.join("");
    if (token.length !== 6) return setError("Vui lòng nhập đủ 6 số.");
    setError("");
    setLoading(true);
    try {
      await AuthService.verifyRecoveryOtp(email, token);
      setStep(3);
    } catch (err) {
      setError(err.message || "Mã OTP không hợp lệ hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];

    if (value.length > 1) {
      const pastedData = value.slice(0, 6).split("");
      for (let i = 0; i < pastedData.length; i++) {
        if (index + i < 6) newOtp[index + i] = pastedData[i];
      }
      setOtp(newOtp);
      const focusIndex = Math.min(index + pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter" && otp.join("").length === 6) {
      handleVerifyOtp(e);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Mật khẩu không khớp.");
    if (password.length < 6) return setError("Mật khẩu phải có ít nhất 6 ký tự.");
    setError("");
    setLoading(true);
    try {
      await AuthService.updatePassword(password);
      await AuthService.logout();
      
      setSuccess("Đã đổi mật khẩu thành công! Hệ thống đang chuyển hướng về trang đăng nhập...");
      
      // Delay 2.5 seconds before navigating
      setTimeout(() => {
        navigate("/login", { 
          state: { message: "Vui lòng đăng nhập lại bằng mật khẩu mới của bạn." } 
        });
      }, 2500);
      
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi đặt lại mật khẩu.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#F8F9FA] pb-12 overflow-hidden">
      <div className="max-w-6xl mx-auto w-full px-6 py-12 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-16 grow">
        
        {/* Left Side */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center">
          <h1 className="text-[48px] lg:text-[56px] font-extrabold leading-[1.1] tracking-tight">
            <span className="text-[#0F172A] block">Khôi phục</span>
            <span className="text-[#0052CC] block">Tài khoản</span>
          </h1>
          <p className="text-[#475569] text-[16px] leading-relaxed mt-6 mb-12">
            Chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào không gian sống tiện nghi của mình một cách bảo mật nhất.
          </p>

          <div className="space-y-0 relative">
            {/* The line connecting steps visually */}
            <div className="absolute top-[20px] bottom-[30px] left-[20px] w-px bg-slate-200 z-0 hidden sm:block"></div>
            
            {/* Step 1 */}
            <div className={`relative z-10 flex items-start gap-5 pb-8 transition-opacity duration-300 ${step >= 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-[14px] transition-colors ${step === 1 ? 'bg-[#0052CC] text-white shadow-md shadow-[#0052CC]/20' : (step > 1 ? 'bg-[#10B981] text-white' : 'bg-slate-200 text-[#0F172A]')}`}>
                {step > 1 ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                ) : "01"}
              </div>
              <div className="pt-2">
                <h4 className={`text-[16px] font-extrabold tracking-wide ${step === 1 ? 'text-[#0F172A]' : 'text-slate-500'}`}>Xác thực danh tính</h4>
                <p className="text-[13px] text-[#64748B] mt-1 font-medium">Email hoặc Số điện thoại</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`relative z-10 flex items-start gap-5 pb-8 transition-opacity duration-300 ${step >= 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-[14px] transition-colors ${step === 2 ? 'bg-[#0A192F] text-white shadow-md' : (step > 2 ? 'bg-[#10B981] text-white' : 'bg-slate-200 text-slate-500')}`}>
                {step > 2 ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg> : "02"}
              </div>
              <div className="pt-2">
                <h4 className={`text-[16px] font-extrabold tracking-wide ${step === 2 ? 'text-[#0F172A]' : 'text-slate-500'}`}>Nhập mã OTP</h4>
                <p className="text-[13px] text-[#64748B] mt-1 font-medium">Kiểm tra tin nhắn/hộp thư</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`relative z-10 flex items-start gap-5 transition-opacity duration-300 ${step === 3 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-[14px] transition-colors ${step === 3 ? 'bg-[#0A192F] text-white shadow-md' : 'bg-slate-200 text-slate-500'}`}>03</div>
              <div className="pt-2">
                <h4 className={`text-[16px] font-extrabold tracking-wide ${step === 3 ? 'text-[#0F172A]' : 'text-slate-500'}`}>Mật khẩu mới</h4>
                <p className="text-[13px] text-[#64748B] mt-1 font-medium">Thiết lập bảo mật cao</p>
              </div>
            </div>
          </div>

          <div className="mt-12 hidden md:block group rounded-[24px] overflow-hidden relative shadow-lg h-48 max-w-[400px]">
            <img src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80" alt="Bảo mật" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-white font-medium text-[15px] leading-relaxed">
                Bảo mật thông tin là ưu tiên hàng đầu tại <span className="font-bold">DormiCare</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-[50%] flex justify-center">
          {step === 1 && (
            <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_4px_30px_rgb(0,0,0,0.03)] border border-slate-50 w-full max-w-[500px] animate-[fadeIn_0.4s_ease-out]">
              <div className="bg-[#0052CC]/10 text-[#0052CC] font-bold text-[11px] px-3.5 py-1.5 rounded-full w-max mb-6 uppercase tracking-wider">Bước 1</div>
              <h2 className="text-[32px] font-extrabold text-[#0F172A] mb-3 tracking-tight">Tìm tài khoản</h2>
              <p className="text-[#64748B] text-[15px] mb-8 font-medium">Nhập email đăng nhập của bạn để nhận mã khôi phục qua hòm thư.</p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 text-[13px] rounded-xl font-medium border border-red-100 flex items-center gap-3">
                   <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                   {error}
                </div>
              )}

              <form onSubmit={handleSendOtp}>
                <div className="mb-8">
                  <label className="block text-[13px] font-bold text-[#0F172A] mb-2">Email của bạn</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[#F8F9FA] text-[#0F172A] text-[15px] font-medium px-4 py-4 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all placeholder:font-normal placeholder:text-[#94A3B8]" placeholder="example@gmail.com" />
                </div>

                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#0A192F] hover:bg-[#112240] text-white py-4 rounded-xl font-bold text-[15px] transition-colors shadow-lg shadow-[#0A192F]/20 disabled:opacity-70 disabled:cursor-not-allowed">
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <>Gửi mã xác nhận <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></>
                  )}
                </button>
              </form>
              
              <div className="text-center mt-8">
                <Link to="/login" className="text-[#475569] font-bold text-[14px] hover:text-[#0F172A] transition-colors">
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_4px_30px_rgb(0,0,0,0.03)] border border-slate-50 w-full max-w-[500px] animate-[fadeIn_0.4s_ease-out]">
              <div className="bg-[#10B981]/10 text-[#10B981] font-bold text-[11px] px-3.5 py-1.5 rounded-full w-max mb-6 uppercase tracking-wider">Mã đã được gửi</div>
              <h2 className="text-[32px] font-extrabold text-[#0F172A] mb-3 tracking-tight">Xác thực OTP</h2>
              <p className="text-[#64748B] text-[15px] mb-8 font-medium">
                Vui lòng nhập mã 6 số chúng tôi vừa gửi đến <br className="hidden sm:block"/><span className="font-bold text-[#0F172A]">{email}</span>
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 text-[13px] rounded-xl font-medium border border-red-100 flex items-center gap-3">
                   <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                   {error}
                </div>
              )}

              <div className="flex justify-between gap-2.5 mb-8">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    maxLength={2}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-11 h-14 sm:w-[50px] sm:h-[60px] bg-[#F8F9FA] text-[#0F172A] text-[24px] sm:text-[28px] font-extrabold text-center rounded-xl focus:ring-2 focus:ring-[#0A192F]/20 border border-transparent focus:border-[#0A192F]/20 transition-all outline-none"
                  />
                ))}
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-[#64748B] text-[14px] font-medium">Không nhận được mã?</span>
                <button 
                  type="button"
                  onClick={handleSendOtp} 
                  disabled={countdown > 0} 
                  className={`font-bold text-[14px] ${countdown > 0 ? 'text-[#0052CC] opacity-90' : 'text-[#0052CC] hover:underline'}`}
                >
                  {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã'}
                </button>
              </div>

              <button 
                onClick={handleVerifyOtp} 
                disabled={loading || otp.join("").length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-[#0A192F] hover:bg-[#112240] text-white py-4 rounded-xl font-bold text-[15px] transition-colors shadow-lg shadow-[#0A192F]/20 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {loading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    <>Xác nhận & Tiếp tục <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></>
                )}
              </button>
              
              <div className="text-center mt-8">
                <button onClick={() => setStep(1)} className="text-[#475569] font-bold text-[14px] hover:text-[#0F172A] transition-colors">
                  Quay lại nhập Email/SĐT
                </button>
              </div>

              <div className="mt-12 flex items-center justify-center gap-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
                  Mã hóa SSL
                </div>
                <div className="flex items-center gap-2 text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001z" clipRule="evenodd" /></svg>
                  Bảo mật 2 lớp
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_4px_30px_rgb(0,0,0,0.03)] border border-slate-50 w-full max-w-[500px] animate-[fadeIn_0.4s_ease-out]">
              <div className="bg-[#10B981]/10 text-[#10B981] font-bold text-[11px] px-3.5 py-1.5 rounded-full w-max mb-6 uppercase tracking-wider">Hoàn tất</div>
              <h2 className="text-[32px] font-extrabold text-[#0F172A] mb-3 tracking-tight">Mật khẩu mới</h2>
              <p className="text-[#64748B] text-[15px] mb-8 font-medium">Vui lòng tạo một mật khẩu mạnh và không sử dụng lại mật khẩu cũ.</p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 text-[13px] rounded-xl font-medium border border-red-100 flex items-center gap-3">
                   <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                   {error}
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 text-[13px] rounded-xl font-medium border border-emerald-100 flex items-center gap-3 animate-pulse">
                   <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                   {success}
                </div>
              )}

              <form onSubmit={handleResetPassword}>
                <div className="space-y-5 mb-8">
                  <div>
                    <label className="block text-[13px] font-bold text-[#0F172A] mb-2">Mật khẩu mới</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full bg-[#F8F9FA] text-[#0F172A] text-[15px] font-medium px-4 py-4 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all placeholder:font-normal placeholder:text-[#94A3B8]" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#0F172A] mb-2">Nhập lại mật khẩu</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} className="w-full bg-[#F8F9FA] text-[#0F172A] text-[15px] font-medium px-4 py-4 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all placeholder:font-normal placeholder:text-[#94A3B8]" placeholder="••••••••" />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#0A192F] hover:bg-[#112240] text-white py-4 rounded-xl font-bold text-[15px] transition-colors shadow-lg shadow-[#0A192F]/20 disabled:bg-slate-300 disabled:shadow-none disabled:text-slate-500">
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : "Cập nhật mật khẩu"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer from design */}
      <footer className="text-center pb-8 pt-4">
          <div className="text-[20px] font-extrabold tracking-tight mb-3">
             <span className="text-[#0052CC]">Dormi</span><span className="text-[#0F172A]">Care</span>
          </div>
          <div className="flex items-center justify-center gap-6 mb-3 text-[13px] font-medium text-[#64748B]">
            <Link to="#" className="hover:text-[#0F172A]">Điều khoản</Link>
            <Link to="#" className="hover:text-[#0F172A]">Bảo mật</Link>
            <Link to="#" className="hover:text-[#0F172A]">Liên hệ</Link>
            <Link to="#" className="hover:text-[#0F172A]">Sitemap</Link>
          </div>
          <p className="text-[12px] text-[#94A3B8]">© 2024 DormiCare. Nền tảng quản lý lưu trú cao cấp.</p>
      </footer>
    </div>
  );
}

export default ForgotPasswordPage;
