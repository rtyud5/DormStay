import PolicyPage from "../components/common/PolicyPage";

export default function DocumentsPage() {
  return (
    <PolicyPage
      title="Giấy tờ & tài liệu"
      description="Tổng hợp lối tắt tới tài liệu và trang xem nhanh cho cư dân."
      intro="Trang này là nơi vào nhanh các tài liệu cần đọc trước khi ở, trước khi thanh lý, và khi cần liên hệ hỗ trợ."
      sections={[
        {
          title: "Tài liệu cư trú",
          content: (
            <>
              <p>Đọc điều khoản và chính sách trước khi đặt cọc để hiểu rõ trách nhiệm hai bên.</p>
              <p>Thông tin hợp đồng thật vẫn nằm trong trang Hợp đồng của tôi.</p>
            </>
          ),
        },
        {
          title: "Tài liệu thanh lý",
          content: (
            <>
              <p>Khi hợp đồng hết hiệu lực, vào Thanh lý hợp đồng để xem khấu hao, % được hoàn và phiếu phát sinh.</p>
              <p>Phiếu hoàn cọc chỉ cần kiểm tra số tiền rồi liên hệ Zalo DormStay để hoàn tất.</p>
            </>
          ),
        },
      ]}
      links={[
        { label: "Hợp đồng của tôi", to: "/contracts", description: "Danh sách hợp đồng cư trú" },
        { label: "Thanh lý hợp đồng", to: "/liquidations", description: "Phiếu phát sinh và hoàn cọc" },
        { label: "Điều khoản", to: "/terms", description: "Điều khoản sử dụng DormStay" },
        { label: "Bảo mật", to: "/privacy", description: "Cách chúng tôi xử lý dữ liệu" },
        { label: "Liên hệ", to: "/contact", description: "Kênh hỗ trợ cư dân" },
      ]}
    />
  );
}
