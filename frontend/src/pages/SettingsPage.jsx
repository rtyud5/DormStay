import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PolicyPage from "../components/common/PolicyPage";

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value || "--"}</p>
    </div>
  );
}

export default function SettingsPage() {
  const { user, profile } = useAuth();

  return (
    <PolicyPage
      title="Cài đặt tài khoản"
      description="Xem nhanh thông tin tài khoản và lối tắt chỉnh hồ sơ."
      intro={
        <div className="grid gap-4 md:grid-cols-3">
          <InfoRow label="Họ tên" value={profile?.ho_ten || "Cư dân"} />
          <InfoRow label="Email" value={user?.email || profile?.email || "--"} />
          <InfoRow label="Vai trò" value={profile?.vai_tro || "KHACH_HANG"} />
        </div>
      }
      sections={[
        {
          title: "Hồ sơ cá nhân",
          content: (
            <>
              <p>Thông tin cá nhân, giấy tờ và liên hệ khẩn cấp nằm trong trang Hồ sơ.</p>
              <p>Nếu muốn đổi ảnh, số điện thoại hoặc thông tin ngân hàng, mở Hồ sơ trước.</p>
            </>
          ),
        },
        {
          title: "Trạng thái cư trú",
          content: (
            <>
              <p>Hợp đồng và thanh lý của bạn tách riêng để xem nhanh từng giai đoạn.</p>
              <p>Đây chỉ là trang xem nhanh, không thay đổi dữ liệu vận hành.</p>
            </>
          ),
        },
      ]}
      links={[
        { label: "Hồ sơ của tôi", to: "/profile", description: "Chỉnh thông tin cá nhân" },
        { label: "Hợp đồng của tôi", to: "/contracts", description: "Danh sách hợp đồng" },
        { label: "Giấy tờ", to: "/documents", description: "Tài liệu & chính sách" },
      ]}
    />
  );
}
