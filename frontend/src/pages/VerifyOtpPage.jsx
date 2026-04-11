import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthService from "../services/auth.service";

function VerifyOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await AuthService.verifyOtp(email, otp);
      navigate("/");
    } catch (err) {
      setError(err.message || "Mã OTP không hợp lệ hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex flex-col justify-between min-h-screen bg-[#F8F9FA]">
      <div className="py-12 px-4 sm:px-6 lg:px-8 flex justify-center w-full grow items-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_4px_30px_rgb(0,0,0,0.03)] border border-slate-50">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0052CC]/10 text-[#0052CC] rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-[24px] font-extrabold text-[#0F172A] mb-2">Xác thực OTP</h2>
              <p className="text-[#64748B] text-[14px]">
                Mã xác thực đã được gửi đến <br />
                <span className="font-bold text-[#0F172A]">{email}</span>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-[13px] font-bold text-[#0F172A] mb-2 text-center uppercase tracking-wider">Mã xác thực 6 số</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-[#F8F9FA] text-[#0F172A] text-[32px] font-bold tracking-[0.5em] text-center px-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 border border-transparent focus:border-[#0052CC]/20 transition-all placeholder:text-[#CBD5E1]"
                  placeholder="000000"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-[15px] transition-all shadow-md ${
                  loading || otp.length !== 6 
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                  : "bg-[#1E293B] hover:bg-[#0F172A] text-white"
                }`}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  "Xác nhận đăng ký"
                )}
              </button>

              <div className="text-center">
                <p className="text-[#64748B] text-[13px]">
                  Không nhận được mã?{" "}
                  <button type="button" className="text-[#0052CC] font-bold hover:underline">Gửi lại</button>
                </p>
              </div>
            </form>
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/register" className="text-[#64748B] text-[14px] hover:text-[#0F172A] flex items-center justify-center gap-2 font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại đăng ký
            </Link>
          </div>
        </div>
      </div>

      {/* Footer simplistic version */}
      <footer className="py-8 bg-[#F8F9FA] text-center">
        <div className="text-[20px] font-extrabold tracking-tight mb-2">
          <span className="text-[#0052CC]">Dorm</span><span className="text-[#0F172A]">Stay</span>
        </div>
        <p className="text-[12px] text-[#94A3B8] italic">© 2026 DormStay. Bảo mật và Minh bạch.</p>
      </footer>
    </div>
  );
}

export default VerifyOtpPage;
