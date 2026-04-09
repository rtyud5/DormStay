// frontend/src/pages/ke-toan/HopDongChoLapPage.jsx
export default function HopDongChoLapPage() {
  const mockData = [
    { ma: "CTR-0041", khach: "Nguyễn Minh Tuấn", phong: "P.202", ngay_vao: "01/03/2026", ky_thu: "Tháng 4/2026", trang_thai: "Chưa lập" },
    { ma: "CTR-0038", khach: "Trần Thị Lan", phong: "P.305 - G.A", ngay_vao: "15/02/2026", ky_thu: "Tháng 4/2026", trang_thai: "Chưa lập" },
    { ma: "CTR-0035", khach: "Lê Quốc Bảo", phong: "P.101", ngay_vao: "01/02/2026", ky_thu: "Tháng 4/2026", trang_thai: "Đang soạn" },
  ];

  return (
    <div id="hop-dong-cho-lap-page" className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hợp đồng chờ lập khoản thu</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách hợp đồng cần lập phiếu thu theo kỳ thanh toán.</p>
        </div>
        <button
          id="hop-dong-lap-hang-loat-btn"
          className="px-4 py-2 bg-[#0F2A5E] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3a7a] transition shadow-sm"
        >
          + Lập hàng loạt
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex gap-3 items-start">
        <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-blue-700">
          Kỳ thu tháng <strong>4/2026</strong> – Tìm thấy <strong>14</strong> hợp đồng chưa được lập phiếu thu.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {["MÃ HĐ", "KHÁCH HÀNG", "PHÒNG/GIƯỜNG", "NGÀY VÀO Ở", "KỲ THU", "TRẠNG THÁI", "THAO TÁC"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {mockData.map((row) => (
              <tr key={row.ma} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3.5 text-sm font-mono font-semibold text-blue-700">{row.ma}</td>
                <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{row.khach}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{row.phong}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{row.ngay_vao}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{row.ky_thu}</td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    row.trang_thai === "Chưa lập"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {row.trang_thai}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <button
                    id={`lap-phieu-thu-${row.ma}`}
                    className="px-3 py-1.5 bg-[#0F2A5E] text-white text-xs font-semibold rounded-lg hover:bg-[#1a3a7a] transition"
                  >
                    Lập phiếu thu
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 mt-4 text-center">
        Hiển thị 3 / 14 hợp đồng — Trang đang được phát triển đầy đủ
      </p>
    </div>
  );
}
