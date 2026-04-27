import React, { useState } from "react";
import {
  Banknote,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Landmark,
  Search,
} from "lucide-react";
import { formatCurrency } from "../../utils/accounting.utils";

const TRANG_THAI = {
  CHO_THANH_TOAN: "CHO_THANH_TOAN",
  DA_THANH_TOAN: "DA_THANH_TOAN",
};

const TRANG_THAI_LABEL = {
  CHO_THANH_TOAN: "Chờ thanh toán",
  DA_THANH_TOAN: "Đã thanh toán",
};

const PHUONG_THUC = {
  TIEN_MAT: "TIEN_MAT",
  CHUYEN_KHOAN: "CHUYEN_KHOAN",
};

const PHUONG_THUC_LABEL = {
  TIEN_MAT: "Tiền mặt",
  CHUYEN_KHOAN: "Chuyển khoản",
};

const FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: TRANG_THAI.CHO_THANH_TOAN, label: "Chờ thanh toán" },
  { value: TRANG_THAI.DA_THANH_TOAN, label: "Đã thanh toán" },
];

const MOCK_VOUCHERS = [
  {
    id: "PTPS-2024-001",
    maDoiSoat: "DS-2024-011",
    maHopDong: "CTR-9921",
    tenKhach: "Nguyễn Minh Tuấn",
    sdtKhach: "0912 345 678",
    phong: "B-402",
    soTien: 2700000,
    trangThai: TRANG_THAI.CHO_THANH_TOAN,
    ngayTao: "2024-04-20T09:15:00Z",
    lyDoThu: [
      { noiDung: "Tiền thuê còn nợ (tháng 4)", soTien: 1200000 },
      { noiDung: "Bồi thường hư hỏng cửa kính", soTien: 1500000 },
    ],
    phuongThuc: null,
    maGiaoDich: null,
    thoiGianThu: null,
    ghiChu: "",
  },
  {
    id: "PTPS-2024-002",
    maDoiSoat: "DS-2024-008",
    maHopDong: "CTR-8814",
    tenKhach: "Trần Thị Lan",
    sdtKhach: "0987 654 321",
    phong: "A-201",
    soTien: 450000,
    trangThai: TRANG_THAI.CHO_THANH_TOAN,
    ngayTao: "2024-04-18T14:30:00Z",
    lyDoThu: [{ noiDung: "Tiền điện nước còn nợ", soTien: 450000 }],
    phuongThuc: null,
    maGiaoDich: null,
    thoiGianThu: null,
    ghiChu: "",
  },
  {
    id: "PTPS-2024-003",
    maDoiSoat: "DS-2024-005",
    maHopDong: "CTR-7703",
    tenKhach: "Lê Văn Hùng",
    sdtKhach: "0903 111 222",
    phong: "C-105",
    soTien: 800000,
    trangThai: TRANG_THAI.DA_THANH_TOAN,
    ngayTao: "2024-04-15T10:00:00Z",
    lyDoThu: [
      { noiDung: "Phạt vi phạm nội quy", soTien: 500000 },
      { noiDung: "Tiền dịch vụ còn nợ", soTien: 300000 },
    ],
    phuongThuc: PHUONG_THUC.CHUYEN_KHOAN,
    maGiaoDich: "VCB20240415-88321",
    thoiGianThu: "2024-04-16T09:22:00Z",
    ghiChu: "Khách chuyển khoản qua Vietcombank.",
  },
  {
    id: "PTPS-2024-004",
    maDoiSoat: "DS-2024-003",
    maHopDong: "CTR-6601",
    tenKhach: "Phạm Quỳnh Anh",
    sdtKhach: "0918 999 000",
    phong: "D-310",
    soTien: 300000,
    trangThai: TRANG_THAI.DA_THANH_TOAN,
    ngayTao: "2024-04-10T08:45:00Z",
    lyDoThu: [{ noiDung: "Tiền thuê còn nợ (tháng 3)", soTien: 300000 }],
    phuongThuc: PHUONG_THUC.TIEN_MAT,
    maGiaoDich: null,
    thoiGianThu: "2024-04-11T11:05:00Z",
    ghiChu: "",
  },
];

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "--";

const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--";

function StatusBadge({ status }) {
  if (status === TRANG_THAI.DA_THANH_TOAN) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" strokeWidth={3} />
        {TRANG_THAI_LABEL[status]}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="w-3 h-3" strokeWidth={3} />
      {TRANG_THAI_LABEL[status]}
    </span>
  );
}

export default function AccountingExtraInvoicePage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(MOCK_VOUCHERS[0]?.id ?? null);
  const [vouchers, setVouchers] = useState(MOCK_VOUCHERS);

  const [confirmForm, setConfirmForm] = useState({
    phuongThuc: PHUONG_THUC.TIEN_MAT,
    maGiaoDich: "",
    ghiChu: "",
  });
  const [saving, setSaving] = useState(false);

  const filtered = vouchers.filter((v) => {
    const matchFilter = filter === "ALL" || v.trangThai === filter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      v.tenKhach.toLowerCase().includes(q) ||
      v.maHopDong.toLowerCase().includes(q) ||
      v.phong.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const selected = vouchers.find((v) => v.id === selectedId) ?? null;

  const pendingCount = vouchers.filter(
    (v) => v.trangThai === TRANG_THAI.CHO_THANH_TOAN
  ).length;

  const handleSelect = (id) => {
    setSelectedId(id);
    setConfirmForm({ phuongThuc: PHUONG_THUC.TIEN_MAT, maGiaoDich: "", ghiChu: "" });
  };

  const handleConfirm = () => {
    if (!selected) return;
    setSaving(true);
    // TODO: Replace with real API call — POST /accounting/settlement-payments/:id/confirm
    setTimeout(() => {
      setVouchers((prev) =>
        prev.map((v) =>
          v.id === selected.id
            ? {
                ...v,
                trangThai: TRANG_THAI.DA_THANH_TOAN,
                phuongThuc: confirmForm.phuongThuc,
                maGiaoDich: confirmForm.maGiaoDich || null,
                ghiChu: confirmForm.ghiChu,
                thoiGianThu: new Date().toISOString(),
              }
            : v
        )
      );
      setSaving(false);
    }, 600);
  };

  return (
    <div className="flex h-screen bg-[#f9fafb] overflow-hidden">
      {/* LEFT — List panel */}
      <div className="w-[360px] shrink-0 flex flex-col border-r border-gray-200 bg-white">
        <div className="px-6 pt-8 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-1">
            <FileText className="w-5 h-5 text-[#0b2447]" strokeWidth={2.5} />
            <h1 className="text-[1.1rem] font-extrabold text-[#0b2447] tracking-tight">
              Thanh Toán Phát Sinh
            </h1>
            {pendingCount > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-[11px] font-black rounded-full px-2 py-0.5 min-w-[22px] text-center">
                {pendingCount}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Phiếu được tạo tự động khi chốt đối soát
          </p>
        </div>

        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, phòng, hợp đồng..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-[#f9fafb]"
            />
          </div>
        </div>

        <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors ${
                filter === opt.value
                  ? "bg-[#0b2447] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 italic text-sm py-12">
              Không có phiếu nào.
            </p>
          )}
          {filtered.map((v) => (
            <button
              key={v.id}
              onClick={() => handleSelect(v.id)}
              className={`w-full text-left px-5 py-4 flex items-start gap-3 transition-colors ${
                selectedId === v.id
                  ? "bg-blue-50 border-l-4 border-l-[#1a56db]"
                  : "hover:bg-gray-50 border-l-4 border-l-transparent"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-extrabold text-[13px] text-gray-900 truncate">
                    {v.tenKhach}
                  </span>
                  <StatusBadge status={v.trangThai} />
                </div>
                <p className="text-[12px] font-medium text-gray-500 truncate mb-1">
                  {v.phong} · {v.maHopDong}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">{formatDate(v.ngayTao)}</span>
                  <span className="font-black text-[13px] text-[#0b2447]">
                    {formatCurrency(v.soTien)}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT — Detail + Confirm panel */}
      <div className="flex-1 overflow-y-auto">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm font-medium">
            Chọn một phiếu để xem chi tiết
          </div>
        ) : (
          <div className="p-8 max-w-[860px]">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2.5 py-1 rounded-md">
                    {selected.id}
                  </span>
                  <StatusBadge status={selected.trangThai} />
                </div>
                <h2 className="text-[1.9rem] font-extrabold text-[#0b2447] tracking-tight leading-none">
                  {selected.tenKhach}
                </h2>
                <p className="text-gray-400 font-medium mt-1.5 text-sm">
                  Phòng {selected.phong} · Hợp đồng {selected.maHopDong} · Đối soát {selected.maDoiSoat}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Khách thuê
                </p>
                <p className="font-extrabold text-gray-900">{selected.tenKhach}</p>
                <p className="text-sm text-gray-500 font-medium">{selected.sdtKhach}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Phòng / Hợp đồng
                </p>
                <p className="font-extrabold text-gray-900">{selected.phong}</p>
                <p className="text-sm text-gray-500 font-medium">{selected.maHopDong}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Ngày tạo phiếu
                </p>
                <p className="font-extrabold text-gray-900">{formatDate(selected.ngayTao)}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                Chi tiết khoản phát sinh (từ đối soát {selected.maDoiSoat})
              </p>
              <div className="divide-y divide-gray-100">
                {selected.lyDoThu.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-3">
                    <span className="text-[14px] font-semibold text-gray-700">{item.noiDung}</span>
                    <span className="font-black text-[15px] text-gray-900">
                      {formatCurrency(item.soTien)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-200">
                <span className="text-[12px] font-black text-gray-500 uppercase tracking-widest">
                  Tổng cần thu
                </span>
                <span className="text-[1.5rem] font-black text-[#0b2447]">
                  {formatCurrency(selected.soTien)}
                </span>
              </div>
            </div>

            {selected.trangThai === TRANG_THAI.CHO_THANH_TOAN && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">
                  Xác nhận thu tiền
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() =>
                      setConfirmForm((f) => ({ ...f, phuongThuc: PHUONG_THUC.TIEN_MAT, maGiaoDich: "" }))
                    }
                    className={`p-5 rounded-2xl flex items-center gap-4 transition-colors font-bold text-[14px] border-2 ${
                      confirmForm.phuongThuc === PHUONG_THUC.TIEN_MAT
                        ? "bg-[#f0f5ff] border-[#1a56db] text-[#1a56db]"
                        : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                    }`}
                  >
                    <Banknote className="w-7 h-7 opacity-80" strokeWidth={1.5} />
                    Tiền mặt
                  </button>
                  <button
                    onClick={() =>
                      setConfirmForm((f) => ({ ...f, phuongThuc: PHUONG_THUC.CHUYEN_KHOAN }))
                    }
                    className={`p-5 rounded-2xl flex items-center gap-4 transition-colors font-bold text-[14px] border-2 ${
                      confirmForm.phuongThuc === PHUONG_THUC.CHUYEN_KHOAN
                        ? "bg-[#f0f5ff] border-[#1a56db] text-[#1a56db]"
                        : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                    }`}
                  >
                    <Landmark className="w-7 h-7 opacity-80" strokeWidth={1.5} />
                    Chuyển khoản
                  </button>
                </div>

                {confirmForm.phuongThuc === PHUONG_THUC.CHUYEN_KHOAN && (
                  <div className="mb-4">
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">
                      Mã giao dịch
                    </label>
                    <input
                      value={confirmForm.maGiaoDich}
                      onChange={(e) =>
                        setConfirmForm((f) => ({ ...f, maGiaoDich: e.target.value }))
                      }
                      placeholder="VD: VCB20240427-12345"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    />
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">
                    Ghi chú{" "}
                    <span className="normal-case font-medium text-gray-400">(tùy chọn)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={confirmForm.ghiChu}
                    onChange={(e) =>
                      setConfirmForm((f) => ({ ...f, ghiChu: e.target.value }))
                    }
                    placeholder="Ghi chú thêm nếu có..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
                  />
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={saving}
                  className="w-full bg-[#0b2447] text-white py-4 rounded-2xl font-black text-[15px] hover:bg-[#0a1e3b] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {saving ? "Đang xử lý..." : "Xác nhận đã thu tiền"}
                </button>
              </div>
            )}

            {selected.trangThai === TRANG_THAI.DA_THANH_TOAN && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                  <p className="text-[12px] font-black text-emerald-700 uppercase tracking-widest">
                    Đã thu tiền
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                      Phương thức
                    </p>
                    <p className="font-extrabold text-gray-900">
                      {PHUONG_THUC_LABEL[selected.phuongThuc] ?? "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                      Thời gian thu
                    </p>
                    <p className="font-extrabold text-gray-900">
                      {formatDateTime(selected.thoiGianThu)}
                    </p>
                  </div>
                  {selected.maGiaoDich && (
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                        Mã giao dịch
                      </p>
                      <p className="font-extrabold text-gray-900 font-mono">
                        {selected.maGiaoDich}
                      </p>
                    </div>
                  )}
                  {selected.ghiChu && (
                    <div className="col-span-2 md:col-span-3">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                        Ghi chú
                      </p>
                      <p className="font-medium text-gray-700">{selected.ghiChu}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
