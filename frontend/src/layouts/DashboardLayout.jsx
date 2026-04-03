import { Outlet } from "react-router-dom";
import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default DashboardLayout;
