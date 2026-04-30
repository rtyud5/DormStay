import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Bell, HelpCircle, Home } from "lucide-react";
import { SALE_BREADCRUMB_MAP, SALE_ROUTES } from "../../constants/sale.constants";
import { useAuth } from "../../context/AuthContext";

const getBreadcrumb = (pathname) => {
  const matchedKey = Object.keys(SALE_BREADCRUMB_MAP).find((key) =>
    pathname === key || pathname.startsWith(`${key}/`)
  );
  return matchedKey ? SALE_BREADCRUMB_MAP[matchedKey] : "Dashboard";
};

export default function SaleTopbar() {
  const location = useLocation();
  const { profile } = useAuth();
  const breadcrumb = getBreadcrumb(location.pathname);

  const placeholder = location.pathname.includes("/checkout-requests")
    ? "Tìm hợp đồng, khách hàng..."
    : location.pathname.includes("/rental-requests")
      ? "Tìm tên khách, mã yêu cầu..."
      : location.pathname.includes("/contracts")
        ? "Tìm mã hợp đồng, tên khách..."
        : "Tìm nhanh...";

  return (
    <header className="bg-white sticky top-0 z-30 border-b border-gray-100">
      <div className="flex items-center justify-between px-6 lg:px-8 py-4 h-20">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to={SALE_ROUTES.HOME}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#0b2447] transition-colors hover:bg-slate-100 hover:border-slate-300"
            title="Quay về trang chủ"
          >
            <Home className="w-4 h-4" />
            Trang chủ
          </Link>
          <div className="h-4 w-px bg-gray-300" />
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold text-[#0b2447] tracking-[0.22em] uppercase">
              SALES MANAGEMENT
            </h2>
            <p className="text-sm text-gray-500 truncate">{breadcrumb}</p>
          </div>
        </div>

        <div className="flex items-center gap-5 ml-auto">
          <div className="relative w-72 hidden xl:block">
            <input
              type="text"
              placeholder={placeholder}
              className="w-full px-4 py-2.5 pl-10 bg-[#f4f7fa] border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-200 text-sm transition-all text-gray-700"
            />
            <Search className="absolute left-3.5 top-[11px] w-[18px] h-[18px] text-gray-400" />
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#0b2447] hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-[20px] h-[20px]" />
              <span className="absolute top-[8px] right-[8px] w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#0b2447] hover:bg-gray-100 rounded-full transition-colors">
              <HelpCircle className="w-[20px] h-[20px]" />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 pl-2">
            <div className="text-right">
              <p className="text-[12px] font-bold text-[#0b2447] leading-none">{profile?.ho_ten || "Sale user"}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Nhân viên sale</p>
            </div>
            <img
              src={profile?.avatar_url || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=150&q=80"}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
