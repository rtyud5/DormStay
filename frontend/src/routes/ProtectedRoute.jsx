import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canAccessAccounting, canAccessManager, canAccessSale } from "../lib/authRedirect";


function ProtectedRoute({ requireAccounting = false, requireManager = false, requireSale = false }) {
  const { isAuthenticated, loading, profile } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-[#0A192F]">Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAccounting && !canAccessAccounting(profile?.vai_tro)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireManager && !canAccessManager(profile?.vai_tro)) {
    return <Navigate to="/dashboard" replace />;
  }


  return <Outlet />;
}

export default ProtectedRoute;
