import PolicyPage from "../components/common/PolicyPage";

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Chính sách bảo mật"
      description="Cách DormStay thu thập và sử dụng dữ liệu cư dân."
      intro="Chúng tôi chỉ dùng dữ liệu cần cho vận hành phòng ở, hợp đồng, thanh toán và hỗ trợ cư dân."
      sections={[
        {
          title: "Dữ liệu thu thập",
          content: (
            <>
              <p>Họ tên, liên hệ, ảnh, giấy tờ định danh, thông tin ngân hàng và dữ liệu hợp đồng là nhóm chính.</p>
              <p>Mọi thay đổi hồ sơ đều đi qua luồng nội bộ của hệ thống để tránh chỉnh sai dữ liệu vận hành.</p>
            </>
          ),
        },
        {
          title: "Mục đích sử dụng",
          content: (
            <>
              <p>Dữ liệu được dùng để xác thực tài khoản, tạo hợp đồng, tạo hóa đơn, thanh lý và hỗ trợ thanh toán.</p>
              <p>Khi cần xử lý hoàn cọc, DormStay có thể liên hệ thêm qua các kênh đã lưu trong hồ sơ.</p>
            </>
          ),
        },
        {
          title: "Chia sẻ dữ liệu",
          content: (
            <>
              <p>Dữ liệu chỉ được chia sẻ cho các vai trò vận hành nội bộ cần thiết như Sale, Manager và Accounting.</p>
              <p>Không dùng dữ liệu cư dân cho mục đích khác ngoài vận hành DormStay.</p>
            </>
          ),
        },
        {
          title: "Lưu trữ",
          content: (
            <>
              <p>Thông tin hợp đồng và thanh toán được giữ lại để đối soát, tra cứu lịch sử và xử lý tranh chấp nếu có.</p>
              <p>Khi cần hỗ trợ xóa hoặc cập nhật dữ liệu, hãy liên hệ đội ngũ DormStay.</p>
            </>
          ),
        },
      ]}
      links={[
        { label: "Điều khoản", to: "/terms", description: "Quy định sử dụng hệ thống" },
        { label: "Liên hệ", to: "/contact", description: "Kênh hỗ trợ cư dân" },
        { label: "Sitemap", to: "/sitemap", description: "Danh sách trang chính" },
      ]}
    />
  );
}
