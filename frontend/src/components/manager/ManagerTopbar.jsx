/**
 * Manager Topbar — Thanh trên cùng
 */

import React from "react";
import { useLocation } from "react-router-dom";
import { Search, Bell, HelpCircle } from "lucide-react";
import { BREADCRUMB_MAP } from "../../constants/manager.constants";

export default function ManagerTopbar() {
  const location = useLocation();

  // Find matching breadcrumb (support dynamic routes like /manager/residents/:id)
  const matchedKey = Object.keys(BREADCRUMB_MAP).find((key) =>
    location.pathname.startsWith(key)
  );
  const breadcrumb = matchedKey ? BREADCRUMB_MAP[matchedKey] : "Dashboard";

  return (
    <header className="bg-white sticky top-0 z-30 border-b border-gray-100">
      <div className="flex items-center justify-between px-8 py-4 h-20">
        {/* Left Side — Breadcrumb */}
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold text-[#0b2447] tracking-wider uppercase">
            QUẢN LÝ VẬN HÀNH
          </h2>
          <div className="h-4 w-px bg-gray-300" />
          <p className="text-sm text-gray-500">{breadcrumb}</p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-5 ml-auto">
          {/* Search */}
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Tìm phòng, cư dân, hợp đồng..."
              className="w-full px-4 py-2.5 pl-10 bg-[#f4f7fa] border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-200 text-sm transition-all text-gray-700"
            />
            <Search className="absolute left-3.5 top-[11px] w-[18px] h-[18px] text-gray-400" />
          </div>

          <div className="flex items-center gap-3">
            {/* Notification */}
            <button className="relative w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#0b2447] hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-[20px] h-[20px]" />
              <span className="absolute top-[8px] right-[8px] w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            {/* Help */}
            <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#0b2447] hover:bg-gray-100 rounded-full transition-colors">
              <HelpCircle className="w-[20px] h-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
