import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../lib/storage";

function GuestRoute() {
  const token = getToken();

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
