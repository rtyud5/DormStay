import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import RoomService from "../services/room.service";
import RentalRequestService from "../services/rentalRequest.service";
import { formatCurrency } from "../utils/accounting.utils";


function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentInitiated, setPaymentInitiated] = useState(false); // Thay vì showPayment

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    idCard: "",
    expectedDate: "",
    note: "",
  });
  const [selectedBeds, setSelectedBeds] = useState([]);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [roomRes, bedsRes] = await Promise.all([
          RoomService.getRoomDetail(id),
          RoomService.getRoomBeds(id),
        ]);
        setRoom(roomRes.data.data);
        setBeds(bedsRes.data.data || []);
        console.log("Chi tiết phòng:", roomRes.data.data);
        console.log("Danh sách giường:", bedsRes.data.data);
      } catch (err) {
        console.error("Lỗi tải trang đặt phòng:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const allBedsEmpty =
    beds.length > 0 &&
    beds.every((b) => b.status === "CON_TRONG");

  const handleInputChange = (e) => {
    if (paymentInitiated) return; // Không cho sửa khi đang thanh toán
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleBed = (bedId, bedStatus) => {
    if (paymentInitiated) return;
    if (bedStatus !== "CON_TRONG") return;

    setSelectedBeds((prev) => {
      if (prev.includes(bedId)) return prev.filter((id) => id !== bedId);
      return [...prev, bedId];
    });
  };

  const rentWholeRoom = async () => {
    if (paymentInitiated) return;
    if (!allBedsEmpty) return;

    // Refresh bed data to check latest availability
    try {
      const bedsRes = await RoomService.getRoomBeds(id);
      const latestBeds = bedsRes.data.data || [];
      const latestAllBedsEmpty = latestBeds.length > 0 && latestBeds.every((b) => b.status === "CON_TRONG");
      
      if (!latestAllBedsEmpty) {
        alert("Không thể đặt cọc nguyên phòng vì một số giường đã được đặt. Vui lòng chọn giường riêng lẻ.");
        setBeds(latestBeds);
        return;
      }
      
      setBeds(latestBeds);
      
      if (selectedBeds.length === latestBeds.length) {
        setSelectedBeds([]);
      } else {
        setSelectedBeds(latestBeds.map((b) => b.id));
      }
    } catch (err) {
      console.error("Lỗi refresh dữ liệu giường:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      alert("Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.");
      return;
    }
    if (selectedBeds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 giường.");
      return;
    }

    setPaymentInitiated(true);
    
    try {
      // Refresh bed data to check for latest availability
      const bedsRes = await RoomService.getRoomBeds(id);
      const latestBeds = bedsRes.data.data || [];
      
      // Check if selected beds are still available
      const unavailableBeds = selectedBeds.filter(bedId => {
        const bed = latestBeds.find(b => b.id === bedId);
        return !bed || bed.status !== "CON_TRONG";
      });
      
      if (unavailableBeds.length > 0) {
        alert("Một số giường đã không còn trống. Vui lòng chọn lại giường.");
        setBeds(latestBeds);
        setSelectedBeds([]);
        setPaymentInitiated(false);
        return;
      }
      
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        idCard: formData.idCard,
        loai_muc_tieu: selectedBeds.length === beds.length ? 'PHONG' : 'GIUONG',
        ma_phong: room.id,
        selectedBeds,
        ngay_du_kien_vao_o: formData.expectedDate,
        gia_thue_thang: parseInt(room.price.replace(/[^\d]/g, "")),
        so_tien_dat_coc: depositAmount,
        trang_thai: 'DANG_XU_LY',
        ghi_chu_khach_hang: formData.note || "",
      };
      
      const res = await RentalRequestService.create(payload);
      const newRequest = res.data.data;
      
      // RPC returns jsonb — ma_yeu_cau_thue is inside
      const requestId = newRequest?.ma_yeu_cau_thue || newRequest?.rawId;
      navigate(`/rental-requests/${requestId}`);
    } catch (err) {
      console.error("Lỗi tạo yêu cầu:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Có lỗi xảy ra khi tạo yêu cầu thuê. Vui lòng thử lại.";
      
      // Handle specific database constraint errors
      if (errMsg.includes("uq_giu_cho_tam_active_bed") || errMsg.includes("duplicate key value") || errMsg.includes("active holds")) {
        alert("Một hoặc nhiều giường đã được đặt cọc bởi người khác. Vui lòng chọn giường khác hoặc thử lại sau.");
        // Refresh bed data
        try {
          const bedsRes = await RoomService.getRoomBeds(id);
          setBeds(bedsRes.data.data || []);
          setSelectedBeds([]);
        } catch (refreshErr) {
          console.error("Lỗi refresh dữ liệu giường:", refreshErr);
        }
      } else {
        alert(errMsg);
      }
      
      setPaymentInitiated(false);
    }
  };

  // Tính số tiền đặt cọc dựa trên giường đã chọn
  const depositAmount =
    room && room.price
      ? parseInt(room.price.replace(/[^\d]/g, "")) * selectedBeds.length * 2 // Tiền cọc = (Tiền thuê 2 tháng) × (Số giường thuê).
      : 0;

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy phòng</h2>
          <Link to="/rooms" className="text-[#0052CC] hover:underline">
            Quay lại danh sách phòng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F6] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-[32px] font-extrabold text-[#0F172A] mb-3 tracking-tight">
            Đặt cọc phòng
          </h1>
          <p className="text-[#64748B] text-[15px] font-medium">
            Hoàn tất đặt cọc để giữ phòng tại{" "}
            <span className="text-[#0052CC] font-bold">
              DormStay Premium Residents.
            </span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Form Left Column */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Thông tin cá nhân */}
              <div className="relative pl-12">
                <div className="absolute left-0 top-6 w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm tracking-tighter">
                  1
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <svg
                      className="w-5 h-5 text-[#0F172A]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <h2 className="text-[18px] font-extrabold text-[#0F172A]">
                      Thông tin cá nhân
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest mb-1.5">
                        HỌ VÀ TÊN
                      </label>
                      <input
                        required
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        disabled={paymentInitiated}
                        className="w-full bg-[#F1F5F9] border border-transparent focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] outline-none rounded-xl px-4 py-3 text-[14px] font-medium text-[#0F172A] transition-all disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest mb-1.5">
                        SỐ ĐIỆN THOẠI
                      </label>
                      <input
                        required
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={paymentInitiated}
                        className="w-full bg-[#F1F5F9] border border-transparent focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] outline-none rounded-xl px-4 py-3 text-[14px] font-medium text-[#0F172A] transition-all disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest mb-1.5">
                        EMAIL
                      </label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={paymentInitiated}
                        className="w-full bg-[#F1F5F9] border border-transparent focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] outline-none rounded-xl px-4 py-3 text-[14px] font-medium text-[#0F172A] transition-all disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest mb-1.5">
                        SỐ CCCD/PASSPORT
                      </label>
                      <input
                        required
                        type="text"
                        name="idCard"
                        value={formData.idCard}
                        onChange={handleInputChange}
                        disabled={paymentInitiated}
                        className="w-full bg-[#F1F5F9] border border-transparent focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] outline-none rounded-xl px-4 py-3 text-[14px] font-medium text-[#0F172A] transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Chi tiết thuê phòng */}
              <div className="relative pl-12">
                <div className="absolute left-0 top-6 w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm tracking-tighter">
                  2
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <svg
                      className="w-5 h-5 text-[#0F172A]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <h2 className="text-[18px] font-extrabold text-[#0F172A]">
                      Chi tiết đặt cọc
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest mb-1.5">
                        CHỌN PHÒNG CỤ THỂ
                      </label>
                      <div className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] font-bold text-[#0F172A] cursor-not-allowed opacity-75">
                        {room.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest mb-1.5">
                        NGÀY DỰ KIẾN DỌN VÀO
                      </label>
                      <input
                        required
                        type="date"
                        name="expectedDate"
                        value={formData.expectedDate}
                        onChange={handleInputChange}
                        disabled={paymentInitiated}
                        className="w-full bg-[#F1F5F9] border border-transparent focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] outline-none rounded-xl px-4 py-3 text-[14px] font-medium text-[#0F172A] transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="mb-8 border-t border-slate-100 pt-6">
                    <div className="flex justify-between items-end mb-4">
                      <label className="block text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest">
                        CHỌN GIƯỜNG ĐẶT CỌC
                      </label>
                      <button
                        type="button"
                        onClick={rentWholeRoom}
                        disabled={!allBedsEmpty || paymentInitiated}
                        className={`text-[12px] font-bold px-4 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${
                          !allBedsEmpty || paymentInitiated
                            ? "bg-slate-50 text-[#94A3B8] border-slate-200 cursor-not-allowed"
                            : "bg-[#E0E7FF] text-[#4338CA] border-[#C7D2FE] hover:bg-[#C7D2FE] cursor-pointer"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        Đặt cọc nguyên phòng
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {beds.map((bed) => {
                        const isAvailable = bed.status === "CON_TRONG";
                        const isHeld = bed.status === "DANG_GIU";
                        const isSelected = selectedBeds.includes(bed.id);

                        return (
                          <div
                            key={bed.id}
                            onClick={() => toggleBed(bed.id, bed.status)}
                            className={`relative rounded-3xl border-2 p-5 flex flex-col items-center justify-center text-center transition-all ${
                              !isAvailable
                                ? "bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed"
                                : isSelected
                                ? "bg-white border-[#0052CC] shadow-[0_0_0_4px_rgba(0,82,204,0.1)] cursor-pointer"
                                : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1] cursor-pointer shadow-sm"
                            } ${paymentInitiated ? "pointer-events-none opacity-60" : ""}`}
                          >
                            <div
                              className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 ${
                                isSelected
                                  ? "border-[#0052CC] bg-[#0052CC]"
                                  : "border-[#CBD5E1] bg-white"
                              } flex items-center justify-center transition-colors`}
                            >
                              {isSelected && (
                                <svg
                                  className="w-2.5 h-2.5 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={4}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>

                            <svg
                              className={`w-8 h-8 mb-2 ${
                                isSelected ? "text-[#0052CC]" : "text-[#0F172A]"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 10h16M10 6v4m4-4v4"
                              />
                            </svg>
                            <span
                              className={`text-[14px] font-extrabold block mb-0.5 ${
                                isSelected ? "text-[#0052CC]" : "text-[#0F172A]"
                              }`}
                            >
                              {bed.code}
                            </span>
                            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                              {isAvailable ? "SẴN SÀNG" : isHeld ? "ĐANG GIỮ" : "ĐÃ THUÊ"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest mb-1.5">
                      GHI CHÚ ĐẶT CỌC
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Ví dụ: Tôi cần giữ phòng đến cuối tháng..."
                      disabled={paymentInitiated}
                      className="w-full bg-[#F1F5F9] border border-transparent focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] outline-none rounded-xl px-4 py-3 text-[14px] font-medium text-[#0F172A] transition-all resize-none disabled:opacity-60"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Section 3: Terms & Submit */}
              <div className="relative pl-12 pt-4">
                <div className="absolute left-0 top-10 w-8 h-8 rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center font-bold text-sm tracking-tighter">
                  3
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm">
                  <label className="flex items-start gap-4 mb-8 cursor-pointer group">
                    <div className="pt-0.5">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          agreed
                            ? "border-[#0052CC] bg-[#0052CC]"
                            : "border-[#CBD5E1] bg-white group-hover:border-[#94A3B8]"
                        } ${paymentInitiated ? "opacity-60" : ""}`}
                      >
                        {agreed && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="text-[14px] text-[#475569] leading-relaxed font-medium">
                      Tôi đã đọc và đồng ý với các{" "}
                      <a href="#" className="font-bold text-[#0052CC] hover:underline">
                        Điều khoản dịch vụ
                      </a>{" "}
                      và{" "}
                      <a href="#" className="font-bold text-[#0052CC] hover:underline">
                        Chính sách bảo mật
                      </a>{" "}
                      của DormStay.
                      <br />
                      Tôi cam kết các thông tin cung cấp là chính xác.
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={agreed}
                      onChange={() => !paymentInitiated && setAgreed(!agreed)}
                      disabled={paymentInitiated}
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={paymentInitiated}
                    className="bg-[#0F172A] hover:bg-[#1E293B] text-white px-8 py-3.5 rounded-2xl font-bold text-[15px] transition-colors disabled:opacity-70 shadow-lg shadow-slate-200"
                  >
                    {paymentInitiated ? "Đang xử lý thanh toán..." : "Đặt cọc ngay"}
                  </button>
                  <p className="mt-4 text-[12px] italic text-[#94A3B8]">
                    Phòng sẽ được giữ trong 24h sau khi đặt cọc thành công.
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column Summary Card */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-[32px] border border-[#E2E8F0] overflow-hidden shadow-xl shadow-slate-100/50 sticky top-24">
              <div className="relative h-48 w-full">
                <img
                  src={room.image}
                  alt="Room"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-[#E4F2ED] text-[#22A06B] px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-sm border border-[#22A06B]/20">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Sẵn sàng dọn vào
                  </div>
                </div>
              </div>

              <div className="p-7">
                <h3 className="text-[22px] font-extrabold text-[#0F172A] mb-2 leading-tight">
                  {room.name}
                </h3>
                <p className="text-[#64748B] text-[13px] font-medium flex items-center gap-1.5 mb-6">
                  <svg
                    className="w-4 h-4 text-[#94A3B8]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11l-3 3m0 0l-3-3m3 3V8"
                    />
                  </svg>
                  {room.building}
                </p>

                <div className="space-y-4 mb-6 text-[14px]">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                    <span className="text-[#64748B] font-medium">
                      Giá thuê / giường
                    </span>
                    <span className="font-extrabold text-[#0F172A]">
                      {room.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                    <span className="text-[#64748B] font-medium">
                      Loại đặt cọc
                    </span>
                    <span className="font-extrabold text-[#0F172A]">
                      {selectedBeds.length === beds.length && beds.length > 0
                        ? "Nguyên phòng"
                        : `${selectedBeds.length} giường`}
                    </span>
                  </div>
                  {selectedBeds.length > 0 && selectedBeds.length < beds.length && (
                    <div className="flex justify-between items-start border-b border-slate-50 pb-4">
                      <span className="text-[#64748B] font-medium">
                        Giường đã chọn
                      </span>
                      <span className="font-bold text-[#0F172A] text-right">
                        {beds
                          .filter((b) => selectedBeds.includes(b.id))
                          .map((b) => b.code)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                    <span className="text-[#64748B] font-medium">
                      Đặt cọc (2 tháng × {selectedBeds.length} giường)
                    </span>
                    <span className="font-extrabold text-[#0052CC]">
                      {formatCurrency(depositAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-[#0F172A] font-bold">Tổng đặt cọc</span>
                    <span className="font-extrabold text-[#0052CC] text-lg">
                      {formatCurrency(depositAmount)}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <span className="block text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest mb-4">
                    TIỆN ÍCH NỔI BẬT
                  </span>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    {room.amenities?.slice(0, 4).map((am, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-[#475569] text-[13px] font-medium"
                      >
                        <div className="text-[#0052CC]">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        {am}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-[24px] flex gap-4 items-start shadow-sm">
              <div className="bg-white p-2 rounded-full shadow-sm text-[#0F172A]">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-[#0F172A] text-[14px] mb-1">
                  Đặt cọc an toàn
                </h4>
                <p className="text-[#64748B] text-[12.5px] leading-relaxed font-medium">
                  Thanh toán được bảo mật bởi PayOS. Phòng sẽ được giữ ngay sau khi
                  đặt cọc thành công.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;