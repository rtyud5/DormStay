import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDefaultRouteByRole } from "../lib/authRedirect";

function GuestRoute() {
  const { isAuthenticated, loading, profile } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-[#0A192F]">Đang tải...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteByRole(profile?.vai_tro)} replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
