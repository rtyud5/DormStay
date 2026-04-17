/**
 * Accounting Layout - Wrapper layout chứa sidebar
 */

import React from "react";
import { Outlet } from "react-router-dom";
import AccountingSidebar from "./AccountingSidebar";
import AccountingTopbar from "./AccountingTopbar";

export default function AccountingLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AccountingSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Topbar */}
        <AccountingTopbar />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
