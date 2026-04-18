/**
 * Manager Layout — Wrapper chứa Sidebar + Topbar + Page content
 */

import React from "react";
import { Outlet } from "react-router-dom";
import ManagerSidebar from "./ManagerSidebar";
import ManagerTopbar from "./ManagerTopbar";

export default function ManagerLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <ManagerSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <ManagerTopbar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
