# DormStay - Hệ Thống Quản Lý Ký Túc Xá Thông Minh | Tài Liệu Toàn Diện

**Ngày cập nhật:** April 14, 2026  
**Phiên bản:** 0.1.0  
**Trạng thái:** Đang phát triển (Development)

---

## 📋 Mục Lục

1. [Tổng Quan Dự Án](#tổng-quan-dự-án)
2. [Tech Stack](#tech-stack)
3. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
4. [Thành Phần Chính](#thành-phần-chính)
5. [Kiến Trúc & Luồng Dữ Liệu](#kiến-trúc--luồng-dữ-liệu)
6. [Cơ Sở Dữ Liệu](#cơ-sở-dữ-liệu)
7. [API Endpoints](#api-endpoints)
8. [Logic Nghiệp Vụ Quan Trọng](#logic-nghiệp-vụ-quan-trọng)
9. [Cấu Hình & Hướng Dẫn Chạy](#cấu-hình--hướng-dẫn-chạy)
10. [Vấn Đề Hiện Tại](#vấn-đề-hiện-tại)
11. [Hướng Dẫn Cho AI](#hướng-dẫn-cho-ai)

---

## 🎯 Tổng Quan Dự Án

### Mục Đích

DormStay là nền tảng quản lý ký túc xá/nhà trọ trực tuyến, cho phép sinh viên và người thuê phòng dễ dàng:

- Tìm kiếm và xem chi tiết phòng trọ
- Gửi yêu cầu thuê phòng trực tuyến
- Quản lý hợp đồng thuê
- Thực hiện thanh toán cọc/tiền thuê

### Tính Năng Chính

- ✅ **Xác thực người dùng**: Login/Register qua Supabase Auth
- ✅ **Quản lý phòng**: Xem danh sách phôi với lọc (giá, tầng, giới tính, loại phòng)
- ✅ **Yêu cầu thuê**: Gửi yêu cầu, theo dõi trạng thái
- ✅ **Quản lý hợp đồng**: Xem danh sách hợp đồng và chi tiết
- ✅ **Hoa đơn/Thanh toán**: Xem hóa đơn, lịch sử thanh toán
- ✅ **Responsive Design**: Tối ưu cho mobile, tablet, desktop
- 🔄 **Hồ sơ cá nhân**: Quản lý thông tin, CCCD, tài khoản ngân hàng

### Đối Tượng Người Dùng

- **Sinh viên/Người thuê phòng**: Tìm kiếm và thuê phòng
- **Quản lý ký túc xá**: Quản lý phòng, hợp đồng, thanh toán (Next phase)
- **Admin hệ thống**: Cấu hình, báo cáo (Next phase)

### Use Cases Chính

1. Một sinh viên mới vào trường cần tìm phòng trọ
2. NV quản lý nhà trọ duyệt yêu cầu thuê và tạo hợp đồng
3. Sinh viên thanh toán cọc phòng trực tuyến
4. Theo dõi hóa đơn hàng tháng

---

## 🛠️ Tech Stack

### Frontend

| Công Nghệ              | Phiên Bản | Mục Đích               |
| ---------------------- | --------- | ---------------------- |
| **React**              | 19.2.4    | Framework UI           |
| **Vite**               | 8.0.3     | Build tool, dev server |
| **React Router DOM**   | 7.13.2    | Routing/Navigation     |
| **Tailwind CSS**       | 4.2.2     | Styling, CSS utilities |
| **Axios**              | 1.14.0    | HTTP client            |
| **Supabase JS Client** | 2.101.1   | Auth, real-time DB     |

### Backend

| Công Nghệ    | Phiên Bản | Mục Đích               |
| ------------ | --------- | ---------------------- |
| **Node.js**  | 20+       | Runtime                |
| **Express**  | 5.2.1     | Web framework          |
| **Supabase** | 2.99.2    | BaaS (Database + Auth) |
| **CORS**     | 2.8.6     | Cross-origin requests  |
| **Dotenv**   | 17.4.0    | Biến môi trường        |
| **Nodemon**  | 3.1.14    | Dev hot-reload         |

### Database & Services

- **PostgreSQL** (via Supabase)
- **Supabase Auth** (JWT-based)
- **Deployment**: Render (backend), Vercel (frontend)

---

## 📁 Cấu Trúc Thư Mục

```
DormStay/
├── backend/                          # Node.js + Express API Server
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js               # Biến môi trường (PORT, NODE_ENV, etc.)
│   │   │   └── supabase.js          # Kết nối Supabase client & dự kiểm tra kết nối
│   │   │
│   │   ├── controllers/             # Xử lý request/response logic
│   │   │   ├── auth.controller.js   # Login, Register, Profile
│   │   │   ├── room.controller.js   # Room listing & details
│   │   │   ├── rentalRequest.controller.js   # Rental requests
│   │   │   ├── contract.controller.js        # Contract management
│   │   │   └── payment.controller.js         # Payment & invoices
│   │   │
│   │   ├── services/                # Business logic layer
│   │   │   ├── auth.service.js      # Auth logic
│   │   │   ├── room.service.js      # Room queries
│   │   │   ├── rentalRequest.service.js
│   │   │   ├── contract.service.js
│   │   │   └── payment.service.js
│   │   │
│   │   ├── models/                  # Database query layer (Data Access)
│   │   │   ├── user.model.js        # Profile table queries (ho_so)
│   │   │   ├── room.model.js        # Room table (phong) + formatting
│   │   │   ├── rentalRequest.model.js  # Rental requests (yeu_cau_thue)
│   │   │   ├── contract.model.js    # Contracts (hop_dong)
│   │   │   ├── invoice.model.js     # Invoices (hoa_don)
│   │   │   └── payment.model.js     # Payments (thanh_toan)
│   │   │
│   │   ├── middlewares/             # Express middlewares
│   │   │   ├── auth.middleware.js   # JWT verification + user attachment
│   │   │   ├── error.middleware.js  # Global error handler
│   │   │   └── validate.middleware.js # Request validation
│   │   │
│   │   ├── routes/                  # Express route definitions
│   │   │   ├── index.js             # Main router (aggregator)
│   │   │   ├── auth.routes.js       # /api/auth endpoints
│   │   │   ├── room.routes.js       # /api/rooms endpoints
│   │   │   ├── rentalRequest.routes.js  # /api/rental-requests
│   │   │   ├── contract.routes.js   # /api/contracts
│   │   │   └── payment.routes.js    # /api/payments
│   │   │
│   │   └── utils/
│   │       ├── apiResponse.js       # Helper sendSuccess/sendError
│   │       ├── asyncHandler.js      # Wrapper for async error handling
│   │       ├── errors.js            # AppError class
│   │       └── helpers.js           # Utilities (createRequestCode, pick)
│   │
│   ├── supabase/
│   │   └── scripts.sql              # Database schema & trigger definitions
│   │
│   ├── server.js                    # Entry point, Express app initialize
│   ├── package.json
│   └── seedData.js                  # (Optional) Seed data script
│
├── frontend/                         # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx                  # Root component
│   │   ├── main.jsx                 # React DOM render
│   │   ├── index.css                # Global styles
│   │   │
│   │   ├── components/
│   │   │   ├── common/              # Reusable UI components
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── PageHeader.jsx
│   │   │   │   └── EmptyState.jsx
│   │   │   │
│   │   │   ├── forms/               # Form components
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   ├── RentalRequestForm.jsx
│   │   │   │   └── PaymentForm.jsx
│   │   │   │
│   │   │   └── ui/                  # Atomic UI components
│   │   │       ├── Button.jsx
│   │   │       ├── Card.jsx
│   │   │       ├── Input.jsx
│   │   │       ├── Badge.jsx
│   │   │       └── ...
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state (user, profile, loading)
│   │   │
│   │   ├── layouts/                 # Page layouts
│   │   │   ├── MainLayout.jsx       # Public pages
│   │   │   ├── AuthLayout.jsx       # Login/Register pages
│   │   │   └── DashboardLayout.jsx  # Authenticated pages
│   │   │
│   │   ├── pages/                   # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── RoomListPage.jsx     # Browse rooms
│   │   │   ├── RoomDetailPage.jsx
│   │   │   ├── RentalRequestPage.jsx # Create rental request
│   │   │   ├── RentalRequestListPage.jsx # My requests
│   │   │   ├── RequestDetailPage.jsx
│   │   │   ├── ContractListPage.jsx
│   │   │   ├── ContractDetailPage.jsx
│   │   │   ├── ProfilePage.jsx      # User profile edit
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── VerifyOtpPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   │
│   │   ├── routes/
│   │   │   ├── index.jsx            # React Router config
│   │   │   ├── ProtectedRoute.jsx   # Auth guard
│   │   │   └── GuestRoute.jsx       # Redirect if logged in
│   │   │
│   │   ├── services/                # API service layer
│   │   │   ├── api.js               # Axios instance + interceptors
│   │   │   ├── auth.service.js
│   │   │   ├── room.service.js
│   │   │   ├── rentalRequest.service.js
│   │   │   ├── contract.service.js
│   │   │   ├── payment.service.js
│   │   │   ├── profile.service.js
│   │   │   └── storage.service.js
│   │   │
│   │   └── lib/
│   │       ├── supabase.js          # Supabase client init
│   │       ├── storage.js           # LocalStorage helpers
│   │       ├── constants.js         # Constants (STORAGE_KEYS, etc.)
│   │       ├── format.js            # String formatting utilities
│   │       └── helpers.js           # Common utility functions
│   │
│   ├── public/
│   │   └── images/                  # Static images
│   │
│   ├── index.html                   # HTML entry
│   ├── vite.config.js
│   ├── jsconfig.json
│   ├── vercel.json                  # Vercel deployment config
│   └── package.json
│
├── LICENSE
└── README.md
```

### Giải Thích Chức Năng Thư Mục

| Thư Mục          | Chức Năng                                 |
| ---------------- | ----------------------------------------- |
| **Backend**      | API server xử lý logic, lấy dữ liệu từ DB |
| **config/**      | Cấu hình khởi động (DB, env vars)         |
| **controllers/** | HTTP request handlers, gọi services       |
| **services/**    | Business logic, validate data             |
| **models/**      | Direct database queries, formatting       |
| **routes/**      | HTTP endpoints definition                 |
| **middlewares/** | Interceptors (auth, validation, error)    |
| **Frontend**     | SPA React, giao diện người dùng           |
| **pages/**       | Full page components (route level)        |
| **components/**  | Reusable UI components                    |
| **context/**     | React state management (auth state)       |
| **routes/**      | Client-side routing (React Router)        |
| **services/**    | API client layer (call backend)           |

---

## 🧩 Thành Phần Chính

### 1. Authentication Module

**Vị trí**: `backend/src/services/auth.service.js`, `frontend/src/context/AuthContext.jsx`

**Chức năng**:

- Đăng nhập/Đăng ký thông qua Supabase Auth
- Quản lý JWT token trong localStorage
- Fetch & cache user profile
- Logout

**Luồng**:

```
1. User submit login form
   ↓
2. AuthService.login() → Supabase auth request
   ↓
3. Token stored in localStorage
   ↓
4. AuthContext.fetchProfile() → Fetch ho_so table
   ↓
5. User + Profile data set in global state
```

**Middleware**: `auth.middleware.js` xác minh token trong mỗi protected request

---

### 2. Room Management Module

**Vị trí**: `backend/src/models/room.model.js`, `backend/src/services/room.service.js`

**Chức năng**:

- Liệt kê phòng với filtering & pagination
- Lấy chi tiết phòng
- Lấy danh sách giường trong phòng

**Filtering hỗ trợ**:

- `search`: Tim kiếm theo mã phòng (ma_phong_hien_thi)
- `floor`: Lọc theo tầng (ten_tang)
- `type`: Loại phòng (SINGLE_ROOM, PHONG_CHUNG, etc.)
- `minPrice`, `maxPrice`: Khoảng giá
- `status`: Trạng thái (TRONG, SAP_DAY, DAY)
- `gender`: Giới tính (Nam, Nữ, Nam/Nữ)
- `sort`: Sắp xếp (price_asc, price_desc, newest)
- `page`, `limit`: Phân trang

**Data Mapping**:

```javascript
// Raw DB data → Frontend format
{
  id: ma_phong,
  name: "Phòng 101",
  price: "₫1,000,000", // Formatted
  rawPrice: 1000000,   // For calculations
  beds: [...],
  amenities: [...]
}
```

---

### 3. Rental Request Module

**Vị trí**: `backend/src/models/rentalRequest.model.js`

**Chức năng**:

- Tạo yêu cầu thuê mới
- Liệt kê yêu cầu của user

**Trạng thái yêu cầu**:
| Status | Mô Tả |
|--------|-------|
| `MOI_TAO` | Vừa tạo |
| `CHO_XU_LY` | Chờ xử lý |
| `DANG_XU_LY` | Chờ thanh toán cọc |
| `DA_COC` | Đã thanh toán cọc |
| `DA_XAC_NHAN` | Xác nhận thành công |
| `TU_CHOI` | Từ chối |
| `QUA_HAN` | Quá hạn (hết hạn định giữ chỗ) |

**Luồng Tạo Yêu Cầu**:

```
1. User xem chi tiết phòng
   ↓
2. Click "Gửi yêu cầu thuê"
   ↓
3. Form submit: {roomId, stayType}
   ↓
4. Tạo record yeu_cau_thue + giu_cho_tam (reserved slot)
   ↓
5. Quản lý duyệt, cấp tính cọc
   ↓
6. User thanh toán cọc
   ↓
7. Tạo hop_dong (contract) sau khi xác nhận
```

---

### 4. Contract Module

**Vị trí**: `backend/src/models/contract.model.js`

**Chức năng**:

- Liệt kê hợp đồng của user
- Lấy chi tiết hợp đồng + invoices liên quan

**Dữ liệu Hợp Đồng**:

- `ma_hop_dong`: ID hợp đồng
- `ma_yeu_cau_thue`: Liên kết yêu cầu ban đầu
- `ngay_vao_o`: Ngày vào ở dự kiến
- `gia_thue_co_ban_thang`: Giá thuê hàng tháng
- `so_tien_dat_coc_bao_dam`: Tiền cọc bảo đảm
- `trang_thai`: HIEU_LUC (hiệu lực), EXPIRED, TERMINATED, etc.

---

### 5. Invoice & Payment Module

**Vị trí**: Database schema + models

**Tương Quan Bảng**:

```
hop_dong (1) ──────→ (N) hoa_don
                        ↓
                    thanh_toan (N)
                        ↓
                    bien_lai (1 for each payment)
```

**Chức năng**:

- Tính toán hóa đơn hàng tháng từ các khoản thu (khoan_thu_hop_dong)
- Theo dõi tình trạng thanh toán
- Tạo biên lai (receipt)

**Quy Trình Thanh Toán**:

```
1. Hệ thống tự động sinh hóa_đơn hàng tháng
   ↓
2. Chi tiết hóa đơn từ các khoan_thu_hop_dong
   ↓
3. User xem hóa đơn (status: CHO_THANH_TOAN)
   ↓
4. User submit thanh toán (payment record tạo)
   ↓
5. Admin/System xác nhận (thoi_gian_xac_nhan)
   ↓
6. Tạo biên lai (bien_lai)
```

---

## 🏗️ Kiến Trúc & Luồng Dữ Liệu

### Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Pages (HomePage, RoomListPage, etc.)                     │  │
│  │ ↓ (onClick/form submit)                                  │  │
│  │ Components (Button, Card, Form)                          │  │
│  │ ↓ (setState, API call)                                   │  │
│  │ Services (api.js, room.service.js, etc.)                │  │
│  │ ↓ (HTTP request)                                         │  │
│  │ Context/State (AuthContext stores user & profile)       │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────
                            HTTPS / REST API
┌───────────────────────────────────────────────────────────────────
│                    Backend (Express + Node.js)                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Routes (/api/rooms, /api/auth, etc.)                     │  │
│  │ ↓ (request matching)                                     │  │
│  │ Middlewares (auth verification, validation)              │  │
│  │ ↓ (request enrichment)                                   │  │
│  │ Controllers (getList, getDetail, etc.)                   │  │
│  │ ↓ (delegate to services)                                 │  │
│  │ Services (business logic, error handling)                │  │
│  │ ↓ (call models)                                          │  │
│  │ Models (Supabase queries, data formatting)               │  │
│  │ ↓ (SQL execution)                                        │  │
│  │ Response (JSON with success/error flags)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────
                      Supabase SDK / REST API
┌───────────────────────────────────────────────────────────────────
│              Supabase (PostgreSQL + Auth + Storage)              │
│  - ho_so (User profiles)                                        │
│  - phong (Rooms)                                                │
│  - yeu_cau_thue (Rental requests)                               │
│  - hop_dong (Contracts)                                         │
│  - hoa_don (Invoices)                                           │
│  - thanh_toan (Payments)                                        │
└───────────────────────────────────────────────────────────────────
```

### Kiến Trúc Mô Hình

Dự án sử dụng **3-tier MVC architecture**:

- **Model** Layer: Direct DB access (models/\*.js)
- **Service** Layer: Business logic & validation (services/\*.js)
- **Controller** Layer: HTTP handlers (controllers/\*.js)

Ưu điểm:

- Tách biệt concerns
- Dễ test từng tầng
- Reusable business logic
- Clean dependencies

### Request/Response Flow

**Example: Get Room List**

```
1. Frontend Request:
   GET /api/rooms?page=1&limit=10&status=TRONG&gender=Nữ
   Header: Authorization: Bearer <token>

2. Backend Processing:
   routes/room.routes.js:
   → RoomController.getList(req, res)
   → RoomService.getList(filters)
   → RoomModel.list(filters)
   → Supabase query with filters
   → mapRoomToFrontendFormat(data)

3. Response:
   {
     success: true,
     message: "Fetch rooms successful",
     data: {
       data: [
         {id, name, price, amenities, beds, ...},
         ...
       ],
       total: 45,
       page: 1,
       limit: 10
     }
   }
```

---

## 🗄️ Cơ Sở Dữ Liệu

### Sơ Đồ Database (Từ scripts.sql)

#### 1. **Core Tables** (Hồ Sơ & Tòa Nhà)

```sql
ho_so (User Profiles)
├─ ma_ho_so (PK)
├─ ma_nguoi_dung_xac_thuc (FK to auth.users)
├─ vai_tro (KHACH_HANG, NHAN_VIEN, ADMIN)
├─ ho_ten, email, so_dien_thoai
├─ dia_chi_thuong_tru
├─ ngan_hang_ten, ngan_hang_so_tai_khoan (Ngân hàng)
├─ so_cccd, ngay_cap_cccd, cccd_mat_truoc_url, cccd_mat_sau_url
├─ lien_he_khan_cap* (Emergency contact)
└─ created_at, updated_at

toa (Buildings)
├─ ma_toa (PK)
├─ ma_dinh_danh (Slug, unique)
├─ ten (Name)
├─ dia_chi, quan_huyen, thanh_pho
└─ created_at, updated_at

tang (Floors)
├─ ma_tang (PK)
├─ ma_toa (FK)
├─ so_tang (Floor number)
├─ ten_tang (Floor name)
└─ Constraint: UNIQUE(ma_toa, so_tang)

phong (Rooms)
├─ ma_phong (PK)
├─ ma_toa, ma_tang (FKs)
├─ ma_phong_hien_thi (Display ID, e.g., "101")
├─ loai_phong (SINGLE_ROOM, PHONG_CHUNG)
├─ suc_chua (Capacity)
├─ gia_thang (Monthly price)
├─ gioi_tinh (Nam, Nữ, Nam/Nữ)
├─ trang_thai (TRONG, SAP_DAY, DAY)
└─ Constraint: UNIQUE(ma_toa, ma_phong_hien_thi)

giuong (Beds in shared rooms)
├─ ma_giuong (PK)
├─ ma_phong (FK)
├─ ma_giuong_hien_thi (e.g., "A1", "A2")
├─ nhan_giuong (Name)
├─ gia_thang
├─ trang_thai (TRONG, DA_THUE)
└─ Constraint: UNIQUE(ma_phong, ma_giuong_hien_thi)

hinh_anh_phong (Room Images)
├─ ma_hinh_anh (PK)
├─ ma_phong (FK)
├─ duong_dan_cong_khai (URL)
├─ la_anh_bia (Is cover image, UNIQUE per room)
└─ thu_tu_hien_thi (Display order)

tai_san_phong (Room Assets/Amenities)
├─ ma_tai_san (PK)
├─ ma_phong (FK)
├─ ma_tai_san_hien_thi (ID code)
├─ ten_tai_san (Name)
├─ danh_muc (Category)
├─ muc_boi_thuong_mac_dinh (Default compensation if damaged)
└─ Constraint: UNIQUE(ma_phong, ma_tai_san_hien_thi)
```

#### 2. **Flow 1 Tables** (Yêu Cầu Thuê & Giữ Chỗ)

```sql
yeu_cau_thue (Rental Requests)
├─ ma_yeu_cau_thue (PK)
├─ ma_ho_so_khach_hang (FK)
├─ ma_ho_so_nhan_vien_phu_trach (FK, nullable)
├─ loai_muc_tieu (PHONG, GIUONG)
├─ ma_phong, ma_giuong (FKs based on loai_muc_tieu)
├─ ngay_du_kien_vao_o
├─ gia_thue_thang, so_tien_dat_coc
├─ trang_thai (MOI_TAO → DA_XAC_NHAN)
└─ Checkcontraint: loai_muc_tieu matches phong/giuong

nhat_ky_yeu_cau_thue (Rental Request History Log)
├─ ma_nhat_ky (PK)
├─ ma_yeu_cau_thue (FK)
├─ trang_thai_cu, trang_thai_moi
├─ ma_ho_so_nguoi_thuc_hien
├─ ghi_chu
└─ created_at

giu_cho_tam (Temporary Reservations)
├─ ma_giu_cho_tam (PK)
├─ ma_yeu_cau_thue (FK)
├─ loai_muc_tieu, ma_phong, ma_giuong
├─ trang_thai (DANG_GIU, DA_HUY)
├─ thoi_gian_het_han (Expiry time)
└─ ly_do_huy_giu_cho
```

#### 3. **Flow 2 Tables** (Hợp Đồng & Thanh Toán)

```sql
hop_dong (Contracts)
├─ ma_hop_dong (PK)
├─ ma_yeu_cau_thue (FK, UNIQUE)
├─ ma_ho_so_khach_hang (FK)
├─ loai_muc_tieu, ma_phong, ma_giuong
├─ ngay_vao_o
├─ gia_thue_co_ban_thang
├─ so_tien_dat_coc_bao_dam
├─ trang_thai (HIEU_LUC, EXPIRED, TERMINATED)
└─ Constraint: 1 contract per rental request

hoa_don (Invoices)
├─ ma_hoa_don (PK)
├─ ma_yeu_cau_thue, ma_hop_dong (FKs, at least one)
├─ loai_hoa_don (DEPOSIT, MONTHLY_RENT, EXTRA, etc.)
├─ trang_thai (CHO_THANH_TOAN, DA_THANH_TOAN, EXPIRED)
├─ tong_so_tien
├─ so_tien_da_thanh_toan
├─ ma_tham_chieu_qr (QR reference for payments, UNIQUE)
├─ ngay_lap, ngay_den_han
└─ Constraint: so_tien_da_thanh_toan <= tong_so_tien

thanh_toan (Payment Transactions)
├─ ma_thanh_toan (PK)
├─ ma_hoa_don (FK)
├─ phuong_thuc (BANK_TRANSFER, STRIPE, MOMO, etc.)
├─ trang_thai (CHO_XAC_NHAN, DA_XAC_NHAN, TU_CHOI)
├─ so_tien
├─ ma_giao_dich (Transaction ID, UNIQUE)
├─ ten_nguoi_thanh_toan
├─ thoi_gian_thanh_toan, thoi_gian_xac_nhan
└─ Audit timestamps: created_at, updated_at

bien_lai (Receipts)
├─ ma_bien_lai (PK)
├─ ma_thanh_toan (FK)
├─ ma_hoa_don (FK)
├─ so_tien
├─ so_bien_lai (Receipt number, UNIQUE)
├─ ma_ho_so_nguoi_lap (Who generated)
└─ Timestamps

phan_bo_hop_dong (Contract Distribution/Allocation)
├─ ma_phan_bo (PK)
├─ ma_hop_dong (FK)
├─ loai_muc_tieu, ma_phong, ma_giuong
├─ ngay_bat_dau, ngay_ket_thuc (Period)
├─ trang_thai (HIEU_LUC, ENDED, SUSPENDED)
└─ Tracks room allocation changes during contract

khoan_thu_hop_dong (Contract Revenue Line Items)
├─ ma_khoan_thu (PK)
├─ ma_hop_dong (FK)
├─ giai_doan_phat_sinh (When: CHI_TIET_HOP_DONG, KHOAN_PHI, etc.)
├─ danh_muc (Category: THUE_PHONG, PHI_DICH_VU, etc.)
├─ mo_ta (Description)
├─ so_tien (Amount)
├─ trang_thai_lap_hoa_don (CHUA_LAP, DA_LAP)
└─ ma_hoa_don_da_lap (If invoiced)

chi_tiet_hoa_don (Invoice Details)
├─ ma_chi_tiet_hoa_don (PK)
├─ ma_hoa_don (FK)
├─ ma_khoan_thu (FK, nullable)
├─ danh_muc (Category)
├─ mo_ta
├─ so_luong, don_gia
├─ thanh_tien (quantity × unit_price)
└─ Timestamps
```

### Mối Quan Hệ (Relationships)

```
ho_so (1) ─────────→ (N) yeu_cau_thue
                       ├─→ (1) giu_cho_tam
                       ├─→ (1) hop_dong ─→ (N) hoa_don
                       │                      ├─→ (N) thanh_toan
                       │                      │       └─→ (1) bien_lai
                       │                      └─→ (N) chi_tiet_hoa_don
                       │
                       └─→ (N) nhat_ky_yeu_cau_thue

phong (1) ──────────→ (N) yeu_cau_thue
              ├────────→ (N) giu_cho_tam
              ├────────→ (N) hop_dong
              ├────────→ (N) hinh_anh_phong
              ├────────→ (N) tai_san_phong
              └────────→ (N) giuong ────→ (N) yeu_cau_thue
```

### Triggers & Functions

```sql
-- Auto-update updated_at timestamp trên mỗi UPDATE
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON [table_name]
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
```

---

## 🔌 API Endpoints

### Base URL

- **Development**: `http://localhost:4000/api`
- **Production**: `https://dormstay-backend.onrender.com/api`

### Authentication Endpoints

#### 1. `POST /auth/login`

**Description**: Đăng nhập người dùng  
**Auth**: ❌ No token required  
**Request Body**:

```json
{
  "email": "student@example.com",
  "password": "hashedPassword123"
}
```

**Response (200)**:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "user-uuid",
      "email": "student@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "customer"
    }
  }
}
```

#### 2. `POST /auth/register`

**Description**: Đăng ký tài khoản mới  
**Auth**: ❌ No token required  
**Request Body**:

```json
{
  "fullName": "Nguyễn Văn A",
  "email": "student@example.com",
  "phone": "0912345678",
  "password": "StrongPass123!"
}
```

**Response (201)**: User object

#### 3. `GET /auth/me`

**Description**: Lấy thông tin profile hiện tại  
**Auth**: ✅ Required  
**Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "student@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "customer",
    "phone": "0912345678",
    "profile": {
      "ma_ho_so": 123,
      "ho_ten": "Nguyễn Văn A",
      "so_dien_thoai": "0912345678",
      "dia_chi_thuong_tru": "123 Đường Lê Lợi...",
      "ngan_hang_ten": "Vietcombank",
      "ngan_hang_so_tai_khoan": "1234567890"
    }
  }
}
```

#### 4. `PUT /auth/me`

**Description**: Cập nhật profile  
**Auth**: ✅ Required  
**Request Body**:

```json
{
  "ho_ten": "Nguyễn Văn B",
  "so_dien_thoai": "0987654321",
  "dia_chi_thuong_tru": "456 Đường Hoa...",
  "so_cccd": "123456789",
  "ngay_cap_cccd": "2020-01-01",
  "ngan_hang_ten": "Techcombank",
  "ngan_hang_so_tai_khoan": "9876543210",
  "ngan_hang_chu_tai_khoan": "Nguyễn Văn B"
}
```

**Response (200)**: Updated user profile

---

### Room Endpoints

#### 1. `GET /rooms`

**Description**: Liệt kê phòng với lọc & phân trang  
**Auth**: ❌ No  
**Query Parameters**:

```
page=1
limit=10
search=101                    # Search room code
floor=Tầng 1               # Floor name
type=PHONG_CHUNG            # Room type
minPrice=500000
maxPrice=2000000
status=TRONG                 # Multiple: status=TRONG&status=SAP_DAY
gender=Nữ
sort=price_asc              # price_asc, price_desc, newest
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Phòng 101",
        "price": "₫1,500,000",
        "rawPrice": 1500000,
        "unit": "/tháng/người",
        "status": "CÒN TRỐNG",
        "statusColor": "text-emerald-700 bg-emerald-100",
        "capacity": "2 / 4 giường trống",
        "floor": "Tầng 1",
        "amenities": ["Điều hòa", "Wifi"],
        "image": "https://...",
        "gallery": ["https://...", "https://..."],
        "building": "Ký túc xá A",
        "gender": "Nam/Nữ",
        "beds": [
          {
            "id": 10,
            "code": "A1",
            "label": "Giường số 1",
            "price": "₫750,000",
            "rawPrice": 750000,
            "status": "TRONG"
          }
        ]
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 10
  }
}
```

#### 2. `GET /rooms/:id`

**Description**: Lấy chi tiết phòng  
**Auth**: ❌ No  
**Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Phòng 101",
    "address": "123 Đường Lê Lợi, Quận 1, TP.HCM",
    "type": "PHONG_CHUNG",
    "beds": [...],
    "amenities": [...],
    // ... all room details as in list
  }
}
```

#### 3. `GET /rooms/:id/beds`

**Description**: Lấy danh sách giường trong phòng  
**Auth**: ❌ No  
**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "code": "A1",
      "label": "Giường 1",
      "price": "₫750,000",
      "status": "TRONG"
    }
  ]
}
```

---

### Rental Request Endpoints

#### 1. `GET /rental-requests`

**Description**: Liệt kê tất cả yêu cầu thuê (Admin)  
**Auth**: ✅ Required  
**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "#REQ-0001",
      "statusText": "Đang xử lý",
      "statusBadge": "bg-[#E6F0FF] text-[#0052CC]",
      "roomName": "Phòng 101",
      "date": "14/04/2026",
      "amount": "₫750,000",
      "deadline": "--/--/----",
      "actionLink": "/rental-requests/1",
      "actionLabel": "Xem chi tiết"
    }
  ]
}
```

#### 2. `GET /rental-requests/my`

**Description**: Liệt kê yêu cầu thuê của user hiện tại  
**Auth**: ✅ Required  
**Response (200)**: Same as above

#### 3. `GET /rental-requests/:id`

**Description**: Lấy chi tiết yêu cầu thuê  
**Auth**: ✅ Required  
**Response (200)**: Single request object

#### 4. `POST /rental-requests`

**Description**: Tạo yêu cầu thuê mới  
**Auth**: ✅ Required  
**Request Body**:

```json
{
  "roomId": 1,
  "stayType": "PHONG", // or GIUONG
  "bedId": 10, // required if stayType=GIUONG
  "expectedMoveInDate": "2026-05-01",
  "depositAmount": 750000
}
```

**Response (201)**: Created rental request

---

### Contract Endpoints

#### 1. `GET /contracts`

**Description**: Liệt kê hợp đồng của user  
**Auth**: ✅ Required  
**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "ma_hop_dong": 1,
      "ngay_vao_o": "2026-05-01",
      "gia_thue_co_ban_thang": 1500000,
      "so_tien_dat_coc_bao_dam": 3000000,
      "trang_thai": "HIEU_LUC",
      "phong": {
        "ma_phong_hien_thi": "101"
      }
    }
  ]
}
```

#### 2. `GET /contracts/:id`

**Description**: Lấy chi tiết hợp đồng + hóa đơn liên quan  
**Auth**: ✅ Required  
**Response (200)**:

```json
{
  "success": true,
  "data": {
    "ma_hop_dong": 1,
    // ... contract details
    "invoices": [
      {
        "ma_hoa_don": 100,
        "loai_hoa_don": "MONTHLY_RENT",
        "tong_so_tien": 1500000,
        "trang_thai": "CHO_THANH_TOAN"
      }
    ]
  }
}
```

---

### Payment Endpoints

#### 1. `GET /payments/invoices`

**Description**: Lấy danh sách hóa đơn của user  
**Auth**: ✅ Required  
**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "ma_hoa_don": 100,
      "loai_hoa_don": "MONTHLY_RENT",
      "tong_so_tien": 1500000,
      "so_tien_da_thanh_toan": 0,
      "trang_thai": "CHO_THANH_TOAN",
      "ngay_den_han": "2026-04-20",
      "ma_tham_chieu_qr": "MR200426..."
    }
  ]
}
```

#### 2. `GET /payments/history`

**Description**: Lấy lịch sử thanh toán  
**Auth**: ✅ Required  
**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "ma_thanh_toan": 50,
      "ma_hoa_don": 100,
      "phuong_thuc": "BANK_TRANSFER",
      "so_tien": 1500000,
      "trang_thai": "DA_XAC_NHAN",
      "thoi_gian_thanh_toan": "2026-04-14T10:30:00Z",
      "thoi_gian_xac_nhan": "2026-04-14T11:00:00Z"
    }
  ]
}
```

#### 3. `POST /payments`

**Description**: Tạo ghi nhận thanh toán mới  
**Auth**: ✅ Required  
**Request Body**:

```json
{
  "invoiceId": 100,
  "amount": 1500000,
  "paymentMethod": "BANK_TRANSFER",
  "transactionId": "8237462374"
}
```

**Response (201)**: Created payment record

---

### Health Check

#### `GET /health`

**Description**: Kiểm tra server healthy  
**Auth**: ❌ No  
**Response (200)**:

```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2026-04-14T12:00:00.000Z"
}
```

---

## 💡 Logic Nghiệp Vụ Quan Trọng

### 1. Rental Request State Machine

```
┌─────────────────────────────────────────────────────────────┐
│  Trạng thái & Chuyển Đổi                                   │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   MOI_TAO    │ ← User tạo yêu cầu
                    └──────┬───────┘
                           │
                    ┌──────▼───────────┐
                    │ CHO_XU_LY (CHO_DUYET) │ ← Admin kiểm tra
                    └──────┬───────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
         ┌──────▼─────┐       ┌───────▼──────┐
         │   TU_CHOI   │       │  DANG_XU_LY  │ ← Chờ cọc
         │  (Rejected) │       │              │
         └─────────────┘       └───────┬──────┘
                                       │
                                ┌──────▼──────┐
                                │   DA_COC    │ ← Đã thanh toán cọc
                                │             │
                                └──────┬──────┘
                                       │
                                ┌──────▼─────────┐
                                │ DA_XAC_NHAN    │ ← Xác nhận thành công
                                │ (Confirmed)    │   → Tạo hop_dong
                                └────────────────┘

                                ┌──────────────┐
                                │ QUA_HAN      │ ← Lỗi: Quá hạn giữ chỗ
                                │ (Expired)    │
                                └──────────────┘
```

### 2. Giữ Chỗ Tạm (giu_cho_tam)

Khi user tạo `yeu_cau_thue`:

- Tự động tạo record `giu_cho_tam` với `thoi_gian_het_han` = now() + 48 giờ
- Giữ chỗ ngăn user khác book cùng phòng/giường
- Nếu admin từ chối → hủy `giu_cho_tam` (ly_do_huy_giu_cho = "Admin rejected")
- Nếu quá 48h mà chưa thanh toán cọc → tự động hủy → trạng thái = QUA_HAN

### 3. Phân Trang & Lọc Phòng

```javascript
// Room Model sử dụng Supabase query với:
1. Inner join trên tang ("!inner") → bắt buộc phải có tầng hợp lệ
2. Left join trên hinh_anh_phong, tai_san_phong → nullable
3. Filters:
   - search: ilike '%keyword%' (case-insensitive)
   - floor: eq(tang.ten_tang)
   - price: gte/lte(gia_thang)
   - gender: in(['Nam', 'Nam/Nữ']) nếu chọn Nam
4. Pagination: range(offset, offset+limit-1)
5. Sorting: order(gia_thang, ascending=true by default)
6. Count: count='exact' for total
```

### 4. Tương Quan Giữa Bảng

```
yeu_cau_thue → hop_dong (1-to-1 after approval)
  ├─ 1 yêu cầu → 1 hợp đồng (sau khi xác nhận)
  └─ Record yeu_cau_thue giữ history

hop_dong → hoa_don (1-to-many)
  ├─ 1 contract → nhiều invoices (tháng 1, 2, 3...)
  └─ Autogen mỗi tháng theo khoan_thu_hop_dong

hoa_don → thanh_toan (1-to-many)
  ├─ 1 invoice → multiple payments (partial payments allowed)
  └─ Constraint: Σ(thanh_toan.so_tien) ≤ hoa_don.tong_so_tien

thanh_toan → bien_lai (1-to-1)
  └─ 1 payment confirmed → 1 receipt generated
```

### 5. Format Tiền Tệ

```javascript
// Sử dụng Intl.NumberFormat cho VND
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};
// Output: "₫1,500,000"

// Lưu rawPrice cho tính toán
{
  price: "₫1,500,000",  // Display
  rawPrice: 1500000     // For calculations
}
```

### 6. Status Mapping (Rental Requests)

Frontend UI status → DB status:
| Frontend | Backend | Màu | Action |
|----------|---------|-----|--------|
| Đang xử lý | MOI_TAO / CHO_XU_LY | Blue | Xem chi tiết |
| Chờ thanh toán cọc | DANG_XU_LY | Orange | Thanh toán ngay |
| Chờ duyệt cọc | DA_COC | Blue | Chờ |
| Đã xác nhận | DA_XAC_NHAN | Green | Tải hợp đồng |
| Từ chối | TU_CHOI | Red | N/A |
| Quá hạn | QUA_HAN | Dark | N/A |

---

## ⚙️ Cấu Hình & Hướng Dẫn Chạy

### Yêu Cầu Hệ Thống

- **Node.js**: 20+
- **npm**: 10+
- **Supabase account** với project postgre SQL
- **VS Code** (optional, recommended)

### 1. Setup Backend

#### Bước 1: Install Dependencies

```bash
cd backend
npm install
```

#### Bước 2: Tạo file `.env`

```bash
cp .env.example .env
```

**Nội dung `.env`**:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase credentials
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Lấy credentials từ Supabase**:

1. Đăng nhập https://app.supabase.com
2. Chọn project → Settings → API
3. Copy `Project URL` & `anon key`
4. Copy `service_role key` (Secret)

#### Bước 3: Cập nhật Database Schema

```bash
# Từ adm Supabase Console, chạy SQL từ supabase/scripts.sql
```

Hoặc sử dụng Supabase CLI:

```bash
npx supabase db push
```

#### Bước 4: Chạy Server

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:4000`

### 2. Setup Frontend

#### Bước 1: Install Dependencies

```bash
cd ../frontend
npm install
```

#### Bước 2: Tạo file `.env.local`

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=http://localhost:4000/api
```

#### Bước 3: Chạy Dev Server

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### 3. Build Production

**Backend**:

```bash
# Render deployment
npm start
```

**Frontend**:

```bash
npm run build
# Output: dist/ folder (triển khai lên Vercel)
```

### 4. Environment Variables Checklist

| Variable                    | Backend | Frontend | Mô Tả                  |
| --------------------------- | ------- | -------- | ---------------------- |
| `PORT`                      | ✅      | -        | Backend port           |
| `NODE_ENV`                  | ✅      | -        | development/production |
| `FRONTEND_URL`              | ✅      | -        | Frontend URL for CORS  |
| `SUPABASE_URL`              | ✅      | ✅       | DB URL                 |
| `SUPABASE_ANON_KEY`         | ✅      | ✅       | Public key             |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅      | -        | Secret key             |
| `VITE_API_URL`              | -       | ✅       | API base URL           |

---

## ⚠️ Vấn Đề Hiện Tại

### 1. Auth Demo/Incomplete

**Vấn đề**: File `auth.service.js` trả về hardcoded token thay vì kết nối Supabase Auth

```javascript
// Current (WRONG)
async login(payload) {
  return {
    token: "demo-token-123456",
    user: { id: "demo-user-001", ... }
  };
}
```

**Khuyến nghị**: Tích hợp Supabase Auth API

```javascript
// Should be:
const { data, error } = await supabase.auth.signInWithPassword({
  email: payload.email,
  password: payload.password,
});
```

### 2. Missing Input Validation

**Vấn đề**: Frontend không validate format email, phone, CCCD trước submit
**Khuyến nghị**: Thêm:

- Email regex validation
- Vietnamese phone format (0xxx xxx xxxx)
- CCCD format (12 số)
- Date range validation

### 3. Payment Processing

**Vấn đề**: Payment endpoint chưa integrate với gateway thực (Stripe, Momo, VNPay)
**Status**: `thanh_toan` table mới lưu data, chưa process
**Khuyến nghị**:

- Thêm Stripe/VNPay SDK
- Implement webhook handlers
- Real transaction validation

### 4. Error Handling

**Vấn đề**:

- Backend error middleware có thể improve error messages
- Frontend không hiển thị error toast/notification khi API fail

### 5. Performance

**Vấn đề**: Lớn queries có thể slow:

- `RentalRequestModel.listByUserId()` join nhiều tables
- Không có pagination trên some endpoints
  **Khuyến nghị**: Thêm indexes, denormalization nếu cần

### 6. Incomplete Features

- 🔄 Rental request approval workflow (Admin)
- 🔄 Auto-generate invoices hàng tháng (Cron job)
- 🔄 Notification system (email/SMS)
- 🔄 File upload (CCCD images, contract PDFs)
- 🔄 Contract signing (E-signature)

### 7. Testing

**Vấn đề**: Không có unit/integration tests
**Khuyến nghị**: Thêm:

- `jest` + `supertest` (backend)
- `vitest` + `@testing-library/react` (frontend)

---

## 🤖 Hướng Dẫn Cho AI

### Cách Sử Dụng Tài Liệu Này

Bạn (AI khác) nên sử dụng documentation này để:

1. **Hiểu cấu trúc dự án**
   - Biết code nằm ở đâu (models, services, controllers)
   - Hiểu flow request: Controller → Service → Model

2. **Phát triển tính năng mới**
   - Thêm endpoint mới: Tạo route + controller + service + model
   - Sửa UI: Xem component structure + style patterns

3. **Fix bugs**
   - Trace flow từ frontend request → backend processing → DB query
   - Dùng database schema để hiểu relationships

### Ví Dụ Prompt Để Generate Code

#### Example 1: Thêm Tính Năng Lọc Giới Tính

```
Dựa vào DormStay project documentation:

1. Frontend: RoomListPage.jsx đã có filter UI cho gender
2. Backend: /api/rooms endpoint hỗ trợ ?gender=Nữ query
3. DB: phong table có cột gioi_tinh

Task: Thêm filter "Chỉ phòng cho Nữ" vào RoomListPage
- Update RoomListPage UI để set gender=Nữ
- Verify backend query filtering hoạt động
- Test API response
```

#### Example 2: Fix Payment Processing

```
Vấn đề: Payment endpoint POST /api/payments không validate transaction

Dựa vào:
- PaymentModel.create() chỉ insert vào DB
- PaymentController.create() không verify payment
- Cần check với payment gateway (Stripe)

Task: Implement payment verification
1. Call Stripe API để retrieve payment status
2. Validate so_tien matches Stripe record
3. Error out nếu không match
4. Chỉ insert vào DB nếu valid
```

#### Example 3: Thêm Feature Lịch Sử Chỉnh Sửa Profile

```
Từ auth flow, cần thêm audit trail:

1. Backend:
   - Taonew table: profile_change_log
   - Thêm trigger: auto-log mỗi update trên ho_so

2. Frontend:
   - ProfilePage.jsx: show change history
   - Call GET /api/auth/me/history endpoint

3. Spec:
   - Schema: id, user_id, old_value, new_value, changed_at
   - Hiển thị: "Name changed from A → B on 2026-04-14"
```

#### Example 4: Implement Auto-Generate Invoices

```
Feature: Monthly invoice generation

Hiểu từ DB:
- hop_dong + khoan_thu_hop_dong → hoa_don
- Cần tính tổng từ khoan_thu, sinh hóa_đơn

Solution:
1. Backend: Cron job (node-cron) chạy daily
2. Logic:
   - Lấy tất cả hop_dong active
   - Sum khoan_thu_hop_dong với giai_doan = HANG_THANG
   - Tạo hoa_don mới nếu chưa có

3. Implement:
   - backend/src/services/invoice.cron.js
   - server.js: init cron job on startup
```

### Quy Tắc Code

**Backend**:

- Async/await with try-catch
- Return JSON via `sendSuccess()` helper
- Validate input before processing
- Use existing error middleware

**Frontend**:

- React hooks (useState, useEffect, useContext)
- Tailwind CSS classes
- Reuse components từ ui/ folder
- Global state qua AuthContext

**Database**:

- Keep schema normalization (3NF)
- Use FK constraints
- Track timestamps (created_at, updated_at)
- Vietnamese naming: tables, columns

### Format Response

All APIs trả về format:

```json
{
  "success": boolean,
  "message": "string",
  "data": {},
  "errors": null,
}
```

### Debugging Tips

1. **Check Backend Logs**:

   ```
   npm run dev (backend)
   → See request logs & errors
   ```

2. **Test API Direct**:

   ```bash
   # Try API in browser
   curl -X GET http://localhost:4000/api/health
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"pass"}'
   ```

3. **DB Query Testing**:
   - Đi Supabase Console → SQL Editor
   - Test queries từ scripts.sql
   - Verify data before API call

4. **Frontend Console**:
   ```
   F12 → Console tab
   Network tab → See API requests/responses
   ```

---

## 📚 File Reference Nhanh

| Task              | File                                   |
| ----------------- | -------------------------------------- |
| Thêm room filter  | `backend/src/models/room.model.js`     |
| Thêm auth logic   | `backend/src/services/auth.service.js` |
| Thêm UI component | `frontend/src/components/ui/`          |
| Thêm page         | `frontend/src/pages/`                  |
| Sửa routing       | `frontend/src/routes/index.jsx`        |
| Sửa DB schema     | `backend/supabase/scripts.sql`         |
| Thêm API endpoint | `backend/src/routes/*`                 |
| Global state      | `frontend/src/context/AuthContext.jsx` |
| API client        | `frontend/src/services/api.js`         |

---

## 📞 Kết Nối & Dependencies

```
Frontend ─(HTTP/REST)─→ Backend ─(SDK)─→ Supabase
                                         └─→ PostgreSQL
                                         └─→ Auth
```

- Frontend không trực tiếp kết nối Supabase DB
- Mọi DB access qua backend API
- Auth: Hybrid (Supabase Auth + Backend JWT validation)

---

## 🎯 Tổng Kết

**DormStay** là ứng dụng quản lý ký túc xá với:

- **Frontend**: React SPA, Tailwind styling, responsive
- **Backend**: Express, 3-layer MVC architecture
- **Database**: PostgreSQL (Supabase), well-normalized schema
- **Auth**: Supabase JWT-based
- **Features**: Room browsing, rental requests, contract management, payments

Dự án đang phát triển với nhiều feature cần hoàn thiện (payment gateway, auto-invoicing, etc.).

Tài liệu này cung cấp đủ thông tin để AI (hoặc developer mới) có thể:

- Hiểu kiến trúc entire system
- Phát triển tính năng mới
- Fix bugs
- Optimize performance
- Prepare for production

---

**Generated**: April 14, 2026  
**Version**: 1.0  
**Status**: Ready for AI Processing ✅
