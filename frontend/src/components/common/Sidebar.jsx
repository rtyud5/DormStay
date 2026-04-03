import { Link, useLocation } from "react-router-dom";

const items = [
  { label: "Tong quan", to: "/" },
  { label: "Phong", to: "/rooms" },
  { label: "Yeu cau thue", to: "/rental-requests/new" },
  { label: "Hop dong", to: "/contracts" },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:w-64">
      <div className="mb-4 text-sm font-semibold text-slate-900">Dieu huong</div>
      <nav className="space-y-2">
        {items.map((item) => {
          const active = location.pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`block rounded-xl px-3 py-2 text-sm transition ${
                active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
