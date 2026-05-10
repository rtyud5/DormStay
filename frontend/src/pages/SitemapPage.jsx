import { Link } from "react-router-dom";
import PolicyPage from "../components/common/PolicyPage";

function RouteList({ items }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Link key={item.to} to={item.to} className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-white">
          <p className="text-sm font-black text-slate-900">{item.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</p>
        </Link>
      ))}
    </div>
  );
}

export default function SitemapPage() {
  return (
    <PolicyPage
      title="Sitemap"
      description="Danh sách trang chính trong DormStay."
      intro="Một bản đồ nhanh để bạn biết trang nào đang công khai, trang nào cần đăng nhập."
      sections={[
        {
          title: "Công khai",
          content: <RouteList items={[
            { label: "Trang chủ", to: "/", description: "Màn đầu tiên của DormStay" },
            { label: "Tìm phòng", to: "/rooms", description: "Danh sách phòng và giường" },
            { label: "Giới thiệu", to: "/about", description: "Giới thiệu DormStay" },
            { label: "Đặt cọc ngay", to: "/deposit", description: "Bắt đầu luồng đặt cọc" },
            { label: "Điều khoản", to: "/terms", description: "Điều khoản sử dụng" },
            { label: "Bảo mật", to: "/privacy", description: "Chính sách dữ liệu" },
            { label: "Liên hệ", to: "/contact", description: "Thông tin hỗ trợ" },
            { label: "Sitemap", to: "/sitemap", description: "Trang này" },
          ]} />,
        },
        {
          title: "Cư dân",
          content: <RouteList items={[
            { label: "Bảng điều khiển", to: "/dashboard", description: "Tóm tắt tài khoản" },
            { label: "Hồ sơ của tôi", to: "/profile", description: "Thông tin cá nhân" },
            { label: "Hợp đồng của tôi", to: "/contracts", description: "Danh sách hợp đồng" },
            { label: "Thanh lý hợp đồng", to: "/liquidations", description: "Phiếu phát sinh và hoàn cọc" },
            { label: "Đặt phòng", to: "/deposits", description: "Yêu cầu đặt phòng" },
          ]} />,
        },
        {
          title: "Hỗ trợ",
          content: <RouteList items={[
            { label: "Giấy tờ", to: "/documents", description: "Tài liệu cư trú" },
            { label: "Cài đặt tài khoản", to: "/settings", description: "Xem nhanh cấu hình tài khoản" },
            { label: "Đăng nhập", to: "/login", description: "Vào tài khoản" },
            { label: "Đăng ký", to: "/register", description: "Tạo tài khoản mới" },
            { label: "Quên mật khẩu", to: "/forgot-password", description: "Khôi phục mật khẩu" },
          ]} />,
        },
      ]}
    />
  );
}
