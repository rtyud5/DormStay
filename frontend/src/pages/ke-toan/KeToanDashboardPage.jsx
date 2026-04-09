// frontend/src/pages/ke-toan/KeToanDashboardPage.jsx
export default function KeToanDashboardPage() {
  const cards = [
    { label: "Tổng doanh thu tháng", value: "1.28 tỷ", change: "+12.5%", up: true, color: "text-blue-700", bg: "bg-blue-50" },
    { label: "Phiếu thu chờ duyệt", value: "23", change: "phiếu", up: null, color: "text-orange-700", bg: "bg-orange-50" },
    { label: "Hoàn cọc đang xử lý", value: "7", change: "yêu cầu", up: null, color: "text-purple-700", bg: "bg-purple-50" },
    { label: "Hợp đồng chờ lập thu", value: "14", change: "hợp đồng", up: null, color: "text-emerald-700", bg: "bg-emerald-50" },
  ];

  return (
    <div id="ke-toan-dashboard-page" className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Kế toán</h1>
        <p className="text-sm text-slate-500 mt-1">Tổng quan hoạt động tài chính hệ thống.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs text-slate-500 font-medium mb-2">{c.label}</p>
            <p className={`text-2xl font-extrabold ${c.color}`}>{c.value}</p>
            <p className={`text-xs mt-1 ${c.up === true ? "text-emerald-600" : c.up === false ? "text-red-500" : "text-slate-400"}`}>
              {c.up === true ? "▲ " : c.up === false ? "▼ " : ""}{c.change}
            </p>
          </div>
        ))}
      </div>

      {/* Placeholder chart area */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-center h-56">
        <div className="text-center text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="font-semibold text-slate-500">Biểu đồ doanh thu</p>
          <p className="text-sm text-slate-400 mt-1">Đang phát triển</p>
        </div>
      </div>
    </div>
  );
}
