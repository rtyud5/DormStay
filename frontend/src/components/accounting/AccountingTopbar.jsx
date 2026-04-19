/**
 * Accounting Topbar - Thanh trên cùng
 */

import React from "react";
import { useLocation } from "react-router-dom";
import { Search, Bell, HelpCircle, Menu } from "lucide-react";

export default function AccountingTopbar({ onOpenSidebar }) {
  const location = useLocation();

  const breadcrumbMap = {
    "/accounting/dashboard": "Dashboard",
    "/accounting/contracts": "Hợp đồng",
    "/accounting/invoices": "Phiếu thu",
    "/accounting/billing": "Lập phiếu",
    "/accounting/extra-invoices": "Phiếu phát sinh",
    "/accounting/refunds": "Phiếu hoàn cọc",
    "/accounting/transactions": "Tra soát giao dịch",
    "/accounting/reconciliation": "Đối soát tài chính",
  };

  const breadcrumb = breadcrumbMap[location.pathname] || "Dashboard";

  return (
    <header className="bg-white sticky top-0 z-30 border-b border-gray-100">
      <div className="flex h-20 items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 lg:gap-4">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#0b2447]"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h2 className="text-sm font-bold text-[#0b2447] tracking-wider uppercase">FINANCIAL OPERATIONS</h2>
          <div className="hidden h-4 w-px bg-gray-300 sm:block"></div>
          <p className="truncate text-sm text-gray-500">{breadcrumb}</p>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-4 lg:gap-5">
          <div className="relative hidden w-52 md:block lg:w-72">
            <input
              type="text"
              placeholder="Tra cứu mã giao dịch..."
              className="w-full px-4 py-2.5 pl-10 bg-[#f4f7fa] border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-200 text-sm transition-all text-gray-700"
            />
            <Search className="absolute left-3.5 top-2.75 h-4.5 w-4.5 text-gray-400" />
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button className="relative w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#0b2447] hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500"></span>
            </button>

            <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#0b2447] hover:bg-gray-100 rounded-full transition-colors">
              <HelpCircle className="h-5 w-5" />
            </button>

            <button className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#0b2447] md:hidden">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
