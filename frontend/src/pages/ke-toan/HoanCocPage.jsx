// frontend/src/pages/ke-toan/HoanCocPage.jsx
export default function HoanCocPage() {
  const mockData = [
    { ma: "PHC-0011", hop_dong: "CTR-0031", khach: "Phạm Văn Dũng", so_coc: "6,400,000", phan_tram: "70%", so_hoan: "4,480,000", kha_tru: "0", thuc_hoan: "4,480,000", phuong_thuc: "Chuyển khoản", trang_thai: "Chờ thực hiện" },
    { ma: "PHC-0010", hop_dong: "CTR-0028", khach: "Nguyễn Thị Hoa", so_coc: "3,200,000", phan_tram: "100%", so_hoan: "3,200,000", kha_tru: "200,000", thuc_hoan: "3,000,000", phuong_thuc: "Tiền mặt", trang_thai: "Đã hoàn" },
  ];

  return (
    <div id="hoan-coc-page" className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lập phiếu hoàn cọc</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và thực hiện hoàn cọc cho khách trả phòng.</p>
        </div>
      </div>

      {/* Workflow steps */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6 shadow-sm">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quy trình hoàn cọc</p>
        <div className="flex items-center gap-0">
          {[
            { step: "1", label: "Kiểm tra biên bản trả phòng", active: true },
            { step: "2", label: "Tính toán đối soát", active: true },
            { step: "3", label: "Xác nhận số tiền hoàn", active: false },
            { step: "4", label: "Thực hiện hoàn cọc", active: false },
          ].map((s, i) => (
            <div key={s.step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  ${s.active ? "bg-[#0F2A5E] text-white" : "bg-slate-100 text-slate-400"}`}>
                  {s.step}
                </div>
                <p className={`text-xs mt-1.5 text-center leading-tight max-w-[80px]
                  ${s.active ? "text-slate-700 font-medium" : "text-slate-400"}`}>
                  {s.label}
                </p>
              </div>
              {i < 3 && (
                <div className={`h-0.5 flex-1 -mt-4 ${s.active ? "bg-[#0F2A5E]" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Danh sách phiếu hoàn cọc</p>
          <button
            id="hoan-coc-tao-moi-btn"
            className="px-3 py-1.5 bg-[#0F2A5E] text-white text-xs font-semibold rounded-lg hover:bg-[#1a3a7a] transition"
          >
            + Tạo phiếu mới
          </button>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {["MÃ PHIẾU", "HỢP ĐỒNG", "KHÁCH HÀNG", "TIỀN CỌC GD", "TỶ LỆ HOÀN", "TIỀN HOÀN CƠ BẢN", "KHẤU TRỪ", "THỰC HOÀN", "PH. THỨC", "TRẠNG THÁI", "THAO TÁC"].map((h) => (
                <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {mockData.map((row) => (
              <tr key={row.ma} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 py-3.5 text-xs font-mono font-semibold text-blue-700 whitespace-nowrap">{row.ma}</td>
                <td className="px-3 py-3.5 text-xs font-mono text-slate-600 whitespace-nowrap">{row.hop_dong}</td>
                <td className="px-3 py-3.5 text-xs text-slate-700 font-medium whitespace-nowrap">{row.khach}</td>
                <td className="px-3 py-3.5 text-xs text-slate-700 font-semibold whitespace-nowrap">{row.so_coc} đ</td>
                <td className="px-3 py-3.5">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{row.phan_tram}</span>
                </td>
                <td className="px-3 py-3.5 text-xs text-slate-700 font-semibold whitespace-nowrap">{row.so_hoan} đ</td>
                <td className="px-3 py-3.5 text-xs text-red-600 font-semibold whitespace-nowrap">- {row.kha_tru} đ</td>
                <td className="px-3 py-3.5 text-xs text-emerald-700 font-bold whitespace-nowrap">{row.thuc_hoan} đ</td>
                <td className="px-3 py-3.5 text-xs text-slate-600 whitespace-nowrap">{row.phuong_thuc}</td>
                <td className="px-3 py-3.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                    row.trang_thai === "Đã hoàn"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-orange-100 text-orange-700"
                  }`}>
                    {row.trang_thai}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <button
                    id={`thuc-hien-hoan-coc-${row.ma}`}
                    className="px-2.5 py-1.5 border border-slate-200 text-slate-600 text-[11px] font-semibold rounded-lg hover:bg-slate-50 transition whitespace-nowrap"
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
