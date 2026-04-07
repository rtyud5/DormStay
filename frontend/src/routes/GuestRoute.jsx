// frontend/src/routes/GuestRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { getToken, getUser } from "../lib/storage";
import { ROLES } from "../lib/constants";

function GuestRoute() {
  const token = getToken();

  if (token) {
    // Redirect đúng trang theo vai trò
    const user = getUser();
    const role = user?.vai_tro;

    if (role === ROLES.KE_TOAN || role === ROLES.QUAN_LY) {
      return <Navigate to="/ke-toan/phieu-thu" replace />;
    }
    if (role === ROLES.NHAN_VIEN) {
      return <Navigate to="/contracts" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
