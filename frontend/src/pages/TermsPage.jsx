import PolicyPage from "../components/common/PolicyPage";

export default function TermsPage() {
  return (
    <PolicyPage
      title="Điều khoản sử dụng"
      description="Bản tóm tắt ngắn để cư dân đọc nhanh trước khi dùng DormStay."
      intro="Dùng hệ thống nghĩa là bạn đồng ý với các quy định vận hành, thanh toán và xử lý thanh lý hợp đồng của DormStay."
      sections={[
        {
          title: "Phạm vi áp dụng",
          content: (
            <>
              <p>Điều khoản áp dụng cho việc xem phòng, đặt cọc, tạo hợp đồng, thanh toán và thanh lý hợp đồng.</p>
              <p>Khi có thông tin chốt từ Manager hoặc Accounting, dữ liệu đó là nguồn vận hành chính trên hệ thống.</p>
            </>
          ),
        },
        {
          title: "Thanh toán và hóa đơn",
          content: (
            <>
              <p>Người dùng thanh toán qua các luồng hiển thị trên trang hợp đồng, hóa đơn hoặc thanh lý.</p>
              <p>Các khoản phát sinh và hoàn cọc được ghi nhận theo phiếu tương ứng để dễ đối soát.</p>
            </>
          ),
        },
        {
          title: "Thanh lý hợp đồng",
          content: (
            <>
              <p>Khi hợp đồng kết thúc, hệ thống hiển thị khấu hao, % được hoàn và các phiếu liên quan.</p>
              <p>Khách hàng cần kiểm tra số tiền rồi làm theo hướng dẫn trên trang thanh lý.</p>
            </>
          ),
        },
        {
          title: "Trách nhiệm người dùng",
          content: (
            <>
              <p>Người dùng cần cung cấp thông tin thật, thanh toán đúng hạn và theo dõi thông báo trên hệ thống.</p>
              <p>DormStay có thể từ chối xử lý nếu dữ liệu không khớp hoặc thiếu thông tin cần thiết.</p>
            </>
          ),
        },
      ]}
      links={[
        { label: "Chính sách bảo mật", to: "/privacy", description: "Cách xử lý dữ liệu cá nhân" },
        { label: "Liên hệ", to: "/contact", description: "Kênh hỗ trợ cư dân" },
        { label: "Sitemap", to: "/sitemap", description: "Danh sách trang chính" },
      ]}
    />
  );
}
