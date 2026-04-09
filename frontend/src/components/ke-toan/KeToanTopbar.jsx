// frontend/src/components/ke-toan/KeToanTopbar.jsx
import { useLocation } from "react-router-dom";

const PAGE_TITLES = {
  "/ke-toan/dashboard": "Dashboard",
  "/ke-toan/phieu-thu": "Quản lý Phiếu thu",
  "/ke-toan/hop-dong-cho-lap": "Hợp đồng chờ lập khoản thu",
  "/ke-toan/doi-soat": "Đối soát tài chính",
  "/ke-toan/hoan-coc": "Lập phiếu hoàn cọc",
  "/ke-toan/thong-ke": "Thống kê",
  "/ke-toan/cai-dat": "Cài đặt",
};

export default function KeToanTopbar() {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || "Kế toán";

  return (
    <header
      id="ke-toan-topbar"
      className="sticky top-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center px-6 gap-4"
    >
      {/* Brand + Page Title */}
      <div className="flex items-center gap-3 flex-1">
        <span className="text-[15px] font-extrabold text-[#0F2A5E] tracking-tight">
          DormiCare
        </span>
        <span className="text-slate-300 font-light text-lg">|</span>
        <span className="text-[13.5px] font-semibold text-slate-600">{pageTitle}</span>
      </div>

      {/* Search */}
      <div className="relative hidden sm:block">
        <svg
          className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          id="ke-toan-search"
          type="text"
          placeholder="Tìm kiếm phiếu thu..."
          className="pl-9 pr-4 py-1.5 text-[13px] bg-slate-50 border border-slate-200 rounded-lg w-52
            focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notification */}
        <button
          id="ke-toan-notification-btn"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition relative"
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* Help */}
        <button
          id="ke-toan-help-btn"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition"
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Avatar */}
        <button
          id="ke-toan-user-avatar"
          className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D3F8C] to-[#3B6FCC] flex items-center justify-center text-white text-[11px] font-bold shadow-sm"
        >
          KT
        </button>
      </div>
    </header>
  );
}
