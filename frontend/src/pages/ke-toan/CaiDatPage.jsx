// frontend/src/pages/ke-toan/CaiDatPage.jsx
export default function CaiDatPage() {
  return (
    <div id="cai-dat-page" className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Cài đặt</h1>
        <p className="text-sm text-slate-500 mt-1">Cấu hình hệ thống kế toán.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm flex flex-col items-center justify-center min-h-48">
        <svg className="w-14 h-14 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
        <p className="text-slate-500 font-semibold">Trang Cài đặt đang được phát triển</p>
      </div>
    </div>
  );
}
