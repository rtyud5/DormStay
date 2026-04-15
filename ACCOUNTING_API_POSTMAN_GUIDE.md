# Accounting API Postman Guide

## 1. Trạng thái kết nối frontend

Hiện tại frontend accounting **chưa nối vào backend thật**.

Lý do:

- `frontend/src/services/accounting.service.js` vẫn đang để `USE_MOCK_DATA = true`
- Vì vậy các page accounting hiện vẫn dùng mock data thay vì gọi `/api/accounting/*`

---

## 2. Base URL

Backend local đang chạy theo dạng:

```text
http://localhost:4000/api
```

Health check:

```http
GET http://localhost:4000/health
```

---

## 3. Điều kiện để gọi được API accounting

Tất cả route dưới `/api/accounting/*` đều đang bị chặn bởi:

- `authMiddleware`
- `requireAccountingAccess`

Nghĩa là request phải có:

1. `Authorization: Bearer <access_token_that_is_valid_with_supabase>`
2. User tương ứng phải có role trong `ho_so.vai_tro` là một trong các giá trị sau:
   - `ADMIN`
   - `NHAN_VIEN`
   - `KE_TOAN`

Lưu ý quan trọng:

- `POST /api/auth/login` hiện chỉ trả demo token
- Demo token này **không dùng được** cho `/api/accounting/*`
- Muốn test accounting API, bạn phải dùng access token thật của Supabase

---

## 4. Cách lấy token để test Postman

### Cách đơn giản nhất

1. Chạy frontend và đăng nhập bằng tài khoản thật đã đi qua Supabase auth
2. Mở DevTools của trình duyệt
3. Vào tab `Application` hoặc `Storage`
4. Mở `Local Storage`
5. Lấy giá trị key:

```text
dormstay_token
```

6. Dán giá trị đó vào Postman dưới dạng Bearer token

### Điều kiện role

Sau khi có token, hãy kiểm tra user đó có role hợp lệ trong bảng `ho_so`:

```sql
select ma_ho_so, ho_ten, email, vai_tro
from public.ho_so
where ma_nguoi_dung_xac_thuc = '<supabase_user_uuid>';
```

Nếu `vai_tro` chưa phải là `KE_TOAN`, `NHAN_VIEN` hoặc `ADMIN`, bạn cần update lại trước khi test.

Ví dụ:

```sql
update public.ho_so
set vai_tro = 'KE_TOAN'
where email = 'your-account@example.com';
```

---

## 5. Thiết lập Postman environment

Tạo các biến sau trong Postman:

```text
baseUrl = http://localhost:4000/api
token = <paste_supabase_access_token_here>
contractId =
invoiceId =
paymentId =
reconciliationId =
refundId =
```

Header dùng chung cho hầu hết request:

```http
Authorization: Bearer {{token}}
Content-Type: application/json
```

---

## 6. Thứ tự test khuyến nghị

Nên test theo thứ tự này để dễ lấy ID cho các request sau:

1. `GET /health`
2. `GET /api/auth/me`
3. `GET /api/accounting/dashboard`
4. `GET /api/accounting/contracts`
5. `GET /api/accounting/contracts/:id`
6. `GET /api/accounting/contracts/:id/billing-preview`
7. `POST /api/accounting/invoices` hoặc `POST /api/accounting/billing/generate-initial`
8. `GET /api/accounting/invoices`
9. `GET /api/accounting/invoices/:id`
10. `POST /api/accounting/payments`
11. `POST /api/accounting/payments/:id/confirm`
12. `GET /api/accounting/transactions`
13. `POST /api/accounting/reconciliation`
14. `GET /api/accounting/reconciliation`
15. `POST /api/accounting/refunds`
16. `GET /api/accounting/refunds`

---

## 7. Smoke test trước khi test accounting

### 7.1. Health check

```http
GET {{baseUrl}}/../health
```

Do Postman không tự normalize đẹp kiểu trên, request thật nên gọi:

```http
GET http://localhost:4000/health
```

Kỳ vọng:

```json
{
  "success": true,
  "message": "Server is healthy"
}
```

### 7.2. Kiểm tra token và role

```http
GET {{baseUrl}}/auth/me
Authorization: Bearer {{token}}
```

Nếu token hợp lệ, bạn sẽ nhận được profile hiện tại.

Nếu request này lỗi `401`, token đang sai hoặc đã hết hạn.

Nếu request accounting lỗi `403`, token hợp lệ nhưng role chưa phải `ADMIN`, `NHAN_VIEN` hoặc `KE_TOAN`.

---

## 8. Danh sách API accounting đã có và cách test

## 8.1. Dashboard

### GET `/api/accounting/dashboard`

Mục đích:

- Lấy KPI tổng quan cho dashboard kế toán

Request:

```http
GET {{baseUrl}}/accounting/dashboard
Authorization: Bearer {{token}}
```

Query optional:

- `limit`

Ví dụ:

```http
GET {{baseUrl}}/accounting/dashboard?limit=5
```

Kỳ vọng dữ liệu:

- `totalRevenue`
- `invoiceStats`
- `refundStats`
- `transactionStats`
- `recentInvoices`
- `contractsNeedingBilling`

---

## 8.2. Contracts

### GET `/api/accounting/contracts`

Mục đích:

- Lấy danh sách hợp đồng để kế toán lập khoản thu

Request:

```http
GET {{baseUrl}}/accounting/contracts
Authorization: Bearer {{token}}
```

Query supported:

- `page`
- `limit`
- `status`
- `search`

Ví dụ:

```http
GET {{baseUrl}}/accounting/contracts?page=1&limit=10
GET {{baseUrl}}/accounting/contracts?status=ACTIVE
GET {{baseUrl}}/accounting/contracts?search=Nguyen
```

Khi có dữ liệu, lấy một `id` gán vào biến `contractId`.

### GET `/api/accounting/contracts/:id`

Mục đích:

- Lấy chi tiết một hợp đồng và các invoice liên quan

Request:

```http
GET {{baseUrl}}/accounting/contracts/{{contractId}}
Authorization: Bearer {{token}}
```

### GET `/api/accounting/contracts/:id/billing-preview`

Mục đích:

- Xem trước tiền thuê đầu kỳ, tiền cọc và line item trước khi lập phiếu

Request:

```http
GET {{baseUrl}}/accounting/contracts/{{contractId}}/billing-preview
Authorization: Bearer {{token}}
```

Kỳ vọng dữ liệu:

- `contract`
- `rent.monthlyRent`
- `rent.proratedFirstRent`
- `deposit.totalDeposit`
- `lineItems`
- `totalAmount`

---

## 8.3. Billing đầu kỳ

### POST `/api/accounting/billing/generate-initial`

Mục đích:

- Lập phiếu thu đầu kỳ từ hợp đồng

Body tối thiểu:

```json
{
  "contractId": 1,
  "lineItems": [
    {
      "category": "TIEN_THUE_DAU_KY",
      "description": "Tiền thuê đầu kỳ",
      "quantity": 1,
      "unitPrice": 2500000,
      "amount": 2500000
    },
    {
      "category": "TIEN_COC",
      "description": "Tiền cọc 2 tháng",
      "quantity": 1,
      "unitPrice": 5000000,
      "amount": 5000000
    }
  ]
}
```

Request:

```http
POST {{baseUrl}}/accounting/billing/generate-initial
Authorization: Bearer {{token}}
Content-Type: application/json
```

Sau khi tạo thành công, lấy `data.id` hoặc `data.raw.ma_hoa_don` để gán vào `invoiceId`.

---

## 8.4. Invoices

### GET `/api/accounting/invoices`

Mục đích:

- Lấy danh sách phiếu thu

Query supported:

- `page`
- `limit`
- `status`
- `invoiceType`
- `search`

Ví dụ:

```http
GET {{baseUrl}}/accounting/invoices?page=1&limit=10
GET {{baseUrl}}/accounting/invoices?status=PENDING
GET {{baseUrl}}/accounting/invoices?invoiceType=DEPOSIT
GET {{baseUrl}}/accounting/invoices?search=1
```

### GET `/api/accounting/invoices/:id`

Mục đích:

- Lấy chi tiết một invoice

Request:

```http
GET {{baseUrl}}/accounting/invoices/{{invoiceId}}
Authorization: Bearer {{token}}
```

### POST `/api/accounting/invoices`

Mục đích:

- Tạo invoice thường

Body ví dụ:

```json
{
  "contractId": 1,
  "invoiceType": "MONTHLY_RENT",
  "issueDate": "2026-04-15",
  "dueDate": "2026-04-20",
  "lineItems": [
    {
      "category": "TIEN_THUE",
      "description": "Tiền thuê tháng 4",
      "quantity": 1,
      "unitPrice": 3000000,
      "amount": 3000000
    }
  ]
}
```

### POST `/api/accounting/invoices/extra`

Mục đích:

- Tạo phiếu phát sinh

Body ví dụ:

```json
{
  "contractId": 1,
  "invoiceType": "EXTRA",
  "issueDate": "2026-04-15",
  "dueDate": "2026-04-18",
  "lineItems": [
    {
      "category": "PHAT_SINH",
      "description": "Bồi thường hư hỏng tài sản",
      "quantity": 1,
      "unitPrice": 450000,
      "amount": 450000
    }
  ]
}
```

---

## 8.5. Payments

### GET `/api/accounting/payments`

Mục đích:

- Lấy danh sách payment đã ghi nhận

Query supported:

- `page`
- `limit`

Ví dụ:

```http
GET {{baseUrl}}/accounting/payments?page=1&limit=10
```

### POST `/api/accounting/payments`

Mục đích:

- Ghi nhận một payment vào bảng `thanh_toan`

Body ví dụ:

```json
{
  "invoiceId": 1,
  "amount": 3000000,
  "method": "BANK_TRANSFER",
  "transactionCode": "TX-POSTMAN-001",
  "payerName": "Nguyen Van A",
  "paidAt": "2026-04-15T09:30:00.000Z"
}
```

Sau khi tạo xong, lấy `data.id` gán vào `paymentId`.

### POST `/api/accounting/payments/:id/confirm`

Mục đích:

- Xác nhận payment
- Cộng dồn tiền vào `hoa_don`
- Sinh `bien_lai`

Request:

```http
POST {{baseUrl}}/accounting/payments/{{paymentId}}/confirm
Authorization: Bearer {{token}}
```

Kỳ vọng:

- Invoice liên quan đổi trạng thái phù hợp
- Có thể thấy payment đã được xác nhận ở response

---

## 8.6. Transactions

### GET `/api/accounting/transactions`

Mục đích:

- Tra soát giao dịch dựa trên `thanh_toan` so với số tiền hệ thống của invoice

Query supported:

- `page`
- `limit`

Ví dụ:

```http
GET {{baseUrl}}/accounting/transactions?page=1&limit=20
```

Kỳ vọng field chính:

- `refNumber`
- `invoiceId`
- `contractId`
- `amount`
- `status`
- `matchStatus`
- `variance`
- `systemAmount`
- `actualAmount`

---

## 8.7. Reconciliation

### GET `/api/accounting/reconciliation`

Mục đích:

- Lấy danh sách bảng đối soát tài chính

Ví dụ:

```http
GET {{baseUrl}}/accounting/reconciliation?page=1&limit=10
```

### GET `/api/accounting/reconciliation/:id`

Mục đích:

- Lấy chi tiết một bảng đối soát

Request:

```http
GET {{baseUrl}}/accounting/reconciliation/{{reconciliationId}}
Authorization: Bearer {{token}}
```

### POST `/api/accounting/reconciliation`

Mục đích:

- Tạo bảng đối soát từ hợp đồng

Body ví dụ:

```json
{
  "contractId": 1,
  "refundRatio": 70,
  "status": "CHO_CHOT",
  "lineItems": [
    {
      "category": "HU_HONG_TAI_SAN",
      "direction": "THU",
      "amount": 500000,
      "description": "Khấu trừ hư hỏng tài sản"
    },
    {
      "category": "DIEU_CHINH_HO_TRO",
      "direction": "CHI",
      "amount": 100000,
      "description": "Hỗ trợ thiện chí cho khách"
    }
  ]
}
```

Sau khi tạo xong, lấy `data.id` gán vào `reconciliationId`.

---

## 8.8. Refunds

### GET `/api/accounting/refunds`

Mục đích:

- Lấy danh sách phiếu hoàn cọc

Query supported:

- `page`
- `limit`
- `status`
- `search`

Ví dụ:

```http
GET {{baseUrl}}/accounting/refunds?page=1&limit=10
GET {{baseUrl}}/accounting/refunds?status=PENDING
```

### GET `/api/accounting/refunds/:id`

Mục đích:

- Lấy chi tiết một phiếu hoàn cọc

Request:

```http
GET {{baseUrl}}/accounting/refunds/{{refundId}}
Authorization: Bearer {{token}}
```

### POST `/api/accounting/refunds`

Mục đích:

- Tạo phiếu hoàn cọc từ một bảng đối soát đã có

Body ví dụ:

```json
{
  "reconciliationId": 1,
  "refundAmount": 2500000,
  "beneficiaryName": "Nguyen Van A",
  "status": "CHO_HOAN"
}
```

Sau khi tạo xong, lấy `data.id` gán vào `refundId`.

---

## 9. Response format chung

Các API controller hiện đang trả response theo dạng:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Khi lỗi:

```json
{
  "success": false,
  "message": "...",
  "errors": null
}
```

---

## 10. Các lỗi thường gặp khi test Postman

### 401 Unauthorized - No token provided

Nguyên nhân:

- Chưa gửi header `Authorization`

### 401 Unauthorized - Invalid token

Nguyên nhân:

- Token không phải Supabase access token thật
- Token hết hạn

### 403 Forbidden - accounting access required

Nguyên nhân:

- Token hợp lệ nhưng user không có role `ADMIN`, `NHAN_VIEN` hoặc `KE_TOAN`

### 400 Validation failed

Nguyên nhân:

- Thiếu field bắt buộc theo route

Ví dụ:

- `POST /accounting/invoices` cần `contractId`, `lineItems`
- `POST /accounting/payments` cần `invoiceId`, `amount`
- `POST /accounting/reconciliation` cần `contractId`
- `POST /accounting/refunds` cần `reconciliationId`

### 404 Not found

Nguyên nhân:

- `contractId`, `invoiceId`, `paymentId`, `reconciliationId`, `refundId` không tồn tại

---

## 11. Các API accounting chưa có ở backend hiện tại

Các API sau **chưa được code**, nên chưa nên test trong Postman:

- `GET /api/accounting/transactions/:id`
- `POST /api/accounting/transactions/:id/resolve`
- `PUT /api/accounting/invoices/:id`
- `PUT /api/accounting/reconciliation/:id`
- `PUT /api/accounting/refunds/:id`
- `GET /api/accounting/statement`
- export PDF thật cho reconciliation

---

## 12. Bộ request mẫu nên tạo trong Postman Collection

Bạn có thể tạo collection với các request sau:

1. `Health Check`
2. `Auth - Me`
3. `Accounting - Dashboard`
4. `Accounting - Contracts List`
5. `Accounting - Contract Detail`
6. `Accounting - Billing Preview`
7. `Accounting - Generate Initial Billing`
8. `Accounting - Invoices List`
9. `Accounting - Invoice Detail`
10. `Accounting - Create Invoice`
11. `Accounting - Create Extra Invoice`
12. `Accounting - Payments List`
13. `Accounting - Record Payment`
14. `Accounting - Confirm Payment`
15. `Accounting - Transactions List`
16. `Accounting - Reconciliation List`
17. `Accounting - Reconciliation Detail`
18. `Accounting - Create Reconciliation`
19. `Accounting - Refunds List`
20. `Accounting - Refund Detail`
21. `Accounting - Create Refund`

---

## 13. Gợi ý test nhanh nhất

Nếu bạn muốn test nhanh từ đầu đến cuối với ít request nhất, hãy làm chuỗi này:

1. `GET /api/auth/me`
2. `GET /api/accounting/contracts`
3. `GET /api/accounting/contracts/:id/billing-preview`
4. `POST /api/accounting/invoices`
5. `POST /api/accounting/payments`
6. `POST /api/accounting/payments/:id/confirm`
7. `POST /api/accounting/reconciliation`
8. `POST /api/accounting/refunds`

Chuỗi này sẽ giúp bạn test được gần hết luồng chính của accounting backend hiện tại.
