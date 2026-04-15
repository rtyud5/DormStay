# Kế Hoạch Backend Cho Module Kế Toán

## 1. Mục tiêu tài liệu

Tài liệu này tổng hợp phần đã đọc và phân tích từ:

- Ngữ cảnh nghiệp vụ HomeStay Dorm do người dùng cung cấp
- UI kế toán đã được thêm vào frontend
- Backend hiện tại của dự án DormStay

Mục tiêu là xác định:

- Backend nào cần bổ sung để đáp ứng UI kế toán
- Phần nào có thể tái sử dụng từ backend hiện tại
- Những điểm lệch giữa nghiệp vụ, frontend và backend cần chốt trước khi code
- Thứ tự triển khai sau khi có schema tổng quan

Lưu ý: tài liệu này chưa triển khai code. Đây là kế hoạch kỹ thuật để làm backend ở bước tiếp theo.

---

## 2. Nguồn đã đọc

### 2.1. Nghiệp vụ người dùng cung cấp

Đã đọc 4 quy trình chính:

1. Đăng ký thuê phòng hoặc giường
2. Đặt cọc và xác nhận thuê
3. Nhận phòng, ký hợp đồng, bàn giao
4. Trả phòng, hoàn cọc, thanh lý hợp đồng

### 2.2. UI kế toán đã đọc

Các file chính đã rà soát:

- `frontend/src/pages/accounting/AccountingDashboardPage.jsx`
- `frontend/src/pages/accounting/AccountingContractListPage.jsx`
- `frontend/src/pages/accounting/AccountingInvoiceListPage.jsx`
- `frontend/src/pages/accounting/AccountingBillingPage.jsx`
- `frontend/src/pages/accounting/AccountingExtraInvoicePage.jsx`
- `frontend/src/pages/accounting/AccountingRefundPage.jsx`
- `frontend/src/pages/accounting/AccountingTransactionPage.jsx`
- `frontend/src/pages/accounting/AccountingReconciliationPage.jsx`
- `frontend/src/services/accounting.service.js`
- `frontend/src/constants/accounting.constants.js`
- `frontend/src/mockdata/accounting.mockdata.js`
- `frontend/src/components/accounting/AccountingInvoiceTable.jsx`
- `frontend/src/components/accounting/AccountingStatusBadge.jsx`
- `frontend/src/utils/accounting.utils.js`
- `frontend/src/routes/index.jsx`

### 2.3. Backend hiện có đã đọc

Các file backend liên quan đã rà soát:

- `backend/src/routes/index.js`
- `backend/src/routes/payment.routes.js`
- `backend/src/controllers/payment.controller.js`
- `backend/src/services/payment.service.js`
- `backend/src/models/payment.model.js`
- `backend/src/models/invoice.model.js`
- `backend/src/services/contract.service.js`
- `backend/src/models/contract.model.js`
- `backend/src/config/supabase.js`

---

## 3. Kết luận nhanh sau khi đọc

### 3.1. Module kế toán ở frontend đã có phạm vi khá lớn

Frontend đang giả định có đầy đủ backend cho các nhóm nghiệp vụ sau:

- Dashboard kế toán
- Danh sách hợp đồng chờ lập khoản thu
- Lập phiếu thu đầu kỳ
- Danh sách phiếu thu
- Phiếu phát sinh
- Ghi nhận thanh toán và xác nhận thanh toán
- Phiếu hoàn cọc
- Tra soát giao dịch
- Đối soát tài chính
- Báo cáo tài chính tổng hợp

### 3.2. Backend hiện tại chưa có module kế toán tương ứng

Backend hiện mới có:

- `/payments/invoices`: cho người thuê xem hóa đơn của chính mình
- `/payments/history`: cho người thuê xem lịch sử thanh toán của chính mình
- `/payments`: tạo ghi nhận thanh toán cơ bản
- `/contracts`: cho người thuê xem hợp đồng của chính mình

Backend chưa có:

- Namespace `/accounting/*`
- Luồng xử lý riêng cho kế toán
- Refund / hoàn cọc
- Reconciliation / đối soát
- Transaction matching / tra soát giao dịch
- Initial billing / lập phiếu đầu kỳ
- Extra invoice / phiếu phát sinh
- Dashboard và statement cho kế toán

### 3.3. UI kế toán hiện ở trạng thái nửa mock, nửa chuẩn bị gọi API

Hiện có 2 kiểu file ở frontend:

- Một số page gọi `accounting.service.js`
- Một số page vẫn đang hardcode dữ liệu cục bộ trong component

Điều này có nghĩa là backend chưa cần bám tuyệt đối vào local mock của từng page, nhưng cần bám vào contract mục tiêu trong `accounting.service.js` và chuẩn hóa thêm các page hardcode sau đó.

---

## 4. Mapping nghiệp vụ sang backend kế toán

### 4.1. Hợp đồng chờ lập khoản thu

Nguồn nghiệp vụ:

- Sau khi khách đủ điều kiện, ký hợp đồng và vào ở, kế toán tính các khoản cần thu đầu kỳ.

Backend cần hỗ trợ:

- Lấy danh sách hợp đồng ở trạng thái đủ điều kiện lập phiếu đầu kỳ
- Lấy chi tiết hợp đồng để tính tiền thuê kỳ đầu, tiền cọc, phí kèm theo
- Tạo phiếu thu đầu kỳ từ hợp đồng

### 4.2. Đặt cọc và thanh toán cọc

Nguồn nghiệp vụ:

- Tiền cọc = tiền thuê 2 tháng x số giường thuê
- Hạn thanh toán cọc là 24 giờ
- Sau khi quản lý xác nhận nhận tiền, chỗ đã cọc không được nhận khách khác

Backend cần hỗ trợ:

- Tạo hóa đơn cọc
- Tạo ghi nhận thanh toán cọc
- Xác nhận thanh toán cọc
- Cập nhật trạng thái yêu cầu thuê, giữ chỗ và khả năng cho thuê của phòng/giường

### 4.3. Phiếu phát sinh

Nguồn nghiệp vụ:

- Phí phát sinh sau hợp đồng gồm bồi thường, dịch vụ bổ sung, khoản truy thu

Backend cần hỗ trợ:

- Tạo phiếu phát sinh gắn với hợp đồng
- Lưu danh sách line item phát sinh
- Sinh hóa đơn hoặc phiếu thu tương ứng
- Hỗ trợ xác nhận đã thu

### 4.4. Trả phòng, đối soát và hoàn cọc

Nguồn nghiệp vụ:

- Hoàn cọc theo tỷ lệ dựa trên trạng thái thuê và thời gian lưu trú
- Trừ các khoản công nợ, hư hỏng, dịch vụ, vi phạm
- Có thể hoàn thêm hoặc thu thêm

Backend cần hỗ trợ:

- Tính tỷ lệ hoàn cọc cơ bản
- Tổng hợp khấu trừ từ nhiều nguồn
- Tạo bảng đối soát
- Tạo phiếu hoàn cọc hoặc khoản thu thêm
- Chốt thanh lý hợp đồng và trả phòng

### 4.5. Tra soát giao dịch

Nguồn nghiệp vụ:

- Cần kiểm tra giao dịch thanh toán giữa hệ thống nội bộ và dòng tiền thực tế

Backend cần hỗ trợ:

- Lưu transaction log
- Đối chiếu giao dịch ngân hàng/cổng thanh toán với hóa đơn nội bộ
- Đánh dấu matched, unmatched, mismatch, pending
- Cho phép xử lý thủ công các giao dịch lệch

### 4.6. Dashboard và báo cáo tài chính

Nguồn UI:

- Dashboard hiển thị KPI doanh thu, phiếu thu, hoàn cọc, giao dịch
- Reconciliation page và dashboard cần tổng hợp theo kỳ

Backend cần hỗ trợ:

- KPI tổng hợp theo tháng hoặc khoảng thời gian
- Revenue breakdown theo loại khoản thu
- Collection rate
- Số lượng giao dịch lỗi, mismatch, pending

---

## 5. Phân tích theo từng màn hình UI kế toán

### 5.1. Dashboard kế toán

UI đang cần các dữ liệu sau:

- KPI tổng doanh thu
- Số phiếu thu tổng cộng, đã thanh toán, quá hạn, đang chờ
- Số yêu cầu hoàn cọc theo trạng thái
- Thống kê giao dịch qua cổng thanh toán
- Danh sách phiếu thu gần đây
- Danh sách hợp đồng cần lập phiếu

Backend dự kiến cần endpoint:

- `GET /accounting/dashboard`
- Có thể cần thêm filter `period`, `from`, `to`, `branchId`

### 5.2. Danh sách hợp đồng chờ lập khoản thu

UI cần:

- Danh sách hợp đồng
- Filter theo ngày ký, loại phòng, tầng hoặc khu vực
- Action “Lập khoản thu”

Backend dự kiến cần endpoint:

- `GET /accounting/contracts`
- `GET /accounting/contracts/:id`
- `POST /accounting/billing/generate-initial`

### 5.3. Lập phiếu thu đầu kỳ

UI cần:

- Chọn hợp đồng
- Lấy thông tin khách thuê
- Lấy thông tin phòng hoặc giường
- Tính tiền thuê kỳ đầu theo ngày
- Tính tiền cọc
- Nhập phụ phí
- Lưu nháp
- Tạo phiếu thu

Backend dự kiến cần endpoint:

- `GET /accounting/contracts/:id/billing-preview`
- `POST /accounting/invoices`
- Nếu hỗ trợ nháp: `POST /accounting/invoices/drafts` hoặc dùng trường trạng thái draft

### 5.4. Danh sách phiếu thu

UI cần:

- Danh sách invoice
- Filter theo thời gian, phương thức, mã hợp đồng, trạng thái
- Xem chi tiết
- Xác nhận thanh toán
- Export CSV

Backend dự kiến cần endpoint:

- `GET /accounting/invoices`
- `GET /accounting/invoices/:id`
- `POST /accounting/payments`
- `POST /accounting/payments/:id/confirm`

### 5.5. Phiếu phát sinh

UI cần:

- Chọn cư dân hoặc hợp đồng
- Tạo nhiều dòng phí phát sinh
- Chọn phương thức thanh toán
- Xác nhận đã thu hoặc hủy

Backend dự kiến cần endpoint:

- `POST /accounting/invoices/extra`
- `GET /accounting/extra-charges` nếu tách bảng riêng
- `POST /accounting/payments`

### 5.6. Phiếu hoàn cọc

UI cần:

- Lấy thông tin hợp đồng, khách hàng, phòng hoặc giường
- Hiển thị tiền cọc gốc, khấu trừ, số thực hoàn
- Chọn phương thức hoàn tiền
- Lưu nháp
- Phát hành phiếu chi

Backend dự kiến cần endpoint:

- `GET /accounting/refunds`
- `GET /accounting/refunds/:id`
- `POST /accounting/refunds`
- `PUT /accounting/refunds/:id`

### 5.7. Tra soát giao dịch

UI cần:

- Danh sách transaction log
- Filter theo từ khóa, thời gian, trạng thái
- Thống kê tổng giao dịch, cần xử lý, đã khớp, tổng chênh lệch
- Xử lý các giao dịch mismatch hoặc not found

Backend dự kiến cần endpoint:

- `GET /accounting/transactions`
- `GET /accounting/transactions/:id`
- `POST /accounting/transactions/:id/resolve`

### 5.8. Đối soát tài chính

UI cần:

- Tải dữ liệu nguồn hợp đồng
- Danh sách hạng mục khấu trừ
- Công nợ dịch vụ cuối kỳ
- Minh chứng và tệp đính kèm
- Tính quyết toán tạm tính
- Phê duyệt lập lệnh chi

Backend dự kiến cần endpoint:

- `GET /accounting/reconciliation/:periodOrContractId`
- `POST /accounting/reconciliation`
- Có thể thêm `PUT /accounting/reconciliation/:id` nếu hỗ trợ nháp

---

## 6. Những điểm đã chốt để code theo DB hiện tại

Phần này phản ánh quyết định cuối cùng trước khi bắt đầu code backend accounting.

### 6.1. Công thức tiền cọc bị lệch giữa nghiệp vụ và UI

Theo ngữ cảnh người dùng cung cấp:

- Tiền cọc = tiền thuê 2 tháng x số giường thuê

Nhưng trong `AccountingBillingPage.jsx` hiện đang tính:

- `deposit = contract.baseRate`
- Tức đang coi tiền cọc = 1 tháng tiền nhà

Kết luận:

- Backend phải theo nghiệp vụ gốc, không theo mock hiện tại của UI
- Với thuê giường: cọc = tiền thuê tháng của giường x 2 x 1
- Với thuê nguyên phòng: dùng sức chứa phòng làm số giường thuê, nhưng quy đổi tiền thuê tháng về đơn giá theo giường trước khi nhân, để tổng cọc tương đương 2 tháng tiền thuê của cả phòng

### 6.2. Status ở UI chưa đồng nhất hoàn toàn

Ví dụ:

- `INVOICE_STATUS` trong constants có `PENDING`, `COMPLETED`, `OVERDUE`, `CANCELLED`
- `AccountingInvoiceListPage.jsx` lại dùng thêm `REFUNDED`
- `mockInvoices` dùng `DEPOSIT`, `MONTHLY_RENT`, `EXTRA`, `FINAL`
- Một số màn hình hiển thị label tiếng Việt nhưng service dùng enum tiếng Anh

Kết luận đã chốt:

- Invoice status ở backend chỉ còn 4 giá trị chuẩn hóa: `PENDING`, `COMPLETED`, `OVERDUE`, `CANCELLED`
- Các trạng thái raw trong DB vẫn được giữ nguyên ở cột `trang_thai`, nhưng API accounting sẽ map về 4 trạng thái này để frontend dùng thống nhất

### 6.3. Refund và reconciliation đang chồng lấn trách nhiệm

Hiện UI có cả:

- `AccountingRefundPage`: lập phiếu hoàn cọc
- `AccountingReconciliationPage`: lập bảng đối soát tài chính trước hoàn cọc

Nghiệp vụ backend đã chốt:

1. Reconciliation là bước tính toán và chốt số phải trả hoặc phải thu
2. Reconciliation là bản để có thể xuất PDF, đưa khách xác nhận và ký ngoài đời thực
3. Refund là chứng từ hoàn cọc được tạo sau khi bảng đối soát đã được xác nhận ở cả 2 phía
4. Phiếu thanh toán phát sinh cũng chỉ nên sinh sau bước đối soát được chốt

Kết luận:

- Nên tách rõ 2 đối tượng dữ liệu này trong backend

### 6.4. Transaction page đang mô tả cả sao kê ngân hàng lẫn trạng thái matching nội bộ

Kết luận đã chốt:

- Giai đoạn đầu chỉ dùng bảng `thanh_toan` để dựng dữ liệu transaction và matching cơ bản
- Không tạo thêm bảng sao kê hoặc import bank feed mới trong đợt code này
- Chỉ tổng hợp theo view ở tầng API/service, hạn chế sửa DB tối đa

### 6.5. Chưa có role kế toán rõ ràng trong backend hiện tại

Tài liệu dự án hiện có role:

- `KHACH_HANG`
- `NHAN_VIEN`
- `ADMIN`

Nhưng theo yêu cầu đã chốt, backend cần thêm role `KE_TOAN`.

Kết luận đã chốt:

- Backend sẽ đọc role chính từ `ho_so.vai_tro`
- Các route `/accounting/*` cho phép `ADMIN`, `NHAN_VIEN`, `KE_TOAN`
- `profiles.role` chỉ còn vai trò fallback tương thích ngược cho auth hiện tại

### 6.6. Một số route chi tiết trên frontend chưa tồn tại

Ví dụ:

- Dashboard có navigate đến chi tiết invoice
- Router hiện mới có các route list page cho accounting, chưa có route detail page tương ứng

Kết luận bổ sung:

- Backend vẫn chuẩn bị endpoint detail cho invoice, contract, reconciliation, refund
- Các phần draft, upload minh chứng và export PDF thật chưa phải trọng tâm ở đợt code đầu tiên

---

## 7. Đề xuất kiến trúc backend cho module kế toán

Để giữ phong cách hiện tại của dự án, nên tiếp tục mô hình:

- Route -> Controller -> Service -> Model

### 7.1. Route đề xuất

Thêm file:

- `backend/src/routes/accounting.routes.js`

Gắn vào:

- `backend/src/routes/index.js`

Base path:

- `/api/accounting`

### 7.2. Controller, service, model thực tế ở đợt 1

Để đi nhanh nhưng vẫn giữ đúng tầng kiến trúc, đợt code đầu đang dùng một module thống nhất:

- `backend/src/controllers/accounting.controller.js`
- `backend/src/services/accounting.service.js`
- `backend/src/models/accounting.model.js`

Lý do chọn cách này ở đợt đầu:

- Dựng nhanh namespace accounting để frontend có API thật
- Giảm số file phải mở rộng cùng lúc trong khi logic còn đang bám sát schema tiếng Việt hiện tại
- Khi nghiệp vụ ổn định hơn có thể tách controller/service/model theo subdomain ở đợt sau

### 7.3. Thành phần hỗ trợ mới đã thêm

- `backend/src/middlewares/accounting.middleware.js`
- `backend/src/utils/roleUtils.js`

### 7.4. Chiến lược dữ liệu ở đợt 1

- Tái sử dụng trực tiếp các bảng hiện có trong schema tiếng Việt
- Không thêm bảng mới cho accounting
- Tập trung vào các bảng: `hop_dong`, `hoa_don`, `chi_tiet_hoa_don`, `khoan_thu_hop_dong`, `thanh_toan`, `bien_lai`, `doi_soat_tai_chinh`, `chi_tiet_doi_soat_tai_chinh`, `phieu_hoan_coc`
- Dữ liệu dashboard, transaction và report tạm thời được tổng hợp ở tầng service/model thay vì tạo view DB riêng

### 7.5. Middleware đề xuất

Cần bổ sung middleware kiểm tra quyền kế toán, ví dụ:

- `requireAccountingAccess`

Chức năng:

- Chặn khách hàng thường truy cập `/accounting/*`
- Cho phép `ADMIN` và role phù hợp

---

## 8. Danh sách API backend đề xuất

### 8.1. Dashboard

- `GET /accounting/dashboard` - đã code
- `GET /accounting/statement?period=YYYY-MM` - chưa code ở đợt 1

### 8.2. Contracts và billing đầu kỳ

- `GET /accounting/contracts`
- `GET /accounting/contracts/:id`
- `GET /accounting/contracts/:id/billing-preview`
- `POST /accounting/billing/generate-initial`

### 8.3. Invoice

- `GET /accounting/invoices` - đã code
- `GET /accounting/invoices/:id` - đã code
- `POST /accounting/invoices` - đã code
- `PUT /accounting/invoices/:id` - chưa code
- `POST /accounting/invoices/send-reminders` - chưa code

### 8.4. Extra invoice

- `POST /accounting/invoices/extra` - đã code
- `GET /accounting/extra-charges` - chưa code tách riêng

### 8.5. Payment

- `GET /accounting/payments` - đã code
- `POST /accounting/payments` - đã code
- `POST /accounting/payments/:id/confirm` - đã code

### 8.6. Refund

- `GET /accounting/refunds` - đã code
- `GET /accounting/refunds/:id` - đã code
- `POST /accounting/refunds` - đã code
- `PUT /accounting/refunds/:id` - chưa code

### 8.7. Transactions

- `GET /accounting/transactions` - đã code
- `GET /accounting/transactions/:id` - chưa code
- `POST /accounting/transactions/:id/resolve` - chưa code

### 8.8. Reconciliation

- `GET /accounting/reconciliation` - đã code
- `GET /accounting/reconciliation/:id` - đã code
- `POST /accounting/reconciliation` - đã code
- `PUT /accounting/reconciliation/:id` - chưa code

### 8.9. Reports

- Chưa code riêng ở đợt 1
- Tạm thời dùng dữ liệu tổng hợp từ `GET /accounting/dashboard`, `GET /accounting/transactions`, `GET /accounting/reconciliation`

---

## 9. Dữ liệu đầu ra mà frontend đang ngầm mong đợi

Phần này không phải schema DB, mà là shape response ở tầng API.

### 9.1. Dashboard KPI

Frontend đang kỳ vọng object kiểu:

```json
{
  "totalRevenue": 1280000000,
  "monthlyChange": 125000000,
  "monthlyChangePercent": 10.8,
  "invoiceStats": {
    "total": 1402,
    "completed": 1058,
    "overdue": 156,
    "pending": 188
  },
  "refundStats": {
    "pending": 45,
    "processing": 28,
    "completed": 312,
    "failed": 8
  },
  "transactionStats": {
    "total": 1402,
    "successful": 1378,
    "mismatch": 24,
    "pending": 0
  }
}
```

### 9.2. Contract list cho kế toán

Frontend đang dùng các field gần như sau:

- `id`
- `customerName`
- `customerId`
- `roomNumber`
- `bedNumber`
- `rentalType`
- `startDate`
- `baseRent`
- `securityDeposit`
- `status`

### 9.3. Invoice list

Frontend đang dùng các field gần như sau:

- `id`
- `contractId`
- `customerId`
- `customerName`
- `invoiceType`
- `amount`
- `dueDate`
- `issueDate`
- `status`
- `paymentMethod`
- `paymentDate`
- `description`
- `notes`

### 9.4. Refund

Frontend đang dùng các field gần như sau:

- `id`
- `contractId`
- `customerId`
- `customerName`
- `originalDeposit`
- `deductedAmount`
- `refundAmount`
- `refundRatio`
- `reason`
- `status`
- `refundMethod`

### 9.5. Transaction log

Frontend đang dùng các field gần như sau:

- `id`
- `refNumber`
- `invoiceId`
- `contractId`
- `amount`
- `status`
- `matchStatus`
- `variance`
- `issueDate`
- `transactionDate`
- `systemAmount`
- `actualAmount`
- `notes`

---

## 10. Tận dụng backend hiện tại được đến đâu

### 10.1. Có thể tái sử dụng

- Supabase client ở `config/supabase.js`
- `sendSuccess`, `asyncHandler`, `validate.middleware.js`
- Một phần `invoice.model.js`, `payment.model.js`, `contract.model.js`
- Cấu trúc route tổng của backend hiện có

### 10.2. Cần mở rộng mạnh

- `invoice.model.js`: hiện chỉ list invoice theo user cuối, chưa phục vụ kế toán
- `payment.model.js`: hiện chỉ list payment theo user cuối và insert đơn giản
- `contract.model.js`: hiện chỉ lấy hợp đồng của chính user, chưa hỗ trợ filter nghiệp vụ kế toán

### 10.3. Không thể tái sử dụng trực tiếp

- `payment.routes.js` hiện là luồng cho khách thuê, không phải luồng kế toán
- `payment.service.js` hiện chưa có xác nhận thanh toán, tra soát, thống kê

---

## 11. Lộ trình tiếp theo sau đợt code 1

### Giai đoạn 2. Nối frontend thật

1. Tắt mock trong `frontend/src/services/accounting.service.js`
2. Nối các page đang gọi mock vào API thật
3. Chuẩn hóa lại các màn hình đang hardcode status sai, nhất là invoice list có thêm `REFUNDED`
4. Đồng bộ công thức tiền cọc ở UI với billing preview từ backend

### Giai đoạn 3. Bổ sung command API còn thiếu

1. `PUT /accounting/invoices/:id`
2. `PUT /accounting/reconciliation/:id`
3. `PUT /accounting/refunds/:id`
4. `GET /accounting/transactions/:id`
5. `POST /accounting/transactions/:id/resolve`

### Giai đoạn 4. Chứng từ và báo cáo

1. Tạo output phù hợp để export PDF cho bảng đối soát
2. Bổ sung statement hoặc report tổng hợp nếu frontend thực sự dùng
3. Chỉ cân nhắc upload minh chứng khi đi tới feature đó

---

## 12. Các điểm còn mở sau đợt code 1

Đây là các điểm chưa chặn việc chạy backend, nhưng cần chốt ở vòng sau:

1. Có cần cơ chế draft thật cho invoice, reconciliation, refund hay hiện tại lưu thẳng record vào DB là đủ?
2. Nếu có draft, record nháp có cần xóa hay chỉ đổi trạng thái khi phát hành?
3. Có cần route export PDF thật cho bảng đối soát hay frontend tự render PDF từ dữ liệu API?
4. Có cần upload minh chứng checkout hoặc chứng từ đối soát vào Supabase Storage hay chưa cần ở giai đoạn này?
5. Có cần thêm field ghi chú hoặc trạng thái xử lý thủ công cho transaction matching hay chưa?
6. Có cần filter theo tòa, tầng, chi nhánh khi số liệu thực tế bắt đầu lớn hơn?

---

## 13. Khuyến nghị cho vòng tiếp theo

1. Test từng endpoint accounting với dữ liệu Supabase thật để rà lại tên trạng thái raw trong DB
2. Nối frontend dashboard, contracts, invoices trước vì đây là nhóm màn hình đã có service rõ nhất
3. Sau khi luồng create reconciliation ổn, mới nối tiếp luồng create refund và phiếu thanh toán phát sinh
4. Chỉ tách `accounting.controller/service/model` thành nhiều file khi logic bắt đầu ổn định hơn

---

## 14. Kết luận hiện tại

Sau khi đối chiếu nghiệp vụ với DB hiện có và code đợt 1, có thể kết luận:

- Frontend kế toán cần một namespace backend riêng và backend hiện đã có khung `/api/accounting`
- DB hiện tại đủ để dựng các feature accounting cốt lõi mà không phải thêm bảng mới
- Công thức tiền cọc, enum invoice status, vai trò `KE_TOAN` và ranh giới giữa reconciliation với refund đã được chốt và phản ánh vào backend
- Đợt code đầu tập trung vào feature chính và hạn chế sửa DB tối đa, đúng theo yêu cầu

Tài liệu này giờ vừa là kế hoạch triển khai tiếp theo, vừa là báo cáo các thay đổi đã được code.

---

## 15. Báo cáo triển khai backend accounting đợt 1

### 15.1. Các file đã thêm hoặc thay đổi

Đã thêm mới:

- `backend/src/routes/accounting.routes.js`
- `backend/src/controllers/accounting.controller.js`
- `backend/src/services/accounting.service.js`
- `backend/src/models/accounting.model.js`
- `backend/src/middlewares/accounting.middleware.js`
- `backend/src/utils/roleUtils.js`

Đã cập nhật:

- `backend/src/routes/index.js`
- `backend/src/middlewares/auth.middleware.js`

### 15.2. Những gì đã code

1. Thêm namespace backend mới `/api/accounting`
2. Thêm middleware phân quyền accounting với các role được phép:

- `ADMIN`
- `NHAN_VIEN`
- `KE_TOAN`

3. Đổi auth middleware để ưu tiên đọc role từ `ho_so.vai_tro`, giữ fallback từ `profiles.role`
4. Code API dashboard kế toán:

- tổng doanh thu từ thanh toán đã xác nhận
- thống kê invoice
- thống kê refund
- thống kê transaction
- invoice gần đây
- hợp đồng cần lập khoản thu

5. Code API contracts cho accounting:

- list contract
- contract detail
- billing preview đầu kỳ

6. Code công thức tiền cọc ở backend theo nghiệp vụ đã chốt
7. Code API invoice:

- list invoice
- invoice detail
- create invoice
- create extra invoice

8. Code API payment:

- list payments
- record payment vào `thanh_toan`
- confirm payment
- cộng dồn tiền đã thanh toán vào `hoa_don`
- sinh `bien_lai` khi xác nhận thanh toán

9. Code API transaction:

- dựng dữ liệu tra soát từ `thanh_toan` và `hoa_don`
- match cơ bản theo số tiền hệ thống và số tiền thực thu

10. Code API reconciliation:

- list reconciliation
- reconciliation detail
- create reconciliation
- tính số hoàn lại và số cần thanh toán thêm

11. Code API refund:

- list refund voucher
- refund detail
- create refund voucher từ reconciliation

### 15.3. Nguyên tắc đã giữ trong đợt code này

- Không thêm bảng mới vào DB
- Bám sát naming tiếng Việt của schema hiện tại
- Dùng `thanh_toan` làm bảng thanh toán trung tâm
- Dùng tầng service/model để tổng hợp dữ liệu thay vì sửa DB hoặc tạo view mới ngay
- Các feature đã được comment trực tiếp trong route và service để mô tả rõ accounting feature đó làm gì

### 15.4. Những phần chưa làm trong đợt 1

- Export PDF thật cho bảng đối soát
- Route detail và resolve riêng cho transaction
- Update invoice, refund, reconciliation
- Draft workflow thật
- Upload ảnh minh chứng hoặc file chứng từ
- Báo cáo statement chuyên biệt

### 15.5. Kiểm tra sau khi code

Đã kiểm tra:

- Không có lỗi cú pháp ở các file backend accounting mới thêm
- Load module bằng Node thành công

Chưa kiểm tra:

- Chạy integration test với Supabase thật
- Kiểm thử từng endpoint bằng dữ liệu thực tế
