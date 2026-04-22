/**
 * Accounting Sidebar - Sidebar cố định cho module kế toán
 */

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Landmark, X } from "lucide-react";
import { ACCOUNTING_MENU } from "../../constants/accounting.constants";
import { useAuth } from "../../context/AuthContext";

export default function AccountingSidebar({ open = false, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    onClose?.();
    logout();
    navigate("/login");
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/34 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 max-w-[88vw] flex-col border-r border-gray-200 bg-white shadow-2xl shadow-slate-900/15 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0b2447] shadow-md">
            <Landmark className="h-6 w-6 text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="mb-1 text-[1.35rem] font-bold leading-none tracking-tight text-[#0b2447]">DormiCare</h1>
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-500">Kế toán & Tài chính</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-6">
          {ACCOUNTING_MENU.map((item) => {
            const isActive = location.pathname.includes(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 font-medium ${
                  isActive ? "bg-[#f4f7fa] text-[#0b2447]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span
                  className={`shrink-0 transition-transform ${isActive ? "text-[#0b2447]" : "text-gray-400 group-hover:text-gray-600"}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.5} />
                </span>
                <span className="flex-1 text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-transparent p-4 shrink-0">
          <div className="rounded-2xl bg-[#f8f9fa] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#0b2447] to-blue-800 text-white shadow-sm">
                <span className="text-sm font-semibold">{user?.name?.charAt(0) || "M"}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900">{user?.name || "Minh Tran"}</p>
                <p className="truncate text-xs text-gray-500">Kế toán trưởng</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
