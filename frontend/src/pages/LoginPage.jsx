import { Link, useNavigate } from "react-router-dom";
import LoginForm from "../components/forms/LoginForm";
import AuthService from "../services/auth.service";
import { setToken, setUser } from "../lib/storage";

function LoginPage() {
  const navigate = useNavigate();

  async function handleLogin(payload) {
    try {
      const response = await AuthService.login(payload);
      const { token, user } = response.data.data;
      setToken(token);
      setUser(user);
      navigate("/");
    } catch (error) {
      console.error(error);
      window.alert("Dang nhap that bai. Kiem tra backend hoac sua service sau.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dang nhap</h1>
        <p className="mt-1 text-sm text-slate-500">Dang nhap bang email hoac so dien thoai de tiep tuc.</p>
      </div>

      <LoginForm onSubmit={handleLogin} />

      <p className="text-sm text-slate-500">
        Chua co tai khoan? <Link to="/register" className="font-medium text-slate-900">Dang ky</Link>
      </p>
    </div>
  );
}

export default LoginPage;
