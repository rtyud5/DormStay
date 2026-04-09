// frontend/src/pages/ke-toan/ThongKePage.jsx
export default function ThongKePage() {
  return (
    <div id="thong-ke-page" className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Thống kê tài chính</h1>
        <p className="text-sm text-slate-500 mt-1">Báo cáo tổng hợp doanh thu, công nợ và hoàn cọc.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm flex flex-col items-center justify-center min-h-64">
        <svg className="w-14 h-14 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-slate-500 font-semibold">Trang Thống kê đang được phát triển</p>
        <p className="text-slate-400 text-sm mt-1">Sẽ bao gồm biểu đồ doanh thu, công nợ và xu hướng thanh toán.</p>
      </div>
    </div>
  );
}
