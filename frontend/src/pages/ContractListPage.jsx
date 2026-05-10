import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ContractService from "../services/contract.service";
import { formatCurrency, formatDate } from "../lib/format";

const ACTIVE_STATUSES = new Set(["HIEU_LUC", "DANG_HIEU_LUC"]);
const ENDED_STATUSES = new Set(["HET_HAN", "DA_KET_THUC", "DA_THANH_LY", "HOAN_TAT"]);

const STATUS_META = {
  HIEU_LUC: {
    label: "Đang hiệu lực",
    className: "bg-emerald-600/90 text-white",
    dotClassName: "bg-white animate-pulse",
  },
  DANG_HIEU_LUC: {
    label: "Đang hiệu lực",
    className: "bg-emerald-600/90 text-white",
    dotClassName: "bg-white animate-pulse",
  },
  HET_HAN: {
    label: "Đã hết hiệu lực",
    className: "bg-slate-700/90 text-white",
    dotClassName: "bg-slate-200",
  },
  DA_KET_THUC: {
    label: "Đã hết hiệu lực",
    className: "bg-slate-700/90 text-white",
    dotClassName: "bg-slate-200",
  },
  CHO_LAP_KHOAN_THU_DAU: {
    label: "Chờ lập khoản thu đầu",
    className: "bg-blue-600/90 text-white",
    dotClassName: "bg-white",
  },
  CHO_THANH_TOAN_KY_DAU: {
    label: "Chờ thanh toán",
    className: "bg-amber-500/90 text-white",
    dotClassName: "bg-white",
  },
};

function getStatusMeta(status) {
  const value = String(status || "").toUpperCase();
  return (
    STATUS_META[value] || {
      label: value || "Chưa cập nhật",
      className: "bg-slate-500/90 text-white",
      dotClassName: "bg-white",
    }
  );
}

function getRoomDisplay(contract) {
  const room = contract?.phong?.ma_phong_hien_thi;
  const allocationBeds = (contract?.phan_bo_hop_dong || [])
    .map((item) => item.giuong?.ma_giuong_hien_thi || (item.ma_giuong ? `B${item.ma_giuong}` : ""))
    .filter(Boolean);
  const beds = allocationBeds.length ? allocationBeds.join(", ") : contract?.ma_giuong ? `B${contract.ma_giuong}` : "";

  if (!room) return beds || "Đang cập nhật";
  return beds ? `P. ${room} - ${beds}` : `P. ${room}`;
}

function ContractListPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContracts() {
      try {
        const res = await ContractService.getList();
        setContracts(res.data.data || []);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách hợp đồng:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchContracts();
  }, []);

  const stats = useMemo(() => {
    const active = contracts.filter((contract) => ACTIVE_STATUSES.has(String(contract.trang_thai || "").toUpperCase()));
    const ended = contracts.filter((contract) => ENDED_STATUSES.has(String(contract.trang_thai || "").toUpperCase()));

    return {
      total: contracts.length,
      active: active.length,
      ended: ended.length,
    };
  }, [contracts]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0052CC] border-t-transparent" />
          <p className="font-bold text-[#64748B]">Đang tải danh sách hợp đồng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-12 font-sans text-[#0F172A]">
      <div className="mb-10 pt-2">
        <h1 className="mb-2 text-[28px] font-extrabold uppercase tracking-tight">Hợp đồng của tôi</h1>
        <p className="max-w-2xl text-[15px] font-medium leading-relaxed text-[#64748B]">
          Xem danh sách hợp đồng cư trú, trạng thái hiệu lực và hóa đơn gắn với từng hợp đồng.
        </p>
      </div>

      {contracts.length === 0 ? (
        <div className="flex flex-col items-center rounded-[32px] border border-slate-100 bg-white p-12 text-center shadow-sm md:p-20">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] bg-[#F1F5F9] text-[#94A3B8] ring-8 ring-[#F8FAFC]">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="mb-4 text-[28px] font-extrabold text-[#1E293B]">Bạn chưa có hợp đồng nào</h2>
          <p className="mx-auto mb-10 max-w-md text-[16px] font-medium leading-relaxed text-[#64748B]">
            Tài khoản chưa ghi nhận hợp đồng cư trú. Hãy chọn phòng phù hợp để bắt đầu đăng ký.
          </p>
          <Link to="/rooms" className="rounded-2xl bg-[#0A192F] px-8 py-4 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#0052CC]">
            Tìm và đặt phòng
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-10 grid gap-6 md:grid-cols-3">
            {[
              { label: "Tổng hợp đồng", value: stats.total, color: "text-slate-900", bg: "bg-slate-100" },
              { label: "Đang hiệu lực", value: stats.active, color: "text-emerald-700", bg: "bg-emerald-100" },
              { label: "Hết hiệu lực", value: stats.ended, color: "text-slate-700", bg: "bg-slate-200" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}>
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-[#64748B]">{item.label}</p>
                  <p className="text-[30px] font-black leading-none text-[#0F172A]">{String(item.value).padStart(2, "0")}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-12 grid gap-8 lg:grid-cols-2">
            {contracts.map((contract) => {
              const statusMeta = getStatusMeta(contract.trang_thai);

              return (
                <div
                  key={contract.ma_hop_dong}
                  className="group relative flex flex-col gap-6 overflow-hidden rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-lg sm:flex-row"
                >
                  <div className="relative h-[220px] w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-auto sm:min-h-[250px] sm:w-[210px]">
                    <img
                      src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"
                      alt="Room"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/65 via-transparent to-transparent" />
                    <div className="absolute left-4 top-4 z-10">
                      <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${statusMeta.className}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotClassName}`} />
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col py-2">
                    <h2 className="mb-1 text-[26px] font-black uppercase leading-tight text-[#0F172A]">
                      {getRoomDisplay(contract)}
                    </h2>
                    <p className="mb-6 text-[13px] font-bold text-[#64748B]">Mã HĐ: #{contract.ma_hop_dong}</p>

                    <div className="mb-6 grid grid-cols-2 gap-4">
                      <div>
                        <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Ngày bắt đầu</p>
                        <p className="text-sm font-extrabold text-[#0F172A]">{formatDate(contract.ngay_vao_o)}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Tiền thuê</p>
                        <p className="text-sm font-extrabold text-[#0F172A]">{formatCurrency(contract.gia_thue_co_ban_thang || 0)}</p>
                      </div>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Tiền cọc</p>
                        <p className="text-xl font-black text-[#0F172A]">{formatCurrency(contract.so_tien_dat_coc_bao_dam || 0)}</p>
                      </div>
                      <Link
                        to={`/contracts/${contract.ma_hop_dong}`}
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0A192F] text-white shadow-lg transition hover:bg-[#0052CC]"
                        title="Xem chi tiết"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="rounded-[32px] border border-slate-800 bg-[#1E293B] p-8 text-white shadow-2xl md:p-10">
        <h2 className="mb-4 text-[26px] font-black leading-tight">Lưu ý cư trú</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "Thanh toán tiền phòng đúng hạn theo thông báo trên từng hóa đơn.",
            "Khi hợp đồng hết hiệu lực, xem trang Thanh lý hợp đồng để đọc khoản khấu hao, % được hoàn và trạng thái phiếu.",
            "Thanh toán phát sinh làm trực tiếp trên trang Thanh lý hợp đồng, còn phiếu hoàn cọc chỉ cần kiểm tra số tiền và liên hệ Zalo DormStay.",
          ].map((text) => (
            <div key={text} className="rounded-2xl bg-white/5 p-4 text-sm font-medium leading-relaxed text-slate-200 ring-1 ring-white/10">
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ContractListPage;
