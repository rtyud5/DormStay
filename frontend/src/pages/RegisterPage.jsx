import { Link, useNavigate } from "react-router-dom";
import RegisterForm from "../components/forms/RegisterForm";
import AuthService from "../services/auth.service";

function RegisterPage() {
  const navigate = useNavigate();

  async function handleRegister(payload) {
    try {
      await AuthService.register(payload);
      window.alert("Tao tai khoan thanh cong.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      window.alert("Dang ky that bai. Kiem tra backend hoac sua service sau.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dang ky</h1>
        <p className="mt-1 text-sm text-slate-500">Tao tai khoan nhanh bang email, so dien thoai va mat khau.</p>
      </div>

      <RegisterForm onSubmit={handleRegister} />

      <p className="text-sm text-slate-500">
        Da co tai khoan? <Link to="/login" className="font-medium text-slate-900">Dang nhap</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
