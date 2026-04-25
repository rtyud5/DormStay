import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, PauseCircle, AlertCircle } from "lucide-react";
import { getSaleRentalRequestDetail, processSaleRentalRequest } from "../../services/sale.service";
import { RENTAL_REQUEST_STATUS } from "../../constants/sale.constants";
import SaleStatusBadge from "../../components/sale/SaleStatusBadge";

export default function SaleRentalRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [note, setNote] = useState("");
  const [showNoteFor, setShowNoteFor] = useState(null); // action string

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSaleRentalRequestDetail(id);
      setData(res?.data ?? res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleProcess = async (action) => {
    setProcessing(true);
    try {
      await processSaleRentalRequest(id, { action, ghi_chu: note });
      setShowNoteFor(null);
      setNote("");
      await load();
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-[#1a3a5c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-400">
        Không tìm thấy yêu cầu thuê
      </div>
    );
  }

  const canProcess = ["DANG_XU_LY", "MOI_TAO", "CHO_THANH_TOAN", "DA_COC"].includes(data.trang_thai);

  return (
    <div className="p-8 lg:p-10 max-w-5xl mx-auto bg-[#f9fafb] min-h-screen">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3a5c] mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a3a5c]">{data.id}</h1>
          <p className="text-gray-500 text-sm mt-1">Ngày tạo: {data.date}</p>
        </div>
        <SaleStatusBadge statusMap={RENTAL_REQUEST_STATUS} statusKey={data.trang_thai} size="sm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-4">
              Thông tin khách hàng
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">
                {data.ho_ten?.charAt(0) || "?"}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{data.ho_ten}</p>
                <p className="text-sm text-gray-500">{data.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Số điện thoại", value: data.so_dien_thoai },
                { label: "Loại thuê", value: data.loai_muc_tieu === "PHONG" ? "Thuê nguyên phòng" : "Thuê giường ghép" },
                { label: "Phòng", value: data.roomName },
                { label: "Ngày dự kiến vào ở", value: data.ngay_du_kien_vao_o ? new Date(data.ngay_du_kien_vao_o).toLocaleDateString("vi-VN") : "—" },
                { label: "Giá thuê/tháng", value: data.gia_thue_thang_fmt },
                { label: "Tiền cọc", value: data.so_tien_dat_coc_fmt },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#f8fafc] rounded-xl p-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm font-bold text-gray-800">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Beds */}
          {data.beds?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-4">
                Giường đã giữ chỗ
              </h2>
              <div className="space-y-2">
                {data.beds.map((bed) => (
                  <div key={bed.id} className="flex items-center justify-between bg-[#f8fafc] rounded-xl px-4 py-3">
                    <span className="text-sm font-bold text-gray-800">Giường {bed.display}</span>
                    <span className="text-xs text-gray-500">{bed.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoice */}
          {data.hoa_don?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-4">
                Hóa đơn
              </h2>
              {data.hoa_don.map((hd) => (
                <div key={hd.ma_hoa_don} className="flex items-center justify-between bg-[#f8fafc] rounded-xl px-4 py-3">
                  <span className="text-sm font-bold text-gray-800">HD #{hd.ma_hoa_don}</span>
                  <span className="text-sm text-gray-600">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(hd.tong_so_tien)}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${hd.trang_thai === "DA_THANH_TOAN" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {hd.trang_thai}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right - Actions + Logs */}
        <div className="space-y-6">
          {/* Action Panel */}
          {canProcess && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-4">
                Xử lý yêu cầu
              </h2>

              {showNoteFor ? (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-gray-700">
                    {showNoteFor === "DUYET" && "Xác nhận duyệt yêu cầu"}
                    {showNoteFor === "TU_CHOI" && "Lý do từ chối"}
                    {showNoteFor === "TAM_DUNG" && "Lý do tạm dừng"}
                    {showNoteFor === "YEU_CAU_BO_SUNG" && "Yêu cầu bổ sung thông tin gì?"}
                  </p>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú (tuỳ chọn)..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleProcess(showNoteFor)}
                      disabled={processing}
                      className="flex-1 py-2.5 bg-[#1a3a5c] text-white rounded-xl text-sm font-bold hover:bg-[#142d47] transition-colors disabled:opacity-50"
                    >
                      {processing ? "Đang xử lý..." : "Xác nhận"}
                    </button>
                    <button
                      onClick={() => { setShowNoteFor(null); setNote(""); }}
                      className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                    >
                      Huỷ
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowNoteFor("DUYET")}
                    className="w-full flex items-center gap-2 py-3 px-4 bg-green-50 text-green-700 rounded-xl text-sm font-bold hover:bg-green-100 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Duyệt yêu cầu
                  </button>
                  <button
                    onClick={() => setShowNoteFor("TU_CHOI")}
                    className="w-full flex items-center gap-2 py-3 px-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Từ chối
                  </button>
                  <button
                    onClick={() => setShowNoteFor("TAM_DUNG")}
                    className="w-full flex items-center gap-2 py-3 px-4 bg-yellow-50 text-yellow-700 rounded-xl text-sm font-bold hover:bg-yellow-100 transition-colors"
                  >
                    <PauseCircle className="w-4 h-4" /> Tạm dừng
                  </button>
                  <button
                    onClick={() => setShowNoteFor("YEU_CAU_BO_SUNG")}
                    className="w-full flex items-center gap-2 py-3 px-4 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors"
                  >
                    <AlertCircle className="w-4 h-4" /> Yêu cầu bổ sung
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Activity Log */}
          {data.logs?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-4">
                Lịch sử xử lý
              </h2>
              <div className="space-y-4">
                {data.logs.map((log) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-700">
                        {log.from || "—"} → {log.to}
                      </p>
                      {log.note && <p className="text-xs text-gray-500 mt-0.5">{log.note}</p>}
                      <p className="text-[10px] text-gray-400 mt-0.5">{log.by} · {log.at}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}