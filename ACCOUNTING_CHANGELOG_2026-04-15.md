# Ghi Chú Thay Đổi Accounting

## Ngày cập nhật

- Ngày: 15/04/2026
- Phạm vi: Backend accounting, tài liệu test API, và nối frontend accounting vào backend thật cho các chức năng cơ bản

---

## 1. Tổng quan thay đổi trong ngày 15/04/2026

Trong đợt làm việc này đã thực hiện 3 nhóm thay đổi chính:

1. Dựng backend accounting theo schema hiện tại, hạn chế sửa DB tối đa
2. Viết tài liệu hướng dẫn test API accounting bằng Postman
3. Nối frontend accounting vào backend thật cho các màn cơ bản có thể dùng ngay

---

## 2. Các thay đổi backend đã thực hiện

### 2.1. Thêm namespace API kế toán

Đã thêm namespace mới:

- `/api/accounting`

Mục đích:

- Tách riêng luồng nghiệp vụ kế toán khỏi các route payment hiện có của người thuê

### 2.2. Thêm route accounting

Đã thêm file:

- `backend/src/routes/accounting.routes.js`

Đã cập nhật file:

- `backend/src/routes/index.js`

Nội dung sửa:

- Gắn route `/accounting` vào router tổng của backend

### 2.3. Thêm controller, service, model cho accounting

Đã thêm các file:

- `backend/src/controllers/accounting.controller.js`
- `backend/src/services/accounting.service.js`
- `backend/src/models/accounting.model.js`

Mục đích:

- Gom toàn bộ logic accounting đợt 1 vào một module thống nhất để đi nhanh và bám sát schema hiện tại

### 2.4. Thêm middleware phân quyền accounting

Đã thêm file:

- `backend/src/middlewares/accounting.middleware.js`

Mục đích:

- Chặn người dùng không có quyền truy cập `/api/accounting/*`

Role được cho phép:

- `ADMIN`
- `NHAN_VIEN`
- `KE_TOAN`

### 2.5. Chuẩn hóa role backend

Đã thêm file:

- `backend/src/utils/roleUtils.js`

Đã cập nhật file:

- `backend/src/middlewares/auth.middleware.js`

Nội dung sửa:

- Ưu tiên đọc role từ `ho_so.vai_tro`
- Giữ `profiles.role` làm fallback tương thích ngược
- Hỗ trợ chuẩn hóa role `KE_TOAN`

### 2.6. Các API accounting đã code

#### Dashboard

- `GET /api/accounting/dashboard`

#### Contracts và billing preview

- `GET /api/accounting/contracts`
- `GET /api/accounting/contracts/:id`
- `GET /api/accounting/contracts/:id/billing-preview`
- `POST /api/accounting/billing/generate-initial`

#### Invoices

- `GET /api/accounting/invoices`
- `GET /api/accounting/invoices/:id`
- `POST /api/accounting/invoices`
- `POST /api/accounting/invoices/extra`

#### Payments

- `GET /api/accounting/payments`
- `POST /api/accounting/payments`
- `POST /api/accounting/payments/:id/confirm`

#### Transactions

- `GET /api/accounting/transactions`

#### Reconciliation

- `GET /api/accounting/reconciliation`
- `GET /api/accounting/reconciliation/:id`
- `POST /api/accounting/reconciliation`

#### Refunds

- `GET /api/accounting/refunds`
- `GET /api/accounting/refunds/:id`
- `POST /api/accounting/refunds`

### 2.7. Nghiệp vụ backend đã chốt và phản ánh vào code

#### Công thức tiền cọc

- Theo nghiệp vụ: tiền cọc = tiền thuê 2 tháng x số giường thuê
- Với thuê giường: tính trực tiếp theo giường
- Với thuê nguyên phòng: quy đổi theo sức chứa phòng để tổng cọc tương đương 2 tháng tiền thuê cả phòng

#### Invoice status chuẩn hóa

Backend chuẩn hóa invoice status về 4 giá trị:

- `PENDING`
- `COMPLETED`
- `OVERDUE`
- `CANCELLED`

#### Thanh toán

- Dùng bảng `thanh_toan` làm trung tâm theo yêu cầu
- Khi xác nhận payment sẽ cộng dồn vào `hoa_don`
- Có sinh `bien_lai` sau khi xác nhận thành công

#### Reconciliation và refund

- `reconciliation` là bước đối soát nghiệp vụ trước khi ra chứng từ thực tế
- `refund` là phiếu hoàn cọc sinh sau bước đối soát

---

## 3. Các thay đổi tài liệu đã thực hiện

### 3.1. Cập nhật kế hoạch backend accounting

Đã cập nhật file:

- `ACCOUNTING_BACKEND_PLAN.md`

Nội dung sửa:

- Chốt lại các quyết định nghiệp vụ theo schema hiện tại
- Đồng bộ tài liệu với backend đã code
- Bổ sung báo cáo triển khai đợt 1

### 3.2. Thêm hướng dẫn test Postman

Đã thêm file:

- `ACCOUNTING_API_POSTMAN_GUIDE.md`

Nội dung:

- Danh sách API accounting đã có
- Cách lấy token thật để test
- Hướng dẫn test bằng Postman
- Các request mẫu và lỗi thường gặp

Lưu ý:

- Tài liệu này ban đầu được viết khi frontend chưa nối backend thật
- Sau đó frontend đã được nối cho một số màn cơ bản, nên nếu cần có thể cập nhật lại file này ở vòng sau

---

## 4. Các thay đổi frontend đã thực hiện trong ngày 15/04/2026

### 4.1. Chuẩn hóa service accounting để gọi backend thật

Đã cập nhật file:

- `frontend/src/services/accounting.service.js`

Nội dung sửa:

- Không còn hardcode mock mặc định nữa
- Đổi `USE_MOCK_DATA` sang dùng biến môi trường:
  - `VITE_USE_ACCOUNTING_MOCK=true` thì mới dùng mock
- Chuẩn hóa response backend về cùng một shape cho frontend dùng
- Thêm các hàm unwrap và normalize dữ liệu list/detail
- Map thêm các field UI như:
  - `avatarInitials`
  - `method`
  - `paidDate`
  - `statusText`
  - `isOverdue`

### 4.2. Nối trang Dashboard kế toán vào backend thật

Đã cập nhật file:

- `frontend/src/pages/accounting/AccountingDashboardPage.jsx`

Nội dung sửa:

- Dùng dữ liệu thật từ:
  - `getDashboardKPI()`
  - `getContracts()`
  - `getInvoices()`
- Sửa cách tính `invoicePending` theo đúng dữ liệu backend
- Bỏ điều hướng vào route detail chưa tồn tại
- Action “Lập phiếu” truyền `contractId` sang trang billing qua `navigate state`

### 4.3. Nối trang Danh sách hợp đồng vào backend thật

Đã cập nhật file:

- `frontend/src/pages/accounting/AccountingContractListPage.jsx`

Nội dung sửa:

- Bỏ mock contracts cứng trong table
- Dùng `getContracts()` để fetch data thật
- Thêm lọc cơ bản ở frontend theo:
  - tháng hiện tại
  - loại thuê `PHONG` hoặc `GIUONG`
  - tầng 1 hoặc tầng 2
- Chuẩn hóa hiển thị:
  - loại thuê
  - ngày bắt đầu
  - tiền thuê bằng `formatCurrency`
  - badge trạng thái theo `CONTRACT_STATUS`
- Action “Lập khoản thu” truyền `contractId` sang màn billing
- Sửa phần thống kê cuối bảng thành dùng số lượng dữ liệu thật

### 4.4. Nối trang Danh sách phiếu thu vào backend thật

Đã cập nhật file:

- `frontend/src/pages/accounting/AccountingInvoiceListPage.jsx`

Nội dung sửa:

- Bỏ toàn bộ mock invoice trong component
- Dùng `getInvoices()` để fetch data thật
- Thêm các state:
  - `loading`
  - `filterState`
  - `searchTerm`
- Thêm tìm kiếm theo input mã hợp đồng hoặc từ khóa
- Tính lại các số liệu tổng từ invoice đã fetch:
  - `totalRevenue`
  - `completedAmount`
  - `pendingAmount`
  - `overdueAmount`
- Chuẩn hóa hiển thị:
  - format tiền
  - format ngày
  - method và paidDate fallback
- Thêm chức năng xác nhận thanh toán bằng API `confirmPayment()` nếu invoice có payment chờ xác nhận
- Bỏ action “xem chi tiết” vì frontend chưa có route detail cho invoice

---

## 5. Trạng thái hiện tại sau khi sửa

### 5.1. Backend đã đáp ứng được các chức năng cơ bản nào

Ở mức chức năng cơ bản theo ngữ cảnh nghiệp vụ, backend hiện đã đủ để hỗ trợ:

- Dashboard kế toán
- Danh sách hợp đồng chờ lập khoản thu
- Danh sách phiếu thu
- Billing preview đầu kỳ
- Tạo phiếu thu đầu kỳ
- Tạo phiếu phát sinh
- Ghi nhận thanh toán
- Xác nhận thanh toán
- Danh sách transaction cơ bản
- Danh sách reconciliation cơ bản
- Danh sách refund cơ bản

### 5.2. Frontend đã nối vào backend thật cho những trang nào

Đã nối thật:

- `AccountingDashboardPage.jsx`
- `AccountingContractListPage.jsx`
- `AccountingInvoiceListPage.jsx`

Chưa nối thật trong đợt này:

- `AccountingBillingPage.jsx`
- `AccountingExtraInvoicePage.jsx`
- `AccountingRefundPage.jsx`
- `AccountingTransactionPage.jsx`
- `AccountingReconciliationPage.jsx`

### 5.3. Các phần còn thiếu hoặc chưa hoàn thiện

Backend chưa có hoặc chưa hoàn thiện các phần sau:

- `PUT /api/accounting/invoices/:id`
- `PUT /api/accounting/refunds/:id`
- `PUT /api/accounting/reconciliation/:id`
- `GET /api/accounting/transactions/:id`
- `POST /api/accounting/transactions/:id/resolve`
- `GET /api/accounting/statement`
- `POST /api/accounting/reports`
- Export PDF thật cho bảng đối soát

Frontend còn cần nối tiếp cho các màn:

- Billing
- Extra invoice
- Refund
- Transaction
- Reconciliation

---

## 6. Kiểm tra và xác nhận kỹ thuật

### 6.1. Backend

Đã kiểm tra:

- Không có lỗi cú pháp ở backend accounting đã thêm
- Load route tree và module backend thành công

### 6.2. Frontend

Đã kiểm tra:

- Build frontend thành công sau khi nối API thật cho 3 màn cơ bản

Kết quả:

- `npm run build` ở frontend đã chạy thành công

Ghi chú:

- Vẫn còn một số cảnh báo style nhỏ trong Problems panel nhưng không chặn build

---

## 7. Kết luận ngắn gọn

Ngày 15/04/2026 đã hoàn thành:

1. Dựng backend accounting đợt 1 theo schema hiện tại
2. Thêm tài liệu test Postman cho accounting API
3. Nối frontend vào backend thật cho 3 màn cơ bản nhất của kế toán:
   - dashboard
   - contract list
   - invoice list

Nếu tiếp tục ở vòng sau, thứ tự hợp lý nhất là:

1. Nối `AccountingBillingPage.jsx`
2. Nối `AccountingExtraInvoicePage.jsx`
3. Nối `AccountingRefundPage.jsx`
4. Nối `AccountingReconciliationPage.jsx`
5. Nối `AccountingTransactionPage.jsx`