import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'QUAN_LY':
        return 'Quản Lý';
      case 'KE_TOAN':
        return 'Kế Toán';
      case 'KHACH_HANG':
        return 'Khách Hàng';
      default:
        return 'Người dùng';
    }
  };

  const links = [
    {
      name: "Hồ sơ",
      path: "/profile",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    },
    {
      name: "Giấy tờ",
      path: "/documents",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    },
    {
      name: "Yêu cầu thuê",
      path: "/deposits",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
    },
    {
      name: "Thanh toán",
      path: "/payments",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-full lg:w-[260px] shrink-0 font-sans hidden md:flex flex-col min-h-[calc(100vh-120px)]">
      {/* User Profile Summary */}
      <div className="flex items-center gap-4 mb-10 pl-2">
         <img 
           src={profile?.avatar_url || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=150&q=80"} 
           alt="Avatar" 
           className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" 
         />
         <div>
            <h3 className="font-extrabold text-[15px] text-[#0A192F] tracking-tight">{getRoleDisplayName(profile?.vai_tro)}</h3>
            <p className="text-[12px] text-[#64748B] font-medium">{profile?.ho_ten}</p>
         </div>
      </div>

      {/* Main Nav */}
      <nav className="space-y-1.5 mb-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-[16px] text-[14px] font-bold transition-all ${
                isActive 
                  ? "bg-[#0A192F] text-white shadow-md" 
                  : "text-[#475569] hover:bg-white hover:text-[#0A192F] hover:shadow-sm"
              }`}
            >
              <div className={isActive ? "text-white" : "text-[#94A3B8]"}>{link.icon}</div>
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* System Nav */}
      {/* <div className="space-y-1.5 border-t border-slate-200 pt-6 mt-8">
         <button className="w-full flex items-center justify-start gap-4 px-5 py-3.5 rounded-[16px] text-[14px] font-bold text-[#475569] hover:bg-white hover:text-[#0A192F] transition-all">
            <div className="text-[#94A3B8]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            Hỗ trợ
         </button>
         <button 
           onClick={handleLogout}
           className="w-full flex items-center gap-4 px-5 py-3.5 rounded-[16px] text-[14px] font-bold text-red-500 hover:bg-red-50 transition-all text-left"
         >
            <div className="text-red-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </div>
            Đăng xuất
         </button>
      </div> */}
    </aside>
  );
}

export default Sidebar;

