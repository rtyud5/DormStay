import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Search,
  Filter,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { getReconciliations, getReconciliationDetail, updateReconciliation } from "../../services/accounting.service";
import { formatCurrency } from "../../utils/accounting.utils";

export default function AccountingReconciliationPage() {
  const [reconciliations, setReconciliations] = useState([]);
  const [selectedReconciliation, setSelectedReconciliation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadReconciliations();
  }, []);

  const loadReconciliations = async () => {
    try {
      setLoading(true);
      const listResponse = await getReconciliations();
      const records = listResponse.data || [];
      setReconciliations(records);

      if (records[0]?.id) {
        const detailResponse = await getReconciliationDetail(records[0].id);
        setSelectedReconciliation(detailResponse.data || null);
      } else {
        setSelectedReconciliation(null);
      }
    } catch (error) {
      console.error("Error loading reconciliations:", error);
      setReconciliations([]);
      setSelectedReconciliation(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredReconciliations = useMemo(
    () =>
      reconciliations.filter((item) => {
        const matchesQuery =
          !query ||
          [item.id, item.contractId, item.customerName, item.status]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query.toLowerCase()));
        const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
        return matchesQuery && matchesStatus;
      }),
    [query, reconciliations, statusFilter],
  );

  const totals = useMemo(
    () =>
      reconciliations.reduce(
        (accumulator, item) => {
          accumulator.incoming += Number(item.incomingAmount || 0);
          accumulator.outgoing += Number(item.outgoingAmount || 0);
          accumulator.difference += Number(item.differenceAmount || 0);
          if (item.status === "MATCHED") {
            accumulator.matched += 1;
          }
          return accumulator;
        },
        { incoming: 0, outgoing: 0, difference: 0, matched: 0 },
      ),
    [reconciliations],
  );

  const matchRate = reconciliations.length ? Math.round((totals.matched / reconciliations.length) * 1000) / 10 : 0;

  const handleSelect = async (reconciliationId) => {
    try {
      const detailResponse = await getReconciliationDetail(reconciliationId);
      setSelectedReconciliation(detailResponse.data || null);
    } catch (error) {
      console.error("Error loading reconciliation detail:", error);
    }
  };

  const handleStatusUpdate = async (record, nextStatus) => {
    try {
      setSavingId(record.id);
      const response = await updateReconciliation(record.id, { status: nextStatus });
      const updated = response.data;
      setReconciliations((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      setSelectedReconciliation((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
    } catch (error) {
      console.error("Error updating reconciliation:", error);
      window.alert("Không thể cập nhật trạng thái đối soát. Kiểm tra console để xem chi tiết.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] px-8 py-10 lg:px-12">
      <div className="max-w-360 mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-[2.4rem] font-black tracking-tight text-[#0b2447] leading-none mb-3">
              Đối soát tài chính
            </h1>
            <p className="text-gray-500 max-w-2xl font-medium">
              Kiểm tra các bản ghi đối soát thật từ backend, mở chi tiết và cập nhật trạng thái xử lý.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadReconciliations}
              className="px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
            >
              Làm mới
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Tổng bản ghi đối soát"
            value={reconciliations.length}
            description="Số bản ghi lấy trực tiếp từ API đối soát."
          />
          <StatCard
            label="Sai lệch cần xử lý"
            value={filteredReconciliations.filter((item) => Number(item.differenceAmount || 0) > 0).length}
            description="Các bản ghi còn chênh lệch hoặc chưa chốt."
            danger
          />
          <StatCard
            label="Tỷ lệ khớp"
            value={`${matchRate}%`}
            description="Tỷ lệ bản ghi đang ở trạng thái MATCHED."
            dark
          />
        </div>

        <div className="bg-white rounded-4xl p-5 border border-gray-100 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
          <div className="flex-1 flex items-center gap-3 bg-[#f4f7fa] px-5 py-3 rounded-full">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo mã đối soát / hợp đồng / khách thuê"
              className="bg-transparent outline-none text-sm font-medium w-full text-gray-700 placeholder:text-gray-400"
            />
          </div>

          <label className="px-5 py-3 rounded-full border border-gray-200 bg-white font-bold text-sm text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="bg-transparent outline-none"
            >
              <option value="ALL">Tất cả</option>
              <option value="PENDING">Pending</option>
              <option value="MISMATCH">Mismatch</option>
              <option value="MATCHED">Matched</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.9fr] gap-8 items-start">
          <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-[#f9fafb]">
              <div>
                <h2 className="text-[14px] font-black tracking-widest text-[#0b2447] uppercase">Danh sách đối soát</h2>
                <p className="text-sm text-gray-500 font-medium mt-2">
                  Nhấn vào từng bản ghi để xem chi tiết và xử lý.
                </p>
              </div>
              <span className="text-[11px] font-black tracking-widest text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                {filteredReconciliations.length} RECORDS
              </span>
            </div>

            {loading && <div className="px-8 py-10 text-sm text-gray-400">Đang tải dữ liệu đối soát...</div>}
            {!loading && filteredReconciliations.length === 0 && (
              <div className="px-8 py-10 text-sm text-gray-400">Không có bản ghi đối soát phù hợp bộ lọc.</div>
            )}

            <div className="divide-y divide-gray-100">
              {filteredReconciliations.map((item) => {
                const isMismatch = Number(item.differenceAmount || 0) > 0 || item.status === "MISMATCH";
                return (
                  <div
                    key={item.id}
                    className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-[#fafcff] transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-[#f4f7fa] flex items-center justify-center shrink-0">
                        {isMismatch ? (
                          <AlertTriangle className="w-5 h-5 text-[#d97706]" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-[#16a34a]" />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="font-black text-[#111827] text-[1.05rem]">
                            {item.customerName || item.contractId || `Đối soát #${item.id}`}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase ${isMismatch ? "bg-[#fff7ed] text-[#b45309]" : "bg-[#f0fdf4] text-[#15803d]"}`}
                          >
                            {item.status || (isMismatch ? "MISMATCH" : "MATCHED")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-2xl">
                          Hợp đồng: {item.contractId || "--"} | Chênh lệch: {formatCurrency(item.differenceAmount || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 justify-between md:justify-end">
                      <div className="text-right">
                        <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-1">Ảnh hưởng</p>
                        <p className={`font-black text-lg ${isMismatch ? "text-[#b45309]" : "text-[#16a34a]"}`}>
                          {formatCurrency(item.differenceAmount || 0)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleSelect(item.id)}
                        className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6 sticky top-10">
            <div className="bg-white rounded-4xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-5 h-5 text-[#0b2447]" />
                <h2 className="text-[13px] font-black tracking-widest text-[#0b2447] uppercase">
                  Kết luận phiên đối soát
                </h2>
              </div>

              <div className="space-y-5">
                <MoneyFlowRow label="Dòng tiền vào" value={totals.incoming} positive />
                <MoneyFlowRow label="Dòng tiền ra" value={totals.outgoing} />
                <div className="h-px bg-gray-100"></div>
                <div>
                  <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2">
                    Chênh lệch cần xử lý
                  </p>
                  <p className="text-[2rem] font-black text-[#e02424] tracking-tight leading-none">
                    {formatCurrency(totals.difference)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0b2447] rounded-4xl p-8 text-white shadow-xl shadow-[#0b2447]/20 relative overflow-hidden">
              <p className="text-[10px] font-black tracking-widest text-blue-200 uppercase mb-3 relative z-10">
                Chi tiết đang chọn
              </p>
              <h3 className="text-[1.4rem] font-black leading-tight relative z-10 mb-4">
                {selectedReconciliation?.customerName || selectedReconciliation?.contractId || "Chưa chọn bản ghi"}
              </h3>
              <p className="text-sm text-blue-100 leading-relaxed font-medium relative z-10 mb-3">
                Mã hợp đồng: {selectedReconciliation?.contractId || "--"}
              </p>
              <p className="text-sm text-blue-100 leading-relaxed font-medium relative z-10 mb-6">
                Trạng thái: {selectedReconciliation?.status || "--"}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6 relative z-10 text-sm font-semibold">
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  Thu vào: {formatCurrency(selectedReconciliation?.incomingAmount || 0)}
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  Chi ra: {formatCurrency(selectedReconciliation?.outgoingAmount || 0)}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 relative z-10">
                <button
                  onClick={() => selectedReconciliation && handleStatusUpdate(selectedReconciliation, "MATCHED")}
                  disabled={!selectedReconciliation || savingId === selectedReconciliation?.id}
                  className="w-full bg-white text-[#0b2447] rounded-full py-3.5 font-black hover:bg-blue-50 transition-colors disabled:opacity-60"
                >
                  Đánh dấu đã khớp
                </button>
                <button
                  onClick={() => selectedReconciliation && handleStatusUpdate(selectedReconciliation, "MISMATCH")}
                  disabled={!selectedReconciliation || savingId === selectedReconciliation?.id}
                  className="w-full border border-white/30 text-white rounded-full py-3.5 font-black hover:bg-white/10 transition-colors disabled:opacity-60"
                >
                  Đánh dấu sai lệch
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, description, dark = false, danger = false }) {
  if (dark) {
    return (
      <div className="bg-[#0b2447] rounded-4xl p-8 shadow-xl shadow-[#0b2447]/20 text-white relative overflow-hidden">
        <p className="text-[10px] font-black tracking-widest text-blue-200 uppercase mb-3 relative z-10">{label}</p>
        <div className="text-[2.4rem] font-black text-white leading-none relative z-10">{value}</div>
        <p className="text-sm text-blue-100 font-medium mt-4 relative z-10">{description}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-4xl p-8 border border-gray-100 shadow-sm">
      <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3">{label}</p>
      <div className={`text-[2.4rem] font-black leading-none ${danger ? "text-[#e02424]" : "text-[#0b2447]"}`}>
        {value}
      </div>
      <p className="text-sm text-gray-500 font-medium mt-4">{description}</p>
    </div>
  );
}

function MoneyFlowRow({ label, value, positive = false }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2">{label}</p>
        <p className={`text-xl font-black ${positive ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
          {formatCurrency(value)}
        </p>
      </div>
      {positive ? (
        <ArrowUpRight className="w-5 h-5 text-[#16a34a]" />
      ) : (
        <ArrowDownLeft className="w-5 h-5 text-[#dc2626]" />
      )}
    </div>
  );
}
