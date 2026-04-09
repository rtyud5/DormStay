// frontend/src/routes/index.jsx
import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import KeToanLayout from "../layouts/KeToanLayout";
import MainLayout from "../layouts/MainLayout";
import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import { KE_TOAN_ROLES } from "../lib/constants";

// Pages — Teammate
import ContractDetailPage from "../pages/ContractDetailPage";
import ContractListPage from "../pages/ContractListPage";
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import RegisterPage from "../pages/RegisterPage";
import RentalRequestPage from "../pages/RentalRequestPage";
import RequestDetailPage from "../pages/RequestDetailPage";
import RoomDetailPage from "../pages/RoomDetailPage";
import RoomListPage from "../pages/RoomListPage";
import RentalRequestListPage from "../pages/RentalRequestListPage";

// Pages — Kế toán
import InvoiceListPage from "../pages/InvoiceListPage";
import KeToanDashboardPage from "../pages/ke-toan/KeToanDashboardPage";
import HopDongChoLapPage from "../pages/ke-toan/HopDongChoLapPage";
import DoiSoatPage from "../pages/ke-toan/DoiSoatPage";
import HoanCocPage from "../pages/ke-toan/HoanCocPage";
import ThongKePage from "../pages/ke-toan/ThongKePage";
import CaiDatPage from "../pages/ke-toan/CaiDatPage";

const router = createBrowserRouter([
  // ── Public ──────────────────────────────────────────────
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "rooms", element: <RoomListPage /> },
      { path: "rooms/:id", element: <RoomDetailPage /> },
    ],
  },

  // ── Auth ────────────────────────────────────────────────
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
        ],
      },
    ],
  },

  // ── Dashboard chung (teammate) ───────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/deposits", element: <RentalRequestPage /> },
          { path: "/rental-requests/:id", element: <RequestDetailPage /> },
          { path: "/contracts", element: <ContractListPage /> },
          { path: "/contracts/:id", element: <ContractDetailPage /> },
        ],
      },
    ],
  },

  // ── Kế Toán Module (layout riêng) ───────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <KeToanLayout />,
        children: [
          {
            element: <ProtectedRoute allowedRoles={KE_TOAN_ROLES} />,
            children: [
              { path: "/ke-toan/dashboard", element: <KeToanDashboardPage /> },
              { path: "/ke-toan/phieu-thu", element: <InvoiceListPage /> },
              { path: "/ke-toan/hop-dong-cho-lap", element: <HopDongChoLapPage /> },
              { path: "/ke-toan/doi-soat", element: <DoiSoatPage /> },
              { path: "/ke-toan/hoan-coc", element: <HoanCocPage /> },
              { path: "/ke-toan/thong-ke", element: <ThongKePage /> },
              { path: "/ke-toan/cai-dat", element: <CaiDatPage /> },
            ],
          },
        ],
      },
    ],
  },

  // ── Error pages ──────────────────────────────────────────
  {
    path: "/403",
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl font-bold text-red-300 mb-4">403</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Không có quyền truy cập</h2>
          <p className="text-sm text-gray-500 mb-4">Tài khoản của bạn không đủ quyền xem trang này.</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    ),
  },
  { path: "*", element: <NotFoundPage /> },
]);

export default router;
