/**
 * Accounting Sidebar - Sidebar cố định cho module kế toán
 */

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Landmark } from "lucide-react";
import { ACCOUNTING_MENU } from "../../constants/accounting.constants";
import { useAuth } from "../../context/AuthContext";

export default function AccountingSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-40">
      {/* Top Section - Logo */}
      <div className="p-6 pb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0b2447] rounded-xl flex flex-shrink-0 items-center justify-center shadow-md">
          <Landmark className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-[1.35rem] font-bold text-[#0b2447] tracking-tight leading-none mb-1">DormiCare</h1>
          <p className="text-[0.65rem] text-gray-500 font-bold uppercase tracking-widest">Kế toán & Tài chính</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-1">
        {ACCOUNTING_MENU.map((item) => {
          const isActive = location.pathname.includes(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive
                  ? "bg-[#f4f7fa] text-[#0b2447]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className={`transition-transform ${isActive ? "text-[#0b2447]" : "text-gray-400 group-hover:text-gray-600"}`}>
                <Icon className="w-5 h-5" strokeWidth={2.5} />
              </span>
              <span className="text-sm flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions - User Block */}
      <div className="p-4 border-t border-transparent flex-shrink-0">
        <div className="bg-[#f8f9fa] rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0b2447] to-blue-800 rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <span className="font-semibold text-sm">
                {user?.name?.charAt(0) || "M"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {user?.name || "Minh Tran"}
              </p>
              <p className="text-xs text-gray-500 truncate">Kế toán trưởng</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
}
