import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../lib/storage";

function ProtectedRoute() {
  const token = getToken();

  // Tạm thời tắt check login để bạn có thể xem trước giao diện
  // if (!token) {
  //   return <Navigate to="/login" replace />;
  // }
  return <Outlet />;
}

export default ProtectedRoute;
