import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, Home, Eye, Phone, MapPin, CreditCard, X } from "lucide-react";
import { getResidents } from "../../services/manager.service";
import { CONTRACT_STATUS, FLOOR_OPTIONS, RENTAL_TYPE_OPTIONS } from "../../constants/manager.constants";
import ManagerStatusBadge from "../../components/manager/ManagerStatusBadge";

export default function ManagerResidentListPage() {
  const navigate = useNavigate();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ floor: "all", rentalType: "all" });
  const [selectedResident, setSelectedResident] = useState(null);

  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = async (overrideFilters) => {
    try {
      setLoading(true);
      const f = overrideFilters ?? filters;
      const res = await getResidents({ ...f, search });
      setResidents(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => loadResidents();

  return (
    <div className="p-8 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[2rem] font-extrabold text-[#111827] mb-2 tracking-tight">
          Hồ sơ cư trú
        </h1>
        <p className="text-gray-500 font-medium">
          Danh sách cư dân đang lưu trú — ấn vào hàng để xem chi tiết thông tin.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[#f4f7fa] rounded-3xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-end">
        {/* Search */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Tìm kiếm
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Tên, số điện thoại, phòng..."
              className="w-full pl-11 pr-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 shadow-sm"
            />
          </div>
        </div>

        {/* Floor filter */}
        <div className="w-44">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Tầng
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <select
              value={filters.floor}
              onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-gray-700 shadow-sm"
            >
              {FLOOR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Rental type filter */}
        <div className="w-44">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Loại thuê
          </label>
          <div className="relative">
            <Home className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <select
              value={filters.rentalType}
              onChange={(e) => setFilters({ ...filters, rentalType: e.target.value })}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-gray-700 shadow-sm"
            >
              {RENTAL_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="px-8 py-3 bg-[#0b2447] text-white rounded-xl hover:bg-blue-900 transition-colors font-bold shadow-md shadow-blue-900/20 flex items-center gap-2 h-12"
        >
          <Search className="w-4 h-4" /> Tìm kiếm
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-[#0b2447] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Cư dân", "Phòng / Giường", "Tầng", "Loại thuê", "Ngày vào ở", "Tiền thuê", "Trạng thái HĐ", ""].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {residents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-gray-400 text-sm">
                      Không tìm thấy cư dân nào phù hợp
                    </td>
                  </tr>
                ) : (
                  residents.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedResident(r)}
                      className="border-b border-gray-50 hover:bg-[#f9fafb] cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {r.avatarInitials}
                          </div>
                          <div>
                            <p className="font-bold text-[#111827] text-sm">{r.customerName}</p>
                            <p className="text-xs text-gray-400">{r.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                          {r.roomDisplay}{r.bedDisplay ? ` — ${r.bedDisplay}` : ""}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 font-medium">Tầng {r.floor}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {r.rentalType === "PHONG" ? "Thuê phòng" : "Thuê giường"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {new Date(r.checkInDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-extrabold text-[#111827] text-sm">
                          {r.baseRent.toLocaleString("vi-VN")}đ
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <ManagerStatusBadge statusMap={CONTRACT_STATUS} statusKey={r.status} />
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedResident(r); }}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 hover:text-blue-700 flex items-center justify-center text-gray-500 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 font-medium">
                Hiển thị <span className="text-gray-900 font-bold">{residents.length}</span> cư dân
              </p>
            </div>
          </>
        )}
      </div>

      {/* Resident Detail Drawer / Modal */}
      {selectedResident && (
        <ResidentDetailDrawer
          resident={selectedResident}
          onClose={() => setSelectedResident(null)}
        />
      )}
    </div>
  );
}

function ResidentDetailDrawer({ resident: r, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 flex items-center justify-between px-8 py-5 z-10">
          <h2 className="text-lg font-extrabold text-[#0b2447]">Chi tiết cư dân</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Avatar + Name */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0b2447] to-blue-700 flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {r.avatarInitials}
            </div>
            <div>
              <p className="text-xl font-extrabold text-[#0b2447]">{r.customerName}</p>
              <p className="text-sm text-gray-400 font-medium">Mã HĐ: {r.id}</p>
              <div className="mt-1">
                <ManagerStatusBadge statusMap={CONTRACT_STATUS} statusKey={r.status} />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <Section title="Thông tin liên hệ">
            <InfoRow icon={<Phone className="w-4 h-4" />} label="Điện thoại" value={r.phone} />
            <InfoRow icon={<CreditCard className="w-4 h-4" />} label="CCCD" value={r.cccd} />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Địa chỉ" value={r.address} />
          </Section>

          {/* Contract Info */}
          <Section title="Thông tin thuê phòng">
            <InfoRow label="Phòng / Giường" value={`${r.roomDisplay}${r.bedDisplay ? ` — ${r.bedDisplay}` : ""}`} />
            <InfoRow label="Tầng" value={`Tầng ${r.floor}`} />
            <InfoRow label="Loại thuê" value={r.rentalType === "PHONG" ? "Thuê phòng" : "Thuê giường"} />
            <InfoRow label="Ngày vào ở" value={new Date(r.checkInDate).toLocaleDateString("vi-VN")} />
            <InfoRow label="Tiền thuê / tháng" value={`${r.baseRent.toLocaleString("vi-VN")}đ`} />
            <InfoRow label="Tiền cọc" value={`${r.deposit.toLocaleString("vi-VN")}đ`} />
          </Section>

          {/* Emergency Contact */}
          <Section title="Liên hệ khẩn cấp">
            <InfoRow label="Họ tên" value={r.emergencyContact?.name ?? "—"} />
            <InfoRow label="Điện thoại" value={r.emergencyContact?.phone ?? "—"} />
            <InfoRow label="Quan hệ" value={r.emergencyContact?.relation ?? "—"} />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{title}</p>
      <div className="bg-[#f9fafb] rounded-2xl p-5 space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      {icon && <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>}
      <div className="flex-1 flex justify-between gap-4">
        <span className="text-xs text-gray-500 font-medium flex-shrink-0">{label}</span>
        <span className="text-sm font-bold text-[#111827] text-right">{value ?? "—"}</span>
      </div>
    </div>
  );
}
