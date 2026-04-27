import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Users, FileSignature, LogOut, DoorOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const menu = [
  { to: "/sale/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/sale/rental-requests", label: "Yêu cầu thuê", icon: ClipboardList },
  { to: "/sale/customers", label: "Khách hàng", icon: Users },
  { to: "/sale/contracts", label: "Hợp đồng", icon: FileSignature },
  { to: "/sale/checkout-requests", label: "Yêu cầu trả phòng", icon: DoorOpen },
];

function SaleLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, profile } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const breadcrumbMap = {
    "/sale/dashboard": "Dashboard",
    "/sale/rental-requests": "Yêu cầu thuê",
    "/sale/customers": "Khách hàng",
    "/sale/contracts": "Hợp đồng",
    "/sale/checkout-requests": "Yêu cầu trả phòng",
  };

  const breadcrumb = Object.entries(breadcrumbMap)
    .find(([path]) => location.pathname.startsWith(path))?.[1] || "Sale";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden lg:flex w-72 shrink-0 border-r border-slate-200 bg-white flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0b2447] flex items-center justify-center shadow-md">
            <DoorOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-[1.35rem] font-bold tracking-tight text-[#0b2447] leading-none mb-1">DormStay</h1>
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">Kênh Sale</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {menu.map(({ to, label, icon: Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  active ? "bg-slate-100 text-[#0b2447]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-[#0b2447]" : "text-slate-400"}`} />
                <span className="flex-1">{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900 truncate">{profile?.ho_ten || "Nhân viên sale"}</p>
            <p className="text-xs text-slate-500 mb-4">Phân hệ sale</p>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 flex flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-400">Sale module</p>
              <h2 className="text-sm font-bold text-[#0b2447] mt-1">{breadcrumb}</h2>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{profile?.ho_ten || "Nhân viên sale"}</p>
              <p className="text-xs text-slate-500">Đã đăng nhập</p>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SaleLayout;
