import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, CheckCircle2, CalendarDays, Clock3, FileText } from "lucide-react";
import { createSaleCheckoutRequest, getSaleContracts } from "../../services/sale.service";
import { CHECKOUT_REASON_OPTIONS, SALE_ROUTES } from "../../constants/sale.constants";

export default function SaleCheckoutRequestCreatePage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    ngay_yeu_cau_tra_phong: "",
    gio_ban_giao: "",
    reason: CHECKOUT_REASON_OPTIONS[0]?.value || "",
    note: "",
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingContracts(true);
      try {
        const res = await getSaleContracts({ search, trang_thai: "HIEU_LUC" });
        if (!mounted) return;
        setContracts(res.data || []);
        setSelectedContractId((current) => {
          if (current && (res.data || []).some((c) => String(c.id) === String(current))) return current;
          return (res.data || [])[0]?.id || null;
        });
      } finally {
        if (mounted) setLoadingContracts(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [search]);

  const selectedContract = useMemo(
    () => contracts.find((contract) => String(contract.id) === String(selectedContractId)) || null,
    [contracts, selectedContractId]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedContract || !form.ngay_yeu_cau_tra_phong) return;

    setSaving(true);
    try {
      await createSaleCheckoutRequest({
        ma_hop_dong: selectedContract.id,
        ma_ho_so_khach_hang: selectedContract.ma_ho_so_khach_hang,
        ngay_yeu_cau_tra_phong: form.ngay_yeu_cau_tra_phong,
        gio_ban_giao: form.gio_ban_giao || null,
        ly_do: [form.reason, form.note].filter(Boolean).join(" — "),
      });
      navigate(SALE_ROUTES.CHECKOUT_REQUESTS);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 lg:p-10 max-w-[1500px] mx-auto bg-[#f9fafb] min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3a5c] mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div className="mb-8">
        <h1 className="text-[2rem] font-extrabold text-[#1a3a5c] tracking-tight mb-2">
          Ghi nhận yêu cầu trả phòng
        </h1>
        <p className="text-gray-500">
          Chọn hợp đồng và điền thông tin dự kiến để hệ thống lưu yêu cầu trả phòng cho quy trình thanh lý.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <section className="xl:col-span-2 bg-white rounded-[1.75rem] border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-[11px] font-black tracking-[0.22em] text-gray-400 uppercase mb-2">
                Bước 1: Chọn hợp đồng
              </h2>
              <p className="text-sm text-gray-500">
                Tìm hợp đồng đang hiệu lực để ghi nhận yêu cầu trả phòng.
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#eef3f9] text-[#1a3a5c] flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
          </div>

          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-[11px] w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã hợp đồng, tên khách, phòng..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 mb-5">
            <p className="text-sm font-bold text-emerald-800">
              Sau khi ghi nhận, yêu cầu sẽ tự động chuyển sang trạng thái <span className="font-black">Chờ xử lý</span>.
            </p>
            <p className="text-xs text-emerald-700 mt-2">
              Dữ liệu này sẽ được quản lý dùng tiếp cho bước kiểm tra phòng và đối soát hoàn cọc.
            </p>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
            {loadingContracts ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-[#1a3a5c] rounded-full animate-spin" />
              </div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                Không tìm thấy hợp đồng nào phù hợp
              </div>
            ) : (
              contracts.map((contract) => {
                const active = String(contract.id) === String(selectedContractId);
                return (
                  <button
                    key={contract.id}
                    type="button"
                    onClick={() => setSelectedContractId(contract.id)}
                    className={[
                      "w-full text-left rounded-2xl border p-4 transition-all",
                      active
                        ? "border-[#1a3a5c] bg-[#f5f8fc] shadow-sm"
                        : "border-gray-100 bg-white hover:border-blue-200 hover:bg-[#fafcff]",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-black text-[#1a3a5c]">{contract.contractId}</span>
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                            Hiệu lực
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{contract.ho_ten}</p>
                        <p className="text-xs text-gray-500 mt-1">{contract.roomDisplay}</p>
                      </div>
                      <CheckCircle2 className={["w-5 h-5", active ? "text-[#1a3a5c]" : "text-gray-300"].join(" ")} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-600">
                      <div className="rounded-xl bg-white/70 p-3 border border-gray-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Ngày vào ở</p>
                        <p className="font-bold">{contract.ngay_vao_o || "—"}</p>
                      </div>
                      <div className="rounded-xl bg-white/70 p-3 border border-gray-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Số điện thoại</p>
                        <p className="font-bold">{contract.so_dien_thoai || "—"}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="xl:col-span-3 bg-white rounded-[1.75rem] border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-[11px] font-black tracking-[0.22em] text-gray-400 uppercase mb-2">
                Bước 2: Thông tin trả phòng
              </h2>
              <p className="text-sm text-gray-500">
                Điền các thông tin dự kiến để hệ thống ghi nhận yêu cầu.
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#eef3f9] text-[#1a3a5c] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          {selectedContract ? (
            <div className="rounded-2xl border border-gray-100 bg-[#f8fafc] p-5 mb-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400 mb-2">
                    Hợp đồng đã chọn
                  </p>
                  <h3 className="text-lg font-extrabold text-[#0b2447]">{selectedContract.contractId}</h3>
                  <p className="text-sm font-bold text-gray-700 mt-1">{selectedContract.ho_ten}</p>
                  <p className="text-sm text-gray-500">{selectedContract.roomDisplay}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400 mb-1">Tiền cọc</p>
                  <p className="text-lg font-extrabold text-[#0b2447]">{selectedContract.tien_coc}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 mb-6 text-center text-gray-400">
              Chọn một hợp đồng ở bên trái để tiếp tục.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400 mb-2 block">
                Ngày dự kiến trả phòng *
              </span>
              <div className="relative">
                <CalendarDays className="absolute left-3.5 top-[11px] w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  required
                  value={form.ngay_yeu_cau_tra_phong}
                  onChange={(e) => setForm((prev) => ({ ...prev, ngay_yeu_cau_tra_phong: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400 mb-2 block">
                Giờ bàn giao
              </span>
              <div className="relative">
                <Clock3 className="absolute left-3.5 top-[11px] w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={form.gio_ban_giao}
                  onChange={(e) => setForm((prev) => ({ ...prev, gio_ban_giao: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </label>

            <label className="block md:col-span-2">
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400 mb-2 block">
                Lý do trả phòng
              </span>
              <select
                value={form.reason}
                onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {CHECKOUT_REASON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400 mb-2 block">
                Ghi chú thêm
              </span>
              <textarea
                rows={5}
                value={form.note}
                onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                placeholder="Nhập ghi chú chi tiết về tình trạng phòng, lý do đặc biệt hoặc yêu cầu từ khách hàng..."
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
            >
              Huỷ
            </button>

            <button
              type="submit"
              disabled={!selectedContract || saving || !form.ngay_yeu_cau_tra_phong}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0b2447] text-white rounded-2xl font-bold hover:bg-[#081a33] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#0b2447]/20"
            >
              {saving ? "Đang ghi nhận..." : "Ghi nhận yêu cầu trả phòng"}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
