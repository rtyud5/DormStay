import PolicyPage from "../components/common/PolicyPage";

export default function ContactPage() {
  return (
    <PolicyPage
      title="Liên hệ DormStay"
      description="Kênh hỗ trợ cư dân khi cần hỏi thông tin hoặc xử lý hoàn cọc."
      intro="Nếu có vấn đề về phòng ở, hợp đồng, thanh lý hay thanh toán, dùng các kênh bên dưới để liên hệ DormStay."
      sections={[
        {
          title: "Thông tin liên hệ",
          content: (
            <>
              <p>Hotline: 1900 6868</p>
              <p>Email: info@dormstay.vn</p>
              <p>Địa chỉ: 123 Đường Số 1, Quận 1, TP. HCM</p>
            </>
          ),
        },
        {
          title: "Khi cần hỗ trợ hoàn cọc",
          content: (
            <>
              <p>Kiểm tra số tiền trên phiếu hoàn cọc trước, sau đó liên hệ Zalo DormStay để xác nhận nhận tiền.</p>
              <p>Nếu là khoản phát sinh, dùng nút thanh toán ngay trên trang thanh lý hoặc trang hóa đơn.</p>
            </>
          ),
        },
      ]}
      links={[
        { label: "Đặt phòng", to: "/deposits", description: "Xem yêu cầu đặt phòng" },
        { label: "Hợp đồng của tôi", to: "/contracts", description: "Danh sách hợp đồng" },
        { label: "Thanh lý hợp đồng", to: "/liquidations", description: "Phiếu phát sinh và hoàn cọc" },
      ]}
    />
  );
}
