# Plan xử lý 2 flow chính

## 1. Đặt phòng/giường

1. Khách hàng chọn phòng/giường và gửi form đặt cọc.
2. Backend tạo `yeu_cau_thue` và các dòng `giu_cho_tam`, giữ chỗ trong 24 giờ.
3. Khách hàng mở tab đặt phòng/yêu cầu thuê để thanh toán cọc PayOS.
4. Khi PayOS báo thành công, backend xác nhận trạng thái thanh toán thật, ghi:
   - hóa đơn cọc `hoa_don` loại `DAT_COC`,
   - dòng thanh toán `thanh_toan`,
   - trạng thái yêu cầu thuê `DA_COC`,
   - trạng thái giữ chỗ `DA_XAC_NHAN_COC`,
   - hợp đồng được tạo sẵn trong `hop_dong` với trạng thái `CHO_LAP_KHOAN_THU_DAU`.
5. Sale/Accounting lập khoản thu kỳ đầu từ màn hình billing. Sau khi lập, hóa đơn kỳ đầu lưu vào DB giống các khoản phát sinh và hợp đồng chuyển sang `CHO_THANH_TOAN_KY_DAU`.
6. Khách hàng thanh toán hóa đơn kỳ đầu. Khi đủ tiền, hóa đơn chuyển `DA_THANH_TOAN`, hợp đồng và phân bổ chuyển `HIEU_LUC`.
7. Nếu khách hàng không thanh toán đúng hạn, Accounting dùng danh sách hợp đồng/hóa đơn quá hạn để tạo đối soát và sinh phiếu hoàn cọc theo chính sách.

## 2. Trả phòng

1. Sale tạo `yeu_cau_tra_phong`.
2. Manager kiểm tra phòng và lưu biên bản vào `bien_ban_kiem_tra`, chi tiết tài sản vào `chi_tiet_kiem_tra`.
3. Accounting lấy danh sách yêu cầu cần đối soát, lập bảng `doi_soat_tai_chinh` và chi tiết `chi_tiet_doi_soat_tai_chinh`.
4. Khi Accounting chốt đối soát:
   - nếu dư tiền, hệ thống tự tạo `phieu_hoan_coc`;
   - nếu thiếu tiền, hệ thống tự tạo `phieu_thanh_toan_phat_sinh`;
   - mỗi loại phiếu có bảng riêng để theo dõi.
5. Khách hàng nhận thông tin thanh toán phát sinh hoặc thông báo hoàn cọc.
6. Phiếu phát sinh chỉ được xem là hoàn tất khi chuyển `DA_THANH_TOAN`; phiếu hoàn cọc chỉ hoàn tất khi chuyển `DA_HOAN` hoặc `HOAN_TAT`.
7. Manager chỉ được thanh lý hợp đồng khi đã có biên bản kiểm tra, đối soát đã chốt, và các phiếu cần thiết đã hoàn tất.
