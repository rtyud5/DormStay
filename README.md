# DormStay - Hệ Thống Quản Lý Ký Túc Xá Thông Minh

DormStay là nền tảng quản lý ký túc xá hiện đại, giúp sinh viên dễ dàng tìm kiếm phòng, gửi yêu cầu thuê và quản lý hợp đồng trực tuyến. Hệ thống được xây dựng với kiến trúc Monorepo tối giản nhưng mạnh mẽ.

---

## 🚀 Live Demo

- **Frontend**: [https://dorm-stay.vercel.app](https://dorm-stay.vercel.app)
- **Backend API**: [https://dormstay-backend.onrender.com/health](https://dormstay-backend.onrender.com/health)

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend

- **React 19** & **Vite**: Nền tảng phát triển ứng dụng web nhanh chóng.
- **Tailwind CSS v4**: Framework CSS hiện đại nhất cho giao diện đẹp và linh hoạt.
- **React Router Dom 7**: Quản lý điều hướng mượt mà.
- **Axios**: Xử lý các yêu cầu API.

### Backend

- **Node.js** & **Express**: Server mạnh mẽ và dễ mở rộng.
- **Supabase**: Backend-as-a-Service (BaaS) cung cấp Database (PostgreSQL) và Authentication.
- **CORS**: Cấu hình bảo mật linh hoạt cho môi trường local và production.

---

## ✨ Tính Năng Chính

- [x] **Xác thực người dùng**: Đăng ký, đăng nhập qua Supabase Auth.
- [x] **Quản lý phòng**: Xem danh sách phòng, chi tiết phòng (giá, diện tích, tiện nghi).
- [x] **Yêu cầu thuê**: Gửi yêu cầu thuê phòng trực tuyến và theo dõi trạng thái.
- [x] **Quản lý hợp đồng**: Xem danh sách hợp đồng thuê phòng và thông tin thanh toán.
- [x] **Hồ sơ cá nhân**: Quản lý thông tin sinh viên.
- [x] **Giao diện Responsive**: Hoạt động tốt trên cả máy tính và thiết bị di động.

---

## 📂 Cấu Trúc Dự Án

```txt
DormStay/
├── accounting-log/    # Tài liệu Markdown được generate cho module accounting
├── frontend/          # Mã nguồn React (Client)
│   ├── src/services/  # Xử lý gọi API
│   └── src/pages/     # Các trang giao diện chính
├── backend/           # Mã nguồn Node.js (Server)
│   ├── src/routes/    # Định nghĩa các đầu cuối API
│   └── src/config/    # Cấu hình Supabase & Env
└── README.md          # Tài liệu dự án
```

### Quy Ước Tài Liệu Accounting

- Tất cả file Markdown được generate cho accounting như changelog, test data, API guide, plan phải đặt trong `accounting-log/`.
- Không tạo thêm file log accounting mới ở root của repository trừ khi có yêu cầu rõ ràng.

---

## 💻 Hướng Dẫn Cài Đặt Local

### 1. Yêu cầu hệ thống

- Node.js 20+
- npm 10+

### 2. Cài đặt Backend

```bash
cd backend
npm install
# Tạo file .env và điền SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

Backend sẽ chạy tại: `http://localhost:4000`

### 3. Cài đặt Frontend

```bash
cd frontend
npm install
# Tạo file .env và điền VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL=http://localhost:4000/api
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## 🌐 Triển Khai (Deployment)

Dự án được cấu hình sẵn để triển khai trên:

- **Render**: Dùng cho thư mục `backend` (Dịch vụ Web Service).
- **Vercel**: Dùng cho thư mục `frontend` (Đã có sẵn file `vercel.json` cho routing).

---

## 📝 Ghi Chú

Hệ thống sử dụng file `vercel.json` trong thư mục frontend để đảm bảo tính năng **Client-side Routing** hoạt động chính xác khi truy cập đường dẫn trực tiếp trên trình duyệt.

---

_Phát triển bởi DormStay Team._
