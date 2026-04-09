// frontend/src/pages/ke-toan/DoiSoatPage.jsx
export default function DoiSoatPage() {
  const mockData = [
    { ma: "DS-0021", hop_dong: "CTR-0031", khach: "Phạm Văn Dũng", ngay: "05/04/2026", so_coc: "6,400,000 đ", hoan: "4,480,000 đ", trang_thai: "Chờ xác nhận" },
    { ma: "DS-0020", hop_dong: "CTR-0028", khach: "Nguyễn Thị Hoa", ngay: "03/04/2026", so_coc: "3,200,000 đ", hoan: "3,200,000 đ", trang_thai: "Đã xác nhận" },
    { ma: "DS-0019", hop_dong: "CTR-0025", khach: "Trần Minh Khoa", ngay: "01/04/2026", so_coc: "5,000,000 đ", hoan: "0 đ", trang_thai: "Khách nợ thêm" },
  ];

  return (
    <div id="doi-soat-page" className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Đối soát tài chính</h1>
          <p className="text-sm text-slate-500 mt-1">Lập bảng đối soát khi khách trả phòng và tính toán hoàn cọc.</p>
        </div>
        <button
          id="doi-soat-tao-moi-btn"
          className="px-4 py-2 bg-[#0F2A5E] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3a7a] transition shadow-sm"
        >
          + Tạo đối soát mới
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Chờ xác nhận", value: "7", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
          { label: "Đã xác nhận", value: "23", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Khách còn nợ", value: "3", color: "text-red-600", bg: "bg-red-50 border-red-200" },
        ].map((c) => (
          <div key={c.label} className={`rounded-xl border p-4 ${c.bg}`}>
            <p className="text-xs text-slate-500 font-medium mb-1">{c.label}</p>
            <p className={`text-2xl font-extrabold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Refund rate reference */}
      <div className="bg-slate-800 text-white rounded-2xl p-5 mb-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tỷ lệ hoàn cọc theo quy định</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { case: "Chưa ký HĐ", rate: "80%", color: "bg-yellow-500" },
            { case: "Ký HĐ, ở < 6 tháng", rate: "50%", color: "bg-orange-500" },
            { case: "Ký HĐ, ở > 6 tháng", rate: "70%", color: "bg-blue-500" },
            { case: "Hết hạn HĐ", rate: "100%", color: "bg-emerald-500" },
          ].map((r) => (
            <div key={r.case} className="bg-slate-700 rounded-xl p-3">
              <div className={`w-2 h-2 rounded-full ${r.color} mb-2`} />
              <p className="text-slate-300 text-xs">{r.case}</p>
              <p className="text-white font-extrabold text-xl mt-0.5">{r.rate}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {["MÃ ĐỐI SOÁT", "HỢP ĐỒNG", "KHÁCH HÀNG", "NGÀY LẬP", "TIỀN CỌC", "SỐ TIỀN HOÀN", "TRẠNG THÁI", "THAO TÁC"].map((h) => (
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
                <td className="px-4 py-3.5 text-sm font-mono text-slate-600">{row.hop_dong}</td>
                <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{row.khach}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{row.ngay}</td>
                <td className="px-4 py-3.5 text-sm font-semibold text-slate-700">{row.so_coc}</td>
                <td className="px-4 py-3.5 text-sm font-semibold text-emerald-700">{row.hoan}</td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    row.trang_thai === "Đã xác nhận"
                      ? "bg-emerald-100 text-emerald-700"
                      : row.trang_thai === "Khách nợ thêm"
                      ? "bg-red-100 text-red-700"
                      : "bg-orange-100 text-orange-700"
                  }`}>
                    {row.trang_thai}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <button
                    id={`xem-doi-soat-${row.ma}`}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
