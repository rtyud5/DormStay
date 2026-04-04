import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Header() {
  const { user, profile, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Tìm phòng", path: "/rooms" },
    { name: "Giới thiệu", path: "/about" },
    { name: "Hợp đồng", path: "/contracts" },
    { name: "Đặt phòng", path: "/deposits" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        <Link to="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#0052CC]">Dorm</span><span className="text-[#0F172A]">Stay</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
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
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group"
              >
                <span className="text-[14px] font-bold text-[#0F172A] group-hover:text-[#0052CC] transition-colors whitespace-nowrap">
                  {profile?.full_name || "Cư dân"}
                </span>
                <div className="relative">
                  <img 
                    src={profile?.avatar_url || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=150&q=80"} 
                    alt="User" 
                    className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200" 
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <svg className={`w-4 h-4 text-[#64748B] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-50 py-2.5 z-50">
                  <div className="px-4 py-3 border-b border-slate-50 mb-1.5 grayscale-0">
                    <p className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider mb-0.5">Tài khoản</p>
                    <p className="text-[13px] font-bold text-[#0F172A] truncate">{user?.email}</p>
                  </div>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-bold text-[#475569] hover:bg-slate-50 hover:text-[#0052CC] transition-all"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    Bảng điều khiển
                  </Link>
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-bold text-[#475569] hover:bg-slate-50 hover:text-[#0052CC] transition-all"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    Hồ sơ của tôi
                  </Link>
                  <Link 
                    to="/settings" 
                    className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-bold text-[#475569] hover:bg-slate-50 hover:text-[#0052CC] transition-all"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Cài đặt
                  </Link>
                  <div className="h-px bg-slate-50 my-1.5"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] font-bold text-red-500 hover:bg-red-50 transition-all text-left"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
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

