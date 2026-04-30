import React from "react";
import { Outlet } from "react-router-dom";
import SaleSidebar from "./SaleSidebar";
import SaleTopbar from "./SaleTopbar";

export default function SaleLayout() {
  return (
    <div className="flex h-screen bg-[#f9fafb] overflow-hidden">
      <SaleSidebar />
      <div className="flex-1 md:ml-72 flex flex-col min-w-0">
        <SaleTopbar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
