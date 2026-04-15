# Ghi Chú Thay Đổi Accounting

## Ngày cập nhật

- Ngày: 16/04/2026
- Phạm vi: Redirect và guard frontend chỉ cho role kế toán

---

## 1. Mục tiêu sửa

Đợt chỉnh này chỉ tập trung vào role `KE_TOAN` để tránh đụng vào các luồng khác.

Các điểm đã chốt:

1. Dùng trực tiếp `profile?.vai_tro` từ `AuthContext`.
2. Chỉ role `KE_TOAN` được redirect thẳng vào module accounting.
3. Chỉ role `KE_TOAN` được frontend cho phép đi vào nhánh `/accounting/*`.

---

## 2. Các file đã sửa

### 2.1. Helper redirect và permission cho kế toán

Đã cập nhật file:

- `frontend/src/lib/authRedirect.js`

Nội dung:

- `getDefaultRouteByRole(role)` trả về `/accounting/dashboard` nếu role là `KE_TOAN`.
- `canAccessAccounting(role)` chỉ trả về `true` nếu role là `KE_TOAN`.

### 2.2. AuthContext chờ profile trước khi redirect

Đã cập nhật file:

- `frontend/src/context/AuthContext.jsx`

Nội dung sửa:

- Khi có session hoặc auth state change, frontend bật lại `loading` trước khi gọi `fetchProfile()`.

Ý nghĩa:

- Tránh redirect sai khi login xong nhưng profile chưa load xong.

### 2.3. GuestRoute redirect theo role kế toán

Đã cập nhật file:

- `frontend/src/routes/GuestRoute.jsx`

Nội dung sửa:

- Nếu người dùng đã đăng nhập và `profile?.vai_tro === "KE_TOAN"` thì chuyển sang `/accounting/dashboard`.
- Các role khác chuyển về `/dashboard`.

### 2.4. LoginPage bỏ redirect cứng

Đã cập nhật file:

- `frontend/src/pages/LoginPage.jsx`

Nội dung sửa:

- Bỏ `navigate("/")` sau login.
- Dùng `useEffect` để redirect theo `profile?.vai_tro` sau khi auth/profile sẵn sàng.

### 2.5. Guard frontend cho khu accounting

Đã cập nhật file:

- `frontend/src/routes/ProtectedRoute.jsx`
- `frontend/src/routes/index.jsx`

Nội dung sửa:

- Nhánh `/accounting/*` được chặn ở frontend.
- Nếu đã đăng nhập nhưng không phải `KE_TOAN` thì chuyển về `/dashboard`.

---

## 3. Hành vi sau khi sửa

### 3.1. Sau khi đăng nhập

- `KE_TOAN` vào `/accounting/dashboard`.
- Role khác vào `/dashboard`.

### 3.2. Khi mở trực tiếp route accounting

- Nếu chưa đăng nhập: chuyển về `/login`.
- Nếu đã đăng nhập nhưng không phải `KE_TOAN`: chuyển về `/dashboard`.
- Nếu là `KE_TOAN`: được vào module accounting.

---

## 4. Kiểm tra kỹ thuật

Đã kiểm tra:

- Build frontend sau khi sửa redirect và guard theo role kế toán.

---

## 5. Kết luận

Ngày 16/04/2026 đã hoàn thành:

1. Redirect frontend theo role kế toán.
2. Guard frontend cho khu accounting chỉ dành cho kế toán.
3. Giữ phạm vi sửa gọn, không mở rộng sang các luồng role khác.
