import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { getSaleRentalRequestDetail } from "../../services/sale.service";
import { RENTAL_REQUEST_STATUS } from "../../constants/sale.constants";
import SaleStatusBadge from "../../components/sale/SaleStatusBadge.jsx";

export default function SaleRentalRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSaleRentalRequestDetail(id);
      setData(res?.data ?? res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

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

  return (
    <div className="p-8 lg:p-10 max-w-5xl mx-auto bg-[#f9fafb] min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3a5c] mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a3a5c]">{data.id}</h1>
          <p className="text-gray-500 text-sm mt-1">Ngày tạo: {data.date}</p>
        </div>
        <SaleStatusBadge statusMap={RENTAL_REQUEST_STATUS} statusKey={data.trang_thai} size="sm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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

          {data.hoa_don?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-4">
                Hóa đơn
              </h2>
              <div className="space-y-2">
                {data.hoa_don.map((hd) => (
                  <div key={hd.ma_hoa_don} className="flex items-center justify-between bg-[#f8fafc] rounded-xl px-4 py-3 gap-3">
                    <span className="text-sm font-bold text-gray-800">HD #{hd.ma_hoa_don}</span>
                    <span className="text-sm text-gray-600">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(hd.tong_so_tien)}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${hd.trang_thai === "DA_THANH_TOAN" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {hd.trang_thai}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-4">
              Hồ sơ thuê
            </h2>
            <div className="flex items-center gap-3 bg-[#f8fafc] rounded-xl p-4">
              <FileText className="w-4 h-4 text-[#1a3a5c]" />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Trạng thái</p>
                <SaleStatusBadge statusMap={RENTAL_REQUEST_STATUS} statusKey={data.trang_thai} size="sm" />
              </div>
            </div>
          </div>

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
