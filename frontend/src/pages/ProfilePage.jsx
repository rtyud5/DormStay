import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ProfileService from "../services/profile.service";
import StorageService from "../services/storage.service";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { classNames } from "../lib/helpers";

function ProfilePage() {
  const { profile, fetchProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ avatar: false, cccdFront: false, cccdBack: false });
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    dia_chi_thuong_tru: "",
    avatar_url: "",
    ngan_hang_ten: "",
    ngan_hang_so_tai_khoan: "",
    ngan_hang_chu_tai_khoan: "",
    so_cccd: "",
    ngay_cap_cccd: "",
    cccd_mat_truoc_url: "",
    cccd_mat_sau_url: "",
    lien_he_khan_cap_ho_ten: "",
    lien_he_khan_cap_sdt: "",
    lien_he_khan_cap_moi_quan_he: "Bố/Mẹ",
  });

  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        ho_ten: profile.ho_ten || "",
        email: profile.email || "",
        so_dien_thoai: profile.so_dien_thoai || "",
        dia_chi_thuong_tru: profile.dia_chi_thuong_tru || "",
        avatar_url: profile.avatar_url || "",
        ngan_hang_ten: profile.ngan_hang_ten || "",
        ngan_hang_so_tai_khoan: profile.ngan_hang_so_tai_khoan || "",
        ngan_hang_chu_tai_khoan: profile.ngan_hang_chu_tai_khoan || "",
        so_cccd: profile.so_cccd || "",
        ngay_cap_cccd: profile.ngay_cap_cccd || "",
        cccd_mat_truoc_url: profile.cccd_mat_truoc_url || "",
        cccd_mat_sau_url: profile.cccd_mat_sau_url || "",
        lien_he_khan_cap_ho_ten: profile.lien_he_khan_cap_ho_ten || "",
        lien_he_khan_cap_sdt: profile.lien_he_khan_cap_sdt || "",
        lien_he_khan_cap_moi_quan_he: profile.lien_he_khan_cap_moi_quan_he || "Bố/Mẹ",
      }));
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading((prev) => ({ ...prev, [type]: true }));
    try {
      const url = await StorageService.uploadFile(file, "profiles", type);
      console.log(`Uploaded ${type}:`, url);
      
      const fieldMap = {
        avatar: 'avatar_url',
        cccdFront: 'cccd_mat_truoc_url',
        cccdBack: 'cccd_mat_sau_url'
      };
      
      setForm((prev) => ({ ...prev, [fieldMap[type]]: url }));
    } catch (err) {
      console.error("Lỗi khi tải ảnh lên:", err);
      alert(`Tải ảnh thất bại: ${err.message || 'Lỗi không xác định'}. Đảm bảo bạn đã chạy SQL tạo bucket.`);
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const calculateCompletion = () => {
    const fields = Object.values(form);
    const filledFields = fields.filter((f) => f !== "" && f !== null).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    console.log("Submitting Profile Form:", form);
    
    try {
      await ProfileService.updateMe(form);
      await fetchProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Cập nhật hồ sơ thất bại:", err);
      const errorMsg = err.response?.data?.message || err.message || "Lỗi không xác định";
      alert(`Lỗi cập nhật hồ sơ: ${errorMsg}. Hãy đảm bảo bạn đã chạy SQL cập nhật bảng ho_so.`);
    } finally {
      setLoading(false);
    }
  };

  const completion = calculateCompletion();
  const isMissingCCCD = !form.so_cccd || !form.cccd_mat_truoc_url || !form.cccd_mat_sau_url;

  return (
    <div className="mx-auto max-w-5xl font-sans pb-12 animate-in fade-in duration-700">
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold text-[#0F172A] tracking-tight">Cập nhật hồ sơ cá nhân</h1>
          <p className="mt-1 text-[#64748B] font-medium">Vui lòng cung cấp đầy đủ thông tin để đảm bảo quyền lợi lưu trú và hoàn tất thủ tục hợp đồng điện tử.</p>
        </div>
        
        <div className="flex h-20 items-center gap-4 rounded-3xl bg-[#E0F2FE] px-6 py-2 shadow-sm border border-blue-50/50">
           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           </div>
           <div>
              <p className="text-[11px] font-black text-blue-800 uppercase tracking-widest leading-none mb-1">Trạng thái hồ sơ</p>
              <p className="text-[14px] font-extrabold text-blue-700 leading-tight">
                {isMissingCCCD ? "Đang thiếu thông tin CCCD" : "Hồ sơ đã đầy đủ"}
              </p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_2fr]">
        {/* Left Column: Avatar & Bank */}
        <div className="space-y-8">
          <Card title="Ảnh chân dung" className="text-center">
            <div className="flex flex-col items-center py-6">
              <div className="group relative mb-6 h-40 w-40 overflow-hidden rounded-full bg-slate-100 shadow-inner ring-4 ring-white ring-offset-2 ring-offset-slate-50">
                <img
                  src={form.avatar_url || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=300&q=80"}
                  alt="Avatar"
                  className={classNames("h-full w-full object-cover transition-all duration-700 group-hover:scale-110", uploading.avatar ? "blur-sm opacity-50" : "opacity-100")}
                />
                {uploading.avatar && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0052CC] border-t-transparent"></div>
                  </div>
                )}
              </div>
              <p className="mb-6 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide">Định dạng JPG, PNG. Kích thước tối đa 2MB.</p>
              <label className="flex w-full cursor-pointer flex-col items-center">
                <span className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-[14px] font-black text-[#0F172A] shadow-sm transition-all hover:bg-slate-50 hover:shadow-md active:scale-95">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Thay đổi ảnh
                </span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "avatar")} />
              </label>
            </div>
          </Card>

          <Card title="TK Ngân hàng hoàn cọc">
            <div className="space-y-5 py-2">
              <Select
                label="NGÂN HÀNG"
                name="ngan_hang_ten"
                value={form.ngan_hang_ten}
                onChange={handleChange}
                options={[
                  { label: "Vietcombank", value: "Vietcombank" },
                  { label: "Techcombank", value: "Techcombank" },
                  { label: "TPBank", value: "TPBank" },
                  { label: "MB Bank", value: "MB Bank" },
                ]}
              />
              <Input
                label="SỐ TÀI KHOẢN"
                placeholder="Nhập số tài khoản"
                name="ngan_hang_so_tai_khoan"
                value={form.ngan_hang_so_tai_khoan}
                onChange={handleChange}
              />
              <Input
                label="CHỦ TÀI KHOẢN"
                placeholder="Nhập họ và tên chủ thẻ"
                name="ngan_hang_chu_tai_khoan"
                value={form.ngan_hang_chu_tai_khoan}
                onChange={handleChange}
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Groups */}
        <div className="space-y-8">
          <Card title="Thông tin liên hệ">
            <div className="grid grid-cols-1 gap-6 py-2 md:grid-cols-2">
              <Input label="HỌ VÀ TÊN" name="ho_ten" value={form.ho_ten} onChange={handleChange} />
              <Input label="EMAIL" type="email" name="email" value={form.email} disabled className="bg-slate-50 cursor-not-allowed opacity-70" />
              <Input label="SỐ ĐIỆN THOẠI" name="so_dien_thoai" value={form.so_dien_thoai} onChange={handleChange} />
              <Input label="ĐỊA CHỈ THƯỜNG TRÚ" placeholder="Số nhà, Tên đường, Quận, TP" name="dia_chi_thuong_tru" value={form.dia_chi_thuong_tru} onChange={handleChange} />
            </div>
          </Card>

          <Card title="Giấy tờ tùy thân (CCCD)">
            <div className="space-y-8 py-2">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-[11px] font-black text-[#64748B] uppercase tracking-widest">MẶT TRƯỚC CCCD</p>
                  <label className="relative block aspect-[3/2] w-full cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 transition-all hover:border-[#0052CC] hover:bg-slate-50">
                    {form.cccd_mat_truoc_url ? (
                      <img src={form.cccd_mat_truoc_url} alt="CCCD Front" className={classNames("h-full w-full object-cover", uploading.cccdFront ? "blur-sm opacity-50" : "opacity-100")} />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-slate-400">
                        <svg className="mb-2 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12h-4l-3 9L9 3l-3 9H2" /></svg>
                        <span className="text-[13px] font-bold">Bấm để tải ảnh lên</span>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "cccdFront")} />
                  </label>
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] font-black text-[#64748B] uppercase tracking-widest">MẶT SAU CCCD</p>
                  <label className="relative block aspect-[3/2] w-full cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 transition-all hover:border-[#0052CC] hover:bg-slate-50">
                    {form.cccd_mat_sau_url ? (
                      <img src={form.cccd_mat_sau_url} alt="CCCD Back" className={classNames("h-full w-full object-cover", uploading.cccdBack ? "blur-sm opacity-50" : "opacity-100")} />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-slate-400">
                        <svg className="mb-2 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        <span className="text-[13px] font-bold">Bấm để tải ảnh lên</span>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "cccdBack")} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input label="SỐ CCCD" placeholder="Nhập số CCCD/CMND" name="so_cccd" value={form.so_cccd} onChange={handleChange} />
                <Input label="NGÀY CẤP" type="date" name="ngay_cap_cccd" value={form.ngay_cap_cccd} onChange={handleChange} />
              </div>
            </div>
          </Card>

          <Card title="Người liên hệ khẩn cấp">
            <div className="grid grid-cols-1 gap-6 py-2 md:grid-cols-2">
              <Input label="HỌ TÊN NGƯỜI THÂN" placeholder="Nhập họ tên người thân" name="lien_he_khan_cap_ho_ten" value={form.lien_he_khan_cap_ho_ten} onChange={handleChange} />
              <Input label="SỐ ĐIỆN THOẠI LIÊN HỆ" placeholder="Nhập số điện thoại" name="lien_he_khan_cap_sdt" value={form.lien_he_khan_cap_sdt} onChange={handleChange} />
              <Select
                label="MỐI QUAN HỆ"
                name="lien_he_khan_cap_moi_quan_he"
                value={form.lien_he_khan_cap_moi_quan_he}
                onChange={handleChange}
                options={[
                  { label: "Bố/Mẹ", value: "Bố/Mẹ" },
                  { label: "Anh/Chị/Em", value: "Anh/Chị/Em" },
                  { label: "Vợ/Chồng", value: "Vợ/Chồng" },
                  { label: "Khác", value: "Khác" },
                ]}
              />
            </div>
          </Card>

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between pt-4">
             <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                   <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 01.414 0z" clipRule="evenodd" /></svg>
                </div>
                <span className="text-[13px] font-bold text-[#64748B]">Thông tin tự động lưu nháp</span>
             </div>

             <div className="flex items-center gap-4">
                <Button variant="ghost" type="button" className="px-8 py-4 rounded-2xl font-black text-[14px] uppercase tracking-wide">Hủy bỏ</Button>
                <Button 
                  loading={loading} 
                  type="submit" 
                  className="bg-[#0A192F] hover:bg-[#0052CC] text-white px-10 py-4 rounded-2xl font-black text-[14px] shadow-lg shadow-blue-900/10 transition-all active:scale-95 uppercase tracking-widest"
                >
                  Lưu cập nhật
                </Button>
             </div>
          </div>
        </div>
      </form>

      {success && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
           <div className="bg-[#0A192F] text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                 <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="font-black text-[15px] uppercase tracking-tight">Cập nhật hồ sơ thành công!</span>
           </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
