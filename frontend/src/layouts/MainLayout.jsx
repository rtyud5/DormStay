import { Outlet } from "react-router-dom";
import Footer from "../components/common/Footer";
import Header from "../components/common/Header";

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
