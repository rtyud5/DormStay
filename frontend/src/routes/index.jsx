import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import MainLayout from "../layouts/MainLayout";
import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import ContractDetailPage from "../pages/ContractDetailPage";
import ContractListPage from "../pages/ContractListPage";
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import RegisterPage from "../pages/RegisterPage";
import VerifyOtpPage from "../pages/VerifyOtpPage";
import RentalRequestPage from "../pages/RentalRequestPage";
import RequestDetailPage from "../pages/RequestDetailPage";
import RoomDetailPage from "../pages/RoomDetailPage";
import RoomListPage from "../pages/RoomListPage";

import RentalRequestListPage from "../pages/RentalRequestListPage";
import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";

// [ACCOUNTING] imports
import AccountingLayout from "../components/accounting/AccountingLayout";
import AccountingDashboardPage from "../pages/accounting/AccountingDashboardPage";
import AccountingInvoiceListPage from "../pages/accounting/AccountingInvoiceListPage";
import AccountingContractListPage from "../pages/accounting/AccountingContractListPage";
import AccountingBillingPage from "../pages/accounting/AccountingBillingPage";
import AccountingExtraInvoicePage from "../pages/accounting/AccountingExtraInvoicePage";
import AccountingRefundPage from "../pages/accounting/AccountingRefundPage";
import AccountingTransactionPage from "../pages/accounting/AccountingTransactionPage";
import AccountingReconciliationPage from "../pages/accounting/AccountingReconciliationPage";

const router = createBrowserRouter([
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
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
          { path: "/verify-otp", element: <VerifyOtpPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/deposits", element: <RentalRequestListPage /> },
          { path: "/rental-requests/:id", element: <RequestDetailPage /> },
          { path: "/contracts", element: <ContractListPage /> },
          { path: "/contracts/:id", element: <ContractDetailPage /> },
        ],
      },
    ],
  },

  //Accounting
  {
    path: "/accounting",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AccountingLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <AccountingDashboardPage /> },
          { path: "contracts", element: <AccountingContractListPage /> },
          { path: "invoices", element: <AccountingInvoiceListPage /> },
          { path: "billing", element: <AccountingBillingPage /> },
          { path: "extra-invoices", element: <AccountingExtraInvoicePage /> },
          { path: "refunds", element: <AccountingRefundPage /> },
          { path: "transactions", element: <AccountingTransactionPage /> },
          { path: "reconciliation", element: <AccountingReconciliationPage /> },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
