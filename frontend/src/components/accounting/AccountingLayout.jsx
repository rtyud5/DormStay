/**
 * Accounting Layout - Wrapper layout chứa sidebar
 */

import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AccountingSidebar from "./AccountingSidebar";
import AccountingTopbar from "./AccountingTopbar";

export default function AccountingLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <AccountingSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AccountingTopbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto pt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
