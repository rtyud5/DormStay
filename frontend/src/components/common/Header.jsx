import { Link } from "react-router-dom";
import { APP_NAME } from "../../lib/constants";
import { getUser, logout } from "../../lib/storage";

function Header() {
  const user = getUser();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          {APP_NAME}
        </Link>

        <nav className="flex items-center gap-4 text-sm text-slate-600">
          <Link to="/rooms" className="hover:text-slate-900">Phong</Link>
          <Link to="/contracts" className="hover:text-slate-900">Hop dong</Link>
          {user ? (
            <button
              type="button"
              className="rounded-full bg-slate-900 px-4 py-2 text-white"
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
            >
              Dang xuat
            </button>
          ) : (
            <Link to="/login" className="rounded-full bg-slate-900 px-4 py-2 text-white">
              Dang nhap
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
