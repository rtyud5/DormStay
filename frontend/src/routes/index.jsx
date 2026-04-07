// frontend/src/routes/index.jsx
import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import MainLayout from "../layouts/MainLayout";
import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import { KE_TOAN_ROLES, STAFF_ROLES } from "../lib/constants";

// Pages của teammate — giữ nguyên
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

// Placeholder tạm — sẽ thay bằng page thật khi build xong
const Placeholder = ({ title }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    <p className="text-gray-500 mt-2 text-sm">Trang đang được phát triển.</p>
  </div>
);

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

  // ── Auth (chỉ cho khách chưa đăng nhập) ─────────────────
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

  // ── Dashboard (cần đăng nhập) ────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // Routes cũ của teammate
          { path: "/deposits", element: <RentalRequestPage /> },
          { path: "/rental-requests/:id", element: <RequestDetailPage /> },
          { path: "/contracts", element: <ContractListPage /> },
          { path: "/contracts/:id", element: <ContractDetailPage /> },

          // ── Kế toán (KE_TOAN + QUAN_LY) ──────────────────
          {
            element: <ProtectedRoute allowedRoles={KE_TOAN_ROLES} />,
            children: [
              {
                path: "/ke-toan/phieu-thu",
                element: <Placeholder title="📄 Danh sách Phiếu Thu" />,
              },
              {
                path: "/ke-toan/hop-dong-cho-lap",
                element: <Placeholder title="📋 Hợp đồng chờ lập khoản thu" />,
              },
              {
                path: "/ke-toan/doi-soat",
                element: <Placeholder title="⚖️ Lập bảng đối soát tài chính" />,
              },
              {
                path: "/ke-toan/hoan-coc",
                element: <Placeholder title="💰 Lập phiếu hoàn cọc" />,
              },
            ],
          },
        ],
      },
    ],
  },

  // ── Error pages ───────────────────────────────────────────
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
