import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Phone, Mail, MapPin, CreditCard, Shield, User,
  CheckCircle2, XCircle, Clock, Building2, BedDouble, Calendar,
  FileText, AlertCircle
} from "lucide-react";
import { getResidentDetail } from "../../services/manager.service";
import { CONTRACT_STATUS } from "../../constants/manager.constants";
import ManagerStatusBadge from "../../components/manager/ManagerStatusBadge";

export default function ManagerResidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getResidentDetail(id);
        setData(res?.data ?? null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-[#0b2447] rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black tracking-widest text-[#0b2447] uppercase animate-pulse">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle className="w-16 h-16 text-gray-300 mx-auto" />
          <p className="text-gray-500 font-medium">Không tìm thấy hồ sơ cư trú</p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-[#0b2447] text-white rounded-xl font-bold">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const d = data;
  const checklistDone = d.checklist?.filter(c => c.done).length || 0;
  const checklistTotal = d.checklist?.length || 0;

  return (
    <div className="p-6 lg:p-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl lg:text-2xl font-extrabold text-[#0b2447] tracking-tight">
            Hồ sơ khách hàng {d.customerName}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Hero Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#0b2447] to-blue-600 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-900/20 relative overflow-hidden">
                  {d.avatarUrl ? (
                    <img src={d.avatarUrl} alt={d.customerName} className="w-full h-full object-cover" />
                  ) : (
                    d.avatarInitials
                  )}
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="bg-green-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                      Đang lưu trú
                    </span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#0b2447] mb-1">{d.customerName}</h2>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Số CCCD: {d.cccd || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Trạng thái hồ sơ</p>
                    <ManagerStatusBadge statusMap={CONTRACT_STATUS} statusKey={d.contractStatus} />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InfoMini label="Số điện thoại" value={d.phone} icon={<Phone className="w-3.5 h-3.5" />} />
                  <InfoMini label="Email" value={d.email} icon={<Mail className="w-3.5 h-3.5" />} />
                  <InfoMini label="Địa chỉ" value={d.address || "—"} icon={<MapPin className="w-3.5 h-3.5" />} />
                  <InfoMini label="Mã HĐ" value={`HD-${d.id}`} icon={<FileText className="w-3.5 h-3.5" />} />
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {d.emergencyContact?.name && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Liên hệ khẩn cấp</p>
              <div className="flex items-center justify-between bg-[#f4f7fa] rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#0b2447]">{d.emergencyContact.name} ({d.emergencyContact.relation || ""})</p>
                    <p className="text-sm text-gray-500">SĐT: {d.emergencyContact.phone || "—"}</p>
                  </div>
                </div>
                {d.emergencyContact.phone && (
                  <a href={`tel:${d.emergencyContact.phone}`} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#0b2447] hover:bg-gray-50 transition-colors">
                    Gọi ngay
                  </a>
                )}
              </div>
            </div>
          )}

          {/* CCCD Verification */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" /> Xác thực CCCD / Định danh
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Mặt trước</p>
                <div className="aspect-[16/10] bg-[#f4f7fa] rounded-2xl flex items-center justify-center overflow-hidden">
                  {d.cccdFrontUrl ? (
                    <img src={d.cccdFrontUrl} alt="CCCD mặt trước" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">Chưa tải lên</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Mặt sau</p>
                <div className="aspect-[16/10] bg-[#f4f7fa] rounded-2xl flex items-center justify-center overflow-hidden">
                  {d.cccdBackUrl ? (
                    <img src={d.cccdBackUrl} alt="CCCD mặt sau" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">Chưa tải lên</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm">
                {d.cccdFrontUrl && d.cccdBackUrl ? (
                  <><CheckCircle2 className="w-4 h-4 text-green-500" /><span className="text-green-700 font-medium">Chấp định danh hợp lệ</span></>
                ) : (
                  <><Clock className="w-4 h-4 text-yellow-500" /><span className="text-yellow-700 font-medium">Chưa hoàn tất xác thực</span></>
                )}
              </div>
              {d.cccdIssuedDate && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" /> Hết hạn: {new Date(new Date(d.cccdIssuedDate).setFullYear(new Date(d.cccdIssuedDate).getFullYear() + 15)).toLocaleDateString("vi-VN")}
                </div>
              )}
            </div>
          </div>

          {/* Sale Notes */}
          {d.saleNote && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" /> Ghi chú từ Sale
              </p>
              <div className="bg-[#f9fafb] rounded-2xl p-5 border-l-4 border-[#0b2447]">
                <p className="text-sm text-gray-700 italic leading-relaxed">"{d.saleNote}"</p>
                {d.saleNotePerson && (
                  <p className="text-xs text-gray-400 mt-3">
                    Ghi chú bởi: {d.saleNotePerson} — {d.saleNoteDate ? new Date(d.saleNoteDate).toLocaleDateString("vi-VN") : ""}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Checklist */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Checklist hồ sơ</p>
              <span className="text-xs font-bold text-gray-500">Hoàn thành {checklistDone}/{checklistTotal}</span>
            </div>
            <div className="space-y-3">
              {(d.checklist || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2">
                  {item.done ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${item.done ? "text-gray-800" : "text-red-500"}`}>
                    {item.label} {!item.done && "(Chưa ký)"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — 1/3 */}
        <div className="space-y-6">
          {/* Room Info Card */}
          <div className="bg-gradient-to-br from-[#0b2447] to-blue-800 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/20">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-blue-200/80 uppercase tracking-widest">Phòng đăng ký</p>
              <Building2 className="w-5 h-5 text-blue-200/40" />
            </div>
            <p className="text-4xl font-black mb-4">{d.roomNumber ? `P.${d.roomNumber}` : d.roomDisplay}</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-200/80">Loại phòng</span>
                <span className="font-bold">{d.roomType || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200/80">Ngày dọn vào</span>
                <span className="font-bold text-orange-300">{d.moveInDate ? new Date(d.moveInDate).toLocaleDateString("vi-VN") : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200/80">Thời hạn thuê</span>
                <span className="font-bold">{d.rentalDuration ? `${d.rentalDuration} Tháng` : "Không xác định"}</span>
              </div>
              <div className="w-full h-px bg-white/10" />
              <div className="flex justify-between">
                <span className="text-blue-200/80">Giá thuê</span>
                <span className="font-extrabold text-lg text-orange-300">{d.baseRent?.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200/80">Tiền cọc</span>
                <span className="font-bold">{d.deposit?.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </div>

          {/* Contract End */}
          {d.contractEndDate && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Ngày kết thúc HĐ</p>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span className="text-lg font-extrabold text-[#0b2447]">
                  {new Date(d.contractEndDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          )}

          {/* Building Info */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Vị trí</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tòa nhà</span>
                <span className="font-bold text-gray-800">{d.building || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tầng</span>
                <span className="font-bold text-gray-800">{d.floor || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Loại thuê</span>
                <span className="font-bold text-gray-800">{d.rentalType === "PHONG" ? "Thuê phòng" : "Thuê giường"}</span>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-700 mb-1">Lưu ý</p>
                <p className="text-xs text-blue-600 leading-relaxed">
                  Thông tin hồ sơ chỉ dùng để tra cứu. Mọi thay đổi cần liên hệ bộ phận Sale hoặc Kế toán.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoMini({ label, value, icon }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-gray-400">{icon}</span>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-bold text-gray-800 truncate">{value || "—"}</p>
    </div>
  );
}
