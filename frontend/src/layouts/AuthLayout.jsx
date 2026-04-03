import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";

function AuthLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <div className="flex-1 flex w-full">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
