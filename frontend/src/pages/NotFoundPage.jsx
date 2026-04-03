import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="text-6xl font-bold text-slate-900">404</div>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Khong tim thay trang</h1>
        <p className="mt-2 text-sm text-slate-500">Hay quay lai trang chu hoac kiem tra lai duong dan.</p>
      </div>
      <Link to="/">
        <Button>Ve trang chu</Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;
