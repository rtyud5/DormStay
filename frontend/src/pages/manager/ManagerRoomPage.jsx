import React, { useState, useEffect } from "react";
import {
  Search, Building2, Filter, BedDouble, Users, RefreshCw, X, ChevronDown, ChevronUp,
} from "lucide-react";
import { getRoomsOverview, updateRoomStatus } from "../../services/manager.service";
import {
  ROOM_STATUS, BED_STATUS, FLOOR_OPTIONS, GENDER_OPTIONS, ROOM_TYPE_OPTIONS,
} from "../../constants/manager.constants";
import ManagerStatusBadge from "../../components/manager/ManagerStatusBadge";

const ROOM_STATUS_OPTS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "SAP_DAY", label: "Sắp đầy" },
  { value: "TRONG", label: "Trống" },
  { value: "DAY", label: "Đầy" },
];

export default function ManagerRoomPage() {
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    floor: "all",
    status: "all",
    gender: "all",
    roomType: "all",
  });
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadRooms();
  }, [filters]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await getRoomsOverview({ ...filters, search });
      setRooms(res.data || []);
      setStats(res.stats || {});
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (roomId, newStatus) => {
    try {
      setUpdating(roomId);
      const res = await updateRoomStatus(roomId, { status: newStatus });
      if (res.success) {
        setRooms((prev) =>
          prev.map((r) => (r.id === roomId ? { ...r, status: newStatus } : r))
        );
      }
    } finally {
      setUpdating(null);
    }
  };

  const toggleExpand = (roomId) =>
    setExpandedRoom((prev) => (prev === roomId ? null : roomId));

  return (
    <div className="p-8 lg:p-10 max-w-[1500px] mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[2rem] font-extrabold text-[#111827] mb-2 tracking-tight">
            Quản lý phòng / giường
          </h1>
          <p className="text-gray-500 font-medium">
            Theo dõi và cập nhật tình trạng phòng, giường trong toàn bộ tòa nhà.
          </p>
        </div>
        <button
          onClick={loadRooms}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> Làm mới dữ liệu
        </button>
      </div>

      {/* KPI chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Tổng phòng", value: stats.total ?? 0, color: "bg-[#0b2447]", text: "text-white", sub: "text-blue-200/80" },
          { label: "Đang ở", value: stats.occupied ?? 0, color: "bg-blue-50", text: "text-blue-700", sub: "text-blue-400" },
          { label: "Đang cọc", value: stats.reserved ?? 0, color: "bg-yellow-50", text: "text-yellow-700", sub: "text-yellow-400" },
          { label: "Trống", value: stats.empty ?? 0, color: "bg-emerald-50", text: "text-emerald-700", sub: "text-emerald-400" },
          { label: "Bảo trì", value: stats.maintenance ?? 0, color: "bg-red-50", text: "text-red-700", sub: "text-red-400" },
        ].map((item) => (
          <div key={item.label} className={`${item.color} rounded-2xl p-5 flex flex-col`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${item.sub}`}>{item.label}</p>
            <p className={`text-4xl font-black leading-none ${item.text}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#f4f7fa] rounded-3xl p-6 mb-8">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadRooms()}
              placeholder="Tìm mã phòng..."
              className="w-full pl-11 pr-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 shadow-sm"
            />
          </div>

          {[
            { label: "Tầng", key: "floor", opts: FLOOR_OPTIONS },
            { label: "Trạng thái", key: "status", opts: ROOM_STATUS_OPTS },
            { label: "Giới tính", key: "gender", opts: GENDER_OPTIONS },
            { label: "Loại phòng", key: "roomType", opts: ROOM_TYPE_OPTIONS },
          ].map(({ label, key, opts }) => (
            <div key={key} className="w-40">
              <select
                value={filters[key]}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-gray-700 shadow-sm text-sm"
              >
                {opts.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          ))}

          <button
            onClick={loadRooms}
            className="px-6 py-3 bg-[#0b2447] text-white rounded-xl hover:bg-blue-900 transition-colors font-bold flex items-center gap-2 h-12 shadow-md shadow-blue-900/20"
          >
            <Filter className="w-4 h-4" /> Áp dụng
          </button>
        </div>
      </div>

      {/* Room Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-[#0b2447] rounded-full animate-spin" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <div className="text-center">
            <BedDouble className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Không tìm thấy phòng nào</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rooms.map((room) => {
            const isExpanded = expandedRoom === room.id;
            const fillRate = Math.round((room.occupiedCount / room.capacity) * 100);

            return (
              <div
                key={room.id}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:border-gray-200 transition-all"
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                          {room.floorLabel} • {room.gender}
                        </span>
                        {room.holdRequests > 0 && (
                          <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                            {room.holdRequests} giữ chỗ
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-extrabold text-[#0b2447]">{room.displayId}</p>
                    </div>
                    <ManagerStatusBadge statusMap={ROOM_STATUS} statusKey={room.status} />
                  </div>

                  {/* Type + Price */}
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-500">Loại: <span className="font-bold text-gray-700">{room.roomTypeLabel}</span></span>
                    <span className="font-bold text-gray-700">{room.price.toLocaleString("vi-VN")}đ/tháng</span>
                  </div>

                  {/* Fill rate */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 bg-[#f4f7fa] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          fillRate >= 90 ? "bg-blue-500" : fillRate >= 60 ? "bg-blue-400" : "bg-emerald-400"
                        }`}
                        style={{ width: `${fillRate}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-gray-500 flex-shrink-0">
                      {room.occupiedCount}/{room.capacity}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleExpand(room.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#f4f7fa] rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <BedDouble className="w-4 h-4" />
                      Chi tiết
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Quick status update */}
                    <select
                      value={room.status}
                      onChange={(e) => handleUpdateStatus(room.id, e.target.value)}
                      disabled={updating === room.id}
                      className="flex-1 px-3 py-2.5 bg-[#0b2447] text-white rounded-xl text-sm font-bold appearance-none focus:outline-none disabled:opacity-60 cursor-pointer"
                    >
                      {["TRONG", "SAP_DAY", "DAY"].map((key) => {
                        const val = ROOM_STATUS[key];
                        return (
                        <option key={key} value={key} className="bg-white text-gray-900">
                          {val.label}
                        </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Expanded beds */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      Chi tiết giường
                    </p>
                    <div className="space-y-2">
                      {room.beds.map((bed) => (
                        <div
                          key={bed.id}
                          className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#f9fafb] hover:bg-[#f4f7fa] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <BedDouble className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-bold text-gray-800">{bed.display}</p>
                              {bed.tenant && (
                                <p className="text-xs text-gray-400">{bed.tenant}</p>
                              )}
                            </div>
                          </div>
                          <ManagerStatusBadge statusMap={BED_STATUS} statusKey={bed.status} size="xs" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
