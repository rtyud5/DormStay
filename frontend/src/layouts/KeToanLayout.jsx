// frontend/src/layouts/KeToanLayout.jsx
import { Outlet } from "react-router-dom";
import KeToanSidebar from "../components/ke-toan/KeToanSidebar";
import KeToanTopbar from "../components/ke-toan/KeToanTopbar";

export default function KeToanLayout() {
  return (
    <div className="min-h-screen bg-[#F8F9FC] flex">
      {/* Sidebar */}
      <KeToanSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <KeToanTopbar />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
