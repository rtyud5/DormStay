# Kịch Bản Nghiệp Vụ Hoàn Chỉnh: Hệ Thống DormStay

Dưới đây là một kịch bản End-to-End mô tả chi tiết 2 luồng nghiệp vụ xương sống của hệ thống, dựa trên một ví dụ thực tế.

---

### Bối cảnh nhân vật (Ví dụ)
*   **Khách hàng**: Anh Nguyễn Văn A.
*   **Mục tiêu**: Thuê phòng VIP số 101 (giá thuê 5.000.000 VNĐ, cọc 5.000.000 VNĐ).
*   **Nhân sự hệ thống**: Sale (Chị B) - Kế toán (Anh C) - Quản lý (Chú D).

---

## LUỒNG 1: ĐẶT PHÒNG VÀ KÍCH HOẠT HỢP ĐỒNG

### Bước 1: Khách hàng (A) tạo yêu cầu thuê
*   **UI/Tương tác**: A lên website khách hàng, vào danh sách phòng chọn Phòng 101. Nhấn nút "Đặt phòng". Điền form thông tin cá nhân (Tên, SDT, CCCD, Ngày dự kiến vào ở).
*   **Logic Hệ Thống**: 
    - Frontend gọi API `POST /rental-requests`. 
    - Backend tạo/tìm hồ sơ của A trong bảng `ho_so` với vai trò `KHACH_HANG`.
    - Sinh ra một bản ghi `yeu_cau_thue` trạng thái `DANG_XU_LY`.
    - Đồng thời sinh ra bản ghi `giu_cho_tam` để giữ chỗ Phòng 101 trong 24 tiếng.

### Bước 2: Khách hàng (A) thanh toán cọc bảo đảm
*   **UI/Tương tác**: Tại trang "Danh sách đặt cọc" (`ContractListPage.jsx`), A thấy yêu cầu thuê Phòng 101 của mình. A nhấn nút "Thanh toán cọc". Giao diện chuyển hướng sang màn hình quét mã QR của PayOS.
*   **Logic Hệ Thống**: A quét mã QR và chuyển khoản thành công 5.000.000 VNĐ.

### Bước 3: Xác nhận cọc và tự động sinh hợp đồng (Webhook)
*   **UI/Tương tác**: Khách thanh toán xong, Webhook của PayOS bắn tín hiệu ngầm về Backend mà không cần ai thao tác.
*   **Logic Hệ Thống**:
    - Nhận Webhook, Backend cập nhật yêu cầu thuê thành `DA_THANH_TOAN` (hoặc `DA_XAC_NHAN`).
    - *Quan trọng:* Backend **tự động chèn (insert)** một bản ghi vào bảng `hop_dong` với trạng thái `CHO_LAP_KHOAN_THU_DAU`. Trạng thái giữ chỗ chuyển thành đã hoàn tất.
    - Chèn dữ liệu vào bảng phân bổ `phan_bo_hop_dong` ghi nhận A là chủ Phòng 101.

### Bước 4: Kế toán (C) thiết lập Khoản thu đầu kỳ (Billing)
*   **UI/Tương tác**: Kế toán C đăng nhập. Vào tab **Lập khoản thu đầu** (`/accounting/billing`). C chọn hợp đồng của anh A từ dropdown. Bảng hiện ra tiền thuê tháng đầu (5.000.000). Kế toán add thêm phụ phí: "Tiền rác" (50.000đ). Bấm nút **"Tạo hóa đơn kỳ đầu"**.
*   **Logic Hệ Thống**: 
    - Backend sinh ra một `hoa_don` (Invoice) tháng đầu tiên cho Hợp Đồng của A, tổng tiền 5.050.000đ.
    - Cập nhật hợp đồng của A sang trạng thái `CHO_THANH_TOAN_KY_DAU`.

### Bước 5: Khách hàng (A) đóng tiền kỳ đầu & Kích hoạt (Active)
*   **UI/Tương tác**: A đăng nhập vào lại web. Thấy hợp đồng của mình mang nhãn `CHỜ THANH TOÁN`. Bấm vào **"Xem chi tiết"**. Thấy nợ 5.050.000đ. A chọn thanh toán PayOS.
*   **Logic Hệ Thống**:
    - Khi A thanh toán, Webhook trả về. `hoa_don` chuyển trạng thái `DA_THANH_TOAN`.
    - Backend check thấy hóa đơn kỳ đầu đã xong, nó lập tức cập nhật trạng thái `hop_dong` của A thành **`HIEU_LUC`** (Đang hiệu lực).
    > 🎉 **Kết thúc Luồng 1:** Phòng 101 biến thành màu đỏ (đã có khách) trên sơ đồ hệ thống. Anh A bắt đầu sinh sống.

---

## LUỒNG 2: TRẢ PHÒNG VÀ ĐỐI SOÁT THANH LÝ

*Giả sử 6 tháng sau, anh A báo với Sale là muốn dọn đi.*

### Bước 1: Sale (B) tạo Yêu cầu trả phòng
*   **UI/Tương tác**: Chị B (Sale) vào giao diện Nhân viên Sale (`/sale/checkout-requests`). Tìm Hợp đồng của A, bấm "Tạo Yêu cầu trả phòng". B chọn ngày A dự kiến dọn đi.
*   **Logic Hệ Thống**: Sinh ra bảng `yeu_cau_tra_phong` gán vào mã hợp đồng của A với trạng thái `CHO_XU_LY`. Giao diện hợp đồng của khách hàng A sẽ có ký hiệu đang chờ trả.

### Bước 2: Manager (D) đi kiểm tra phòng thu hồi
*   **UI/Tương tác**: Chú D (Quản lý) cầm điện thoại/iPad lên lầu 1, vào phòng 101. Chú mở web mục **Kiểm Tra Phòng** (`/manager/inspections`). Bấm vào yêu cầu trả phòng của phòng 101. Chú D điền form Biên Bản: 
    * "Tường bẩn" -> Phạt đền bù: 500.000đ.
    * Chốt chỉ số Điện nước cuối cùng. -> Bấm nút **"Lập Biên Bản"**.
*   **Logic Hệ Thống**: Vừa tạo ra `bien_ban_kiem_tra`. Đổi trạng thái yêu cầu sang `DA_KIEM_TRA`. Ghi logs.

### Bước 3: Kế toán (C) đối soát tài chính
*   **UI/Tương tác**: Kế toán C ngồi dưới văn phòng, mở màn hình **Bảng Đối Soát** (`/accounting/reconciliation`). Mở cái biên bản của Phòng 101 mà Quản lý vừa lập ra.
    - C thấy: Tiền cọc (5tr) - Phạt tương tường (500k) - Tiền điện nước (200k) = Tiền thừa: 4.300.000đ.
    - C thấy hợp lý, bấm **"Chốt đối soát"** (Finalization).
*   **Logic Hệ Thống**: 
    - Sinh ra bảng `doi_soat_tai_chinh`.
    - Vì dư tiền nên phần mềm sinh ra `phieu_hoan_coc` (Refund Voucher) trị giá 4.300.000đ chờ chuyển trả anh A.
    *(Nếu ÂM tiền, nó sẽ sinh ra `phieu_thanh_toan_phat_sinh` thay vì hoàn cọc).*

### Bước 4: Manager (D) chốt Thanh lý Hợp Đồng (Giải phóng phòng)
*   **UI/Tương tác**: Quản lý D vào trang **Thanh Lý Hợp Đồng** (`/manager/liquidations`). Hệ thống báo phòng 101 đã xanh lá hết 6 điều kiện (Có biên bản, đã đối soát...v.v). Chú D bấm nút **"Xác Nhận Thanh Lý"**.
*   **Logic Hệ Thống**: 
    - `hop_dong` của A chính thức bị "khai tử", chuyển dòng chữ sang `HET_HAN`.
    - Gói `phan_bo_hop_dong` kết thúc -> **Giải phóng phòng 101 thành `TRONG` (Sẵn sàng bán lại ngay lập tức)**.
    - Ghi nhận `nhat_ky_he_thong` lưu dấu tay quản lý D đã tiễn khách A đi.

### Bước 5: Hậu xử lý (Settle Vouchers)
*   **UI/Tương tác**: 
    - Ngày hôm sau, Kế toán C lấy ủy nhiệm chi chuyển lại 4.300.000đ cho anh A. 
    - Kế toán vào danh sách hoàn cọc (`/accounting/refunds`), bấm "Đã Chuyển Tiền".
*   **Logic Hệ Thống**: Phiếu hoàn cọc đổi thành `DA_THANH_TOAN`. Chấm dứt 100% vòng đời của khách A tại hệ thống.

---
*(Hết ví dụ minh họa)*
