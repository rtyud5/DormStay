import { Link, useLocation } from "react-router-dom";
import { getUser, logout } from "../../lib/storage";

function Header() {
  const user = getUser();
  const location = useLocation();

  const navItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Tìm phòng", path: "/rooms" },
    { name: "Giới thiệu", path: "/about" },
    { name: "Đặt cọc", path: "/deposits" },
    { name: "Hợp đồng", path: "/contracts" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        <Link to="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#0052CC]">Dorm</span><span className="text-[#0F172A]">Stay</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
             const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
             return (
                 <Link 
                   key={item.path} 
                   to={item.path}
                   className={`text-[15px] font-bold transition-colors relative py-2 ${isActive ? 'text-[#0052CC]' : 'text-[#64748B] hover:text-[#0F172A]'}`}
                 >
                   {item.name}
                   {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0052CC] rounded-full"></span>
                   )}
                 </Link>
             )
          })}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <button
              type="button"
              className="rounded-xl bg-[#0A192F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#112240] transition"
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
            >
              Đăng xuất
            </button>
          ) : (
            <>
              <Link to="/login" className="text-[14px] font-bold text-[#64748B] hover:text-[#0F172A] transition">
                Đăng nhập
              </Link>
              <Link to="/register" className="rounded-full bg-[#0A192F] px-6 py-2.5 text-[14px] font-bold text-white hover:bg-[#112240] transition shadow-md hidden sm:block">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
