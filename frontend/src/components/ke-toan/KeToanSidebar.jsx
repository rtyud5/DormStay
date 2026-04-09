// frontend/src/components/ke-toan/KeToanSidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUser, logout } from "../../lib/storage";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/ke-toan/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: "hop-dong",
    label: "Hợp đồng",
    path: "/ke-toan/hop-dong-cho-lap",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: "phieu-thu",
    label: "Phiếu thu",
    path: "/ke-toan/phieu-thu",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    id: "giao-dich",
    label: "Giao dịch",
    path: "/ke-toan/doi-soat",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    id: "cai-dat",
    label: "Cài đặt",
    path: "/ke-toan/cai-dat",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const BOTTOM_LINKS = [
  {
    id: "hoan-tien",
    label: "Hoàn tiền",
    path: "/ke-toan/hoan-coc",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
  },
  {
    id: "thong-ke",
    label: "Thống kê",
    path: "/ke-toan/thong-ke",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function KeToanSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      id="ke-toan-sidebar"
      className="hidden md:flex flex-col w-[200px] shrink-0 bg-white border-r border-slate-100 min-h-screen"
    >
      {/* Brand Header */}
      <div className="px-5 pt-6 pb-4 border-b border-slate-100">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
          Kế toán
        </p>
        <p className="text-[12px] text-slate-500 font-medium">Quản lý tài chính</p>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              id={`sidebar-nav-${item.id}`}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold
                transition-all duration-150 group
                ${isActive
                  ? "bg-[#EEF2FF] text-[#1D3F8C]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }
              `}
            >
              <span className={`${isActive ? "text-[#1D3F8C]" : "text-slate-400 group-hover:text-slate-600"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Create Report CTA */}
      <div className="px-3 pb-2">
        <button
          id="sidebar-create-report-btn"
          className="w-full flex items-center justify-center gap-2 bg-[#0F2A5E] hover:bg-[#1a3a7a] text-white text-[13px] font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Tạo báo cáo
        </button>
      </div>

      {/* Bottom Links */}
      <div className="px-3 pt-1 pb-4 space-y-0.5 border-t border-slate-100 mt-1">
        {BOTTOM_LINKS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              id={`sidebar-bottom-${item.id}`}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-xl text-[12.5px] font-medium
                transition-all duration-150 group
                ${isActive
                  ? "bg-[#EEF2FF] text-[#1D3F8C]"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                }
              `}
            >
              <span className={`${isActive ? "text-[#1D3F8C]" : "text-slate-400 group-hover:text-slate-500"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}

        {/* Logout */}
        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[12.5px] font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
