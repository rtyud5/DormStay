import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
           {/* Col 1 */}
           <div>
               <div className="text-[22px] font-extrabold tracking-tight mb-4">
                  <span className="text-[#0052CC]">Dorm</span><span className="text-[#0F172A]">Stay</span>
               </div>
               <p className="text-[13px] text-[#64748B] leading-relaxed font-medium">
                  Nền tảng quản lý lưu trú cao cấp, mang đến sự tiện nghi và an toàn tuyệt đối cho cư dân.
               </p>
           </div>
           
           {/* Col 2 */}
           <div>
               <h3 className="text-[12px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-5">LIÊN KẾT</h3>
               <ul className="space-y-3 text-[14px] text-[#64748B] font-medium">
                  <li><Link to="/terms" className="hover:text-[#0052CC] transition">Điều khoản</Link></li>
                  <li><Link to="/privacy" className="hover:text-[#0052CC] transition">Bảo mật</Link></li>
                  <li><Link to="/contact" className="hover:text-[#0052CC] transition">Liên hệ</Link></li>
                  <li><Link to="/sitemap" className="hover:text-[#0052CC] transition">Sitemap</Link></li>
               </ul>
           </div>

           {/* Col 3 */}
           <div>
               <h3 className="text-[12px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-5">LIÊN HỆ</h3>
               <ul className="space-y-3 text-[14px] text-[#64748B] font-medium">
                  <li>Hotline: 1900 6868</li>
                  <li>Email: info@dormstay.vn</li>
                  <li className="leading-relaxed">Địa chỉ: 123 Đường Số 1, Quận 1, TP. HCM</li>
               </ul>
           </div>

           {/* Col 4 */}
           <div>
               <h3 className="text-[12px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-5">VỊ TRÍ</h3>
               <div className="bg-[#F1F5F9] w-[80%] h-28 rounded-3xl relative flex items-center justify-center overflow-hidden border border-slate-100 shadow-[inset_0_2px_4px_rgb(0,0,0,0.06)]">
                   <div className="relative">
                       <svg className="w-12 h-12 text-[#D32F2F] mix-blend-multiply" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                   </div>
               </div>
           </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-8 flex flex-col md:flex-row items-center justify-between text-[12px] text-[#64748B] font-medium">
            <p>© 2026 DormStay. Nền tảng quản lý lưu trú cao cấp.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
