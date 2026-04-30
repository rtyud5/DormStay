import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, FileSignature, ClipboardList, LogOut, Building2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { SALE_ROUTES } from "../../constants/sale.constants";

const MENU_META = [
  { path: SALE_ROUTES.DASHBOARD, icon: LayoutDashboard, label: "Dashboard" },
  { path: SALE_ROUTES.RENTAL_REQUESTS, icon: ClipboardList, label: "Yêu cầu thuê" },
  { path: SALE_ROUTES.CUSTOMERS, icon: Users, label: "Khách hàng" },
  { path: SALE_ROUTES.CONTRACTS, icon: FileSignature, label: "Hợp đồng" },
  { path: SALE_ROUTES.CHECKOUT_REQUESTS, icon: Building2, label: "Yêu cầu trả phòng" },
];

export default function SaleSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, profile } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <aside className="hidden md:flex w-72 h-screen bg-white border-r border-gray-200 flex-col fixed left-0 top-0 z-40">
      <div className="p-6 pb-8 flex items-center gap-3">
        <div className="w-11 h-11 bg-[#0b2447] rounded-2xl flex items-center justify-center shadow-md">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-[1.35rem] font-extrabold text-[#0b2447] tracking-tight leading-none mb-1">
            DormStay
          </h1>
          <p className="text-[0.68rem] text-gray-500 font-bold uppercase tracking-[0.2em]">
            Sales Management
          </p>
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="rounded-2xl bg-[#f8fafc] border border-gray-100 px-4 py-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.22em] mb-1">Nhân viên Sale</p>
          <p className="text-sm font-bold text-[#0b2447] truncate">{profile?.ho_ten || "Đang tải..."}</p>
        </div>
      </div>

      <nav className="space-y-1.5 px-4">
        {MENU_META.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={[
                "flex items-center gap-4 px-5 py-3.5 rounded-[16px] text-[14px] font-bold transition-all",
                active
                  ? "bg-[#0b2447] text-white shadow-md"
                  : "text-[#475569] hover:bg-slate-50 hover:text-[#0b2447] hover:shadow-sm",
              ].join(" ")}
            >
              <Icon className={[
                "w-5 h-5 shrink-0",
                active ? "text-white" : "text-[#94A3B8]",
              ].join(" ")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 pt-6 border-t border-slate-200 space-y-1.5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-3.5 rounded-[16px] text-[14px] font-bold text-red-500 hover:bg-red-50 transition-all text-left"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
