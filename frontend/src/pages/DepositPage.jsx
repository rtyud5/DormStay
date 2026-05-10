import { Link } from "react-router-dom";
import PolicyPage from "../components/common/PolicyPage";

export default function DepositPage() {
  return (
    <PolicyPage
      title="Đặt cọc ngay"
      description="Điểm khởi đầu để chọn phòng và mở luồng đặt cọc."
      intro="Chọn phòng trước, xem chi tiết phòng rồi đi tiếp sang màn đặt cọc để hệ thống sinh hồ sơ và thanh toán."
      sections={[
        {
          title: "Bước 1 · Chọn phòng",
          content: (
            <p>Vào danh sách phòng, lọc theo tòa, tầng, giá và trạng thái để tìm phòng phù hợp.</p>
          ),
        },
        {
          title: "Bước 2 · Xem chi tiết",
          content: (
            <p>Mở trang phòng để xem ảnh, tiện ích, giá thuê và nút đặt cọc cho phòng đã chọn.</p>
          ),
        },
        {
          title: "Bước 3 · Thanh toán",
          content: (
            <p>Sau khi điền thông tin, hệ thống tạo hồ sơ đặt cọc và chuyển sang thanh toán PayOS.</p>
          ),
        },
      ]}
      links={[
        { label: "Xem phòng", to: "/rooms", description: "Bắt đầu từ danh sách phòng trống" },
        { label: "Đăng nhập", to: "/login", description: "Có sẵn tài khoản thì vào đây" },
        { label: "Giới thiệu", to: "/about", description: "Xem thêm thông tin DormStay" },
      ]}
      actions={
        <Link
          to="/rooms"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-800"
        >
          Xem phòng
        </Link>
      }
    />
  );
}
