# 📚 DormStay - Hệ Thống Quản Lý Ký Túc Xá

## 📌 1. Tổng Quan Dự Án

### 1.1 Tên Dự Án

**DormStay Starter** - Nền tảng quản lý ký túc xá toàn diện

### 1.2 Mục Tiêu Chính

Xây dựng hệ thống quản lý ký túc xá hiện đại, cho phép:

- **Quản lý phòng & giường**: Theo dõi tình trạng các phòng, giường, giá cả
- **Quản lý người dùng**: Phân quyền (khách hàng, nhân viên, quản lý)
- **Quản lý yêu cầu thuê**: Tiếp nhận, xử lý yêu cầu thuê phòng/giường
- **Quản lý hợp đồng**: Tạo và quản lý hợp đồng cho các khách hàng
- **Quản lý thanh toán**: Theo dõi hoá đơn, thanh toán tiền thuê, tiền cọc
- **Ghi chú & lịch sử**: Theo dõi các bước thay đổi trạng thái

### 1.3 Đối Tượng Người Dùng

1. **Khách hàng**: Tìm phòng, đặt cọc, xem hợp đồng, thanh toán online
2. **Nhân viên**: Xử lý yêu cầu, quản lý hợp đồng, theo dõi thanh toán
3. **Quản lý**: Quản lý toàn bộ hệ thống, người dùng, doanh thu
4. **Chủ nhà**: Quản lý tài sản, phòng, thu các khoản tiền

### 1.4 Các Chức Năng Chính

| Chức Năng                 | Mô Tả                                    |
| ------------------------- | ---------------------------------------- |
| **Xem danh sách phòng**   | Khách hàng duyệt các phòng/giường có sẵn |
| **Đặt cọc**               | Gửi yêu cầu thuê + số tiền cọc ban đầu   |
| **Quản lý hợp đồng**      | Tạo/xem/ký hợp đồng thuê                 |
| **Thanh toán online**     | Thanh toán tiền thuê hàng tháng          |
| **Theo dõi hoá đơn**      | Xem lịch sử các hoá đơn                  |
| **Quản lý tài sản phòng** | Ghi nhận đá gạn, Wi-Fi, AC, v.v.         |

---

## 🏗️ 2. Cấu Trúc Thư Mục

```
DormStay/
├── 📄 LICENSE
├── 📄 README.md
├── 📄 PROJECT_OVERVIEW.md (tài liệu này)
│
├── backend/                          # API Server (Node.js + Express)
│   ├── package.json                 # Dependencies backend
│   ├── server.js                    # Điểm vào chính (Entry point)
│   ├── seedData.js                  # Script seed dữ liệu ban đầu
│   │
│   ├── src/
│   │   ├── config/                  # Cấu hình
│   │   │   ├── env.js               # Biến môi trường
│   │   │   └── supabase.js          # Khởi tạo client Supabase
│   │   │
│   │   ├── controllers/             # Xử lý request (Business logic)
│   │   │   ├── auth.controller.js         # Đăng nhập, đăng ký
│   │   │   ├── room.controller.js         # Quản lý phòng
│   │   │   ├── rentalRequest.controller.js # Yêu cầu thuê
│   │   │   ├── contract.controller.js     # Quản lý hợp đồng
│   │   │   └── payment.controller.js      # Quản lý thanh toán
│   │   │
│   │   ├── services/                # Logic nghiệp vụ (Business Layer)
│   │   │   ├── auth.service.js            # Xử lý auth
│   │   │   ├── room.service.js            # Lấy dữ liệu phòng
│   │   │   ├── rentalRequest.service.js   # Xử lý yêu cầu thuê
│   │   │   ├── contract.service.js        # Xử lý hợp đồng
│   │   │   └── payment.service.js         # Xử lý thanh toán
│   │   │
│   │   ├── models/                  # Truy vấn dữ liệu (Data Layer)
│   │   │   ├── user.model.js              # Truy vấn user/profile
│   │   │   ├── room.model.js              # Truy vấn phòng
│   │   │   ├── rentalRequest.model.js     # Truy vấn yêu cầu thuê
│   │   │   ├── contract.model.js          # Truy vấn hợp đồng
│   │   │   ├── payment.model.js           # Truy vấn thanh toán
│   │   │   └── invoice.model.js           # Truy vấn hoá đơn
│   │   │
│   │   ├── routes/                  # API Endpoints
│   │   │   ├── index.js             # Routes chính
│   │   │   ├── auth.routes.js       # /api/auth/*
│   │   │   ├── room.routes.js       # /api/rooms/*
│   │   │   ├── rentalRequest.routes.js  # /api/rental-requests/*
│   │   │   ├── contract.routes.js   # /api/contracts/*
│   │   │   └── payment.routes.js    # /api/payments/*
│   │   │
│   │   ├── middlewares/             # Xử lý trước/sau request
│   │   │   ├── auth.middleware.js       # Xác thực token
│   │   │   ├── error.middleware.js      # Xử lý lỗi
│   │   │   └── validate.middleware.js   # Validate dữ liệu
│   │   │
│   │   └── utils/                   # Hàm tiện ích
│   │       ├── asyncHandler.js      # Wrapper async/await
│   │       ├── apiResponse.js       # Format response API
│   │       ├── errors.js            # Custom error classes
│   │       └── helpers.js           # Các hàm helper
│   │
│   └── supabase/
│       └── scripts.sql              # Schema cơ sở dữ liệu
│
└── frontend/                         # Giao diện người dùng (React + Vite)
    ├── package.json                 # Dependencies frontend
    ├── vite.config.js               # Config Vite
    ├── jsconfig.json                # Config JavaScript/JSX
    ├── index.html                   # HTML template chính
    │
    ├── public/
    │   └── images/                  # Hình ảnh tĩnh
    │
    └── src/
        ├── main.jsx                 # Entry point app React
        ├── index.css                # Tailwind CSS
        ├── App.jsx                  # Component gốc
        │
        ├── components/              # Các component tái sử dụng
        │   ├── common/              # Layout components
        │   │   ├── Header.jsx       # Header/Navbar
        │   │   ├── Footer.jsx       # Footer
        │   │   ├── Sidebar.jsx      # Sidebar navigation
        │   │   ├── PageHeader.jsx   # Header trang
        │   │   └── EmptyState.jsx   # Trạng thái rỗng
        │   │
        │   ├── forms/               # Form components
        │   │   ├── LoginForm.jsx    # Form đăng nhập
        │   │   ├── RegisterForm.jsx # Form đăng ký
        │   │   ├── RentalRequestForm.jsx # Form đặt cọc
        │   │   └── PaymentForm.jsx  # Form thanh toán
        │   │
        │   └── ui/                  # UI components cơ bản
        │       ├── Button.jsx       # Component nút bấm
        │       ├── Input.jsx        # Input field
        │       ├── Select.jsx       # Select dropdown
        │       ├── Card.jsx         # Card container
        │       ├── Badge.jsx        # Badge/Tag
        │       ├── Modal.jsx        # Modal dialog
        │       ├── Table.jsx        # Table component
        │       ├── Tabs.jsx         # Tab component
        │       └── Loader.jsx       # Loading spinner
        │
        ├── layouts/                 # Layout templates
        │   ├── MainLayout.jsx       # Layout công khai
        │   ├── AuthLayout.jsx       # Layout login/register
        │   └── DashboardLayout.jsx  # Layout dashboard
        │
        ├── pages/                   # Các trang (Page components)
        │   ├── HomePage.jsx         # Trang chủ
        │   ├── AboutPage.jsx        # Trang giới thiệu
        │   ├── RoomListPage.jsx     # Danh sách phòng
        │   ├── RoomDetailPage.jsx   # Chi tiết phòng
        │   ├── LoginPage.jsx        # Trang đăng nhập
        │   ├── RegisterPage.jsx     # Trang đăng ký
        │   ├── RentalRequestListPage.jsx # Danh sách yêu cầu
        │   ├── RentalRequestPage.jsx     # Trang đặt cọc
        │   ├── RequestDetailPage.jsx     # Chi tiết yêu cầu
        │   ├── ContractListPage.jsx      # Danh sách hợp đồng
        │   ├── ContractDetailPage.jsx    # Chi tiết hợp đồng
        │   └── NotFoundPage.jsx     # Trang 404
        │
        ├── routes/                  # Cấu hình routing
        │   ├── index.jsx            # Setup router chính
        │   ├── ProtectedRoute.jsx   # Route yêu cầu đăng nhập
        │   └── GuestRoute.jsx       # Route chỉ cho khách
        │
        ├── services/                # API client services
        │   ├── api.js               # Setup Axios instance
        │   ├── auth.service.js      # Gọi API auth
        │   ├── room.service.js      # Gọi API phòng
        │   ├── rentalRequest.service.js # Gọi API yêu cầu
        │   ├── contract.service.js  # Gọi API hợp đồng
        │   └── payment.service.js   # Gọi API thanh toán
        │
        └── lib/                     # Hàm tiện ích, hằng số
            ├── constants.js         # Hằng số ứng dụng
            ├── format.js            # Định dạng dữ liệu
            ├── helpers.js           # Hàm helper
            └── storage.js           # LocalStorage wrapper
```

### 2.1 Giải Thích Các Thư Mục Chính

| Thư Mục                     | Vai Trò                                                  |
| --------------------------- | -------------------------------------------------------- |
| **backend/src/config**      | Khởi tạo & cấu hình ứng dụng (Supabase, biến môi trường) |
| **backend/src/controllers** | Xử lý request HTTP, gọi service, trả response            |
| **backend/src/services**    | Chứa logic nghiệp vụ chính, xử lý dữ liệu                |
| **backend/src/models**      | Truy vấn database, mapping dữ liệu                       |
| **backend/src/routes**      | Định nghĩa các endpoint API                              |
| **backend/src/middlewares** | Xử lý auth, error handling, validation                   |
| **frontend/src/components** | Các component tái sử dụng                                |
| **frontend/src/pages**      | Các trang chính của ứng dụng                             |
| **frontend/src/services**   | Client API services (Axios)                              |
| **frontend/src/layouts**    | Template layout cho các trang                            |

### 2.2 Các File Quan Trọng

| File                                                             | Mục Đích                                         |
| ---------------------------------------------------------------- | ------------------------------------------------ |
| [backend/server.js](backend/server.js)                           | Khởi động Express server, setup CORS, middleware |
| [backend/src/config/supabase.js](backend/src/config/supabase.js) | Kết nối Supabase database                        |
| [backend/src/routes/index.js](backend/src/routes/index.js)       | Tập hợp tất cả các route API                     |
| [backend/supabase/scripts.sql](backend/supabase/scripts.sql)     | Schema database (13 bảng chính)                  |
| [frontend/src/routes/index.jsx](frontend/src/routes/index.jsx)   | Cấu hình routing ứng dụng React                  |
| [frontend/src/App.jsx](frontend/src/App.jsx)                     | Component gốc của ứng dụng                       |
| [frontend/src/services/api.js](frontend/src/services/api.js)     | Setup Axios client với base URL                  |

---

## ⚙️ 3. Kiến Trúc & Thiết Kế

### 3.1 Kiến Trúc Tổng Thể

**Kiến Trúc**: Layered Architecture (Kiến Trúc Phân Tầng) + MVC Pattern

```
┌─────────────────────────────────────────┐
│        FRONTEND (React + Vite)          │
│  - Pages, Components, Services          │
│  - Tailwind CSS UI                      │
└────────────┬────────────────────────────┘
             │ HTTP(S)
             ↓
┌─────────────────────────────────────────┐
│      API GATEWAY (Express Server)       │
│  - Routes, Controllers, Middlewares     │
│  - Error Handling, CORS                 │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│      BUSINESS LOGIC LAYER               │
│  - Services (Auth, Room, Payment, etc)  │
│  - Validation, Processing               │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│      DATA ACCESS LAYER                  │
│  - Models (Database Queries)            │
│  - Data Mapping, Transformation         │
└────────────┬────────────────────────────┘
             │ Supabase SDK
             ↓
┌─────────────────────────────────────────┐
│   DATABASE (PostgreSQL via Supabase)    │
│  - 13 Tables (phòng, hợp đồng, etc)    │
│  - Authentication                       │
└─────────────────────────────────────────┘
```

### 3.2 Cách Các Thành Phần Tương Tác

**Luồng Request/Response Điển Hình:**

```
1. FRONTEND (React)
   ↓ (Gửi HTTP Request via Axios)
2. BACKEND ROUTES
   ↓ (Nhận request, kiểm tra auth)
3. CONTROLLERS
   ↓ (Parse input, gọi service)
4. SERVICES
   ↓ (Xử lý logic, gọi model)
5. MODELS
   ↓ (Query database via Supabase)
6. DATABASE (Supabase/PostgreSQL)
   ↓ (Lấy/cập nhật dữ liệu)
7. MODELS
   ↓ (Map dữ liệu sang frontend format)
8. SERVICES
   ↓ (Trả kết quả xử lý)
9. CONTROLLERS
   ↓ (Format response JSON)
10. ROUTES
   ↓ (Gửi HTTP Response)
11. FRONTEND
   ↓ (Nhận dữ liệu, cập nhật UI)
12. USER
```

**Ví dụ: Lấy Danh Sách Phòng**

```javascript
// Frontend
RoomService.getRooms()  // services/room.service.js
  └─→ GET /api/rooms

// Backend
app.get('/api/rooms', getList)  // routes/room.routes.js
  └─→ RoomController.getList()  // controllers/room.controller.js
    └─→ RoomService.getList()   // services/room.service.js
      └─→ RoomModel.list()      // models/room.model.js
        └─→ supabase.from('phong').select(...)
          └─→ Database Query → Response JSON
```

### 3.3 Luồng Dữ Liệu (Data Flow)

**Luồng Data từ DB → Frontend:**

```
Database (Supabase)
    ↓ (Raw data)
Model.mapRoomToFrontendFormat()  [models/room.model.js]
    ↓ (Formatted data: id, name, price, etc)
Service.getList()                [services/room.service.js]
    ↓ (Business logic applied)
Controller.getList()             [controllers/room.controller.js]
    ↓ (Wrapped in API response)
HTTP Response
    ↓ (JSON with { success, data, message })
RoomService.getRooms()           [frontend/services/room.service.js]
    ↓ (Extract response.data.data)
React State (setRooms)
    ↓ (Render UI)
Browser Display
```

**Luồng Authentication:**

```
Frontend (LoginForm)
    ↓ (Email + Password)
POST /api/auth/login
    ↓
AuthService.login()
    ├─→ Validate input
    ├─→ Call Supabase Auth
    ├─→ Create profile in ho_so table
    └─→ Return token + user info
    ↓
Frontend (Store token in localStorage)
    ↓
Set Authorization Header: "Bearer {token}"
    ↓ (Gửi kèm các request tiếp theo)
AuthMiddleware
    ├─→ Check token
    └─→ Attach user to req.user
```

---

## 🔑 4. Các Module Chính

### 4.1 Module Authentication (Auth)

**Mục Đích**: Quản lý đăng nhập, đăng ký, xác thực người dùng

**Các API Endpoints:**

```
POST /api/auth/login       - Đăng nhập
POST /api/auth/register    - Đăng ký tài khoản
GET  /api/auth/me          - Lấy info người dùng hiện tại
```

**Key Functions:**

- `AuthService.login(credentials)` - Xác thực và tạo session
- `AuthService.register(userData)` - Tạo tài khoản mới
- `authMiddleware` - Kiểm tra token authentication

**File Liên Quan:**

- [backend/src/controllers/auth.controller.js](backend/src/controllers/auth.controller.js)
- [backend/src/services/auth.service.js](backend/src/services/auth.service.js)
- [backend/src/models/user.model.js](backend/src/models/user.model.js)
- [frontend/src/pages/LoginPage.jsx](frontend/src/pages/LoginPage.jsx)

---

### 4.2 Module Room Management (Phòng)

**Mục Đích**: Quản lý danh sách phòng, thông tin chi tiết, trạng thái

**Các API Endpoints:**

```
GET /api/rooms            - Lấy danh sách tất cả phòng
GET /api/rooms/:id        - Lấy chi tiết 1 phòng
```

**Key Functions:**

- `RoomModel.list()` - Query tất cả phòng từ DB
- `RoomModel.getById(id)` - Query chi tiết phòng
- `mapRoomToFrontendFormat(rawData)` - Transform dữ liệu DB → Frontend format

**Dữ Liệu Trả Về (Mẫu):**

```javascript
{
  id: 1,
  name: "Phòng 101",
  price: "3.000.000 ₫",
  rawPrice: 3000000,
  unit: "/tháng/phòng",
  status: "CÒN TRỐNG",
  statusColor: "text-emerald-700",
  floor: "Tầng 1",
  capacity: "4 người",
  amenities: ["Điều hòa", "WiFi", "Giường đôi"],
  image: "https://...",
  gallery: ["https://...", "https://..."],
  building: "Tòa A"
}
```

**File Liên Quan:**

- [backend/src/controllers/room.controller.js](backend/src/controllers/room.controller.js)
- [backend/src/services/room.service.js](backend/src/services/room.service.js)
- [backend/src/models/room.model.js](backend/src/models/room.model.js)
- [frontend/src/pages/RoomListPage.jsx](frontend/src/pages/RoomListPage.jsx)

---

### 4.3 Module Rental Request (Yêu Cầu Thuê)

**Mục Đích**: Quản lý yêu cầu thuê phòng/giường, tiền cọc

**Các Trạng Thái:**

```
MOI_TAO      → Vừa tạo
DANG_GIU_CHO → Đang giữ chỗ
CHAP_NHAN    → Được chấp nhận
TU_CHOI      → Bị từ chối
HUY          → Bị hủy
```

**Key Functions:**

- `RentalRequestService.create()` - Tạo yêu cầu thuê mới
- `RentalRequestService.list()` - Lấy danh sách yêu cầu
- `RentalRequestService.acceptRequest()` - Chấp nhận yêu cầu

**File Liên Quan:**

- [backend/src/controllers/rentalRequest.controller.js](backend/src/controllers/rentalRequest.controller.js)
- [backend/src/services/rentalRequest.service.js](backend/src/services/rentalRequest.service.js)
- [frontend/src/pages/RentalRequestPage.jsx](frontend/src/pages/RentalRequestPage.jsx)

---

### 4.4 Module Contract Management (Hợp Đồng)

**Mục Đích**: Quản lý hợp đồng thuê, hiệu lực, kỳ hạn

**Các Thông Tin Chinh:**

- Người đăng ký contract (khách hàng)
- Phòng/Giường được thuê
- Ngày vào ở
- Giá thuê hàng tháng
- Tiền cọc bảo đảm
- Trạng thái (HIỆU LỰC, HẾT HẠN, ĐÌNH CHỈ)

**Key Functions:**

- `ContractService.create()` - Tạo hợp đồng từ yêu cầu thuê
- `ContractService.list()` - Lấy danh sách hợp đồng
- `ContractService.getDetail()` - Lấy chi tiết hợp đồng

**File Liên Quan:**

- [backend/src/controllers/contract.controller.js](backend/src/controllers/contract.controller.js)
- [backend/src/models/contract.model.js](backend/src/models/contract.model.js)
- [frontend/src/pages/ContractListPage.jsx](frontend/src/pages/ContractListPage.jsx)

---

### 4.5 Module Payment (Thanh Toán)

**Mục Đích**: Quản lý hoá đơn, thanh toán tiền thuê và cọc

**Các Loại Hoá Đơn:**

```
DAT_COC         → Hoá đơn tiền cọc ban đầu
THANG_TAI_KHOAN → Hoá đơn hàng tháng
HOAN_LAI        → Hoá đơn hoàn lại tiền cọc
```

**Trạng Thái Thanh Toán:**

```
CHO_THANH_TOAN → Chưa thanh toán
THANH_TOAN_PHAN_TRAM → Thanh toán một phần
THANH_TOAN_TOAN_BO → Đã thanh toán hết
THUA_TIEN      → Thừa tiền cần hoàn
```

**Key Functions:**

- `PaymentService.getInvoices()` - Lấy danh sách hoá đơn
- `PaymentService.createPayment()` - Tạo ghi nhận thanh toán
- `PaymentService.getPaymentStatus()` - Kiểm tra trạng thái

**File Liên Quan:**

- [backend/src/controllers/payment.controller.js](backend/src/controllers/payment.controller.js)
- [backend/src/models/payment.model.js](backend/src/models/payment.model.js)
- [backend/src/models/invoice.model.js](backend/src/models/invoice.model.js)

---

## 🗄️ 5. Dữ Liệu & Database

### 5.1 Loại Database

**PostgreSQL** thông qua **Supabase** (Backend-as-a-Service)

- **Connection**: Supabase Client SDK (`@supabase/supabase-js`)
- **Authentication**: Supabase Auth (JWT tokens)
- **Real-time**: Hỗ trợ (chưa dùng trong project hiện tại)

### 5.2 Schema - Các Bảng Chính

#### **[1] Nhân Sự / Hồ Sơ**

```sql
-- Hồ Sơ Người Dùng
ho_so (Profiles)
├── ma_ho_so (PK)              -- ID
├── ma_nguoi_dung_xac_thuc (FK) -- Link tới Supabase Auth
├── vai_tro                    -- "KHACH_HANG", "NHAN_VIEN", "QUAN_LY"
├── ho_ten                     -- Họ tên
├── email                      -- Email
└── so_dien_thoai              -- Số điện thoại

```

#### **[2] Tòa Nhà & Phòng**

```sql
-- Tòa Nhà
toa (Buildings)
├── ma_toa (PK)                -- ID
├── ma_dinh_danh               -- Unique identifier (e.g., "TOA_001")
├── ten                        -- Tên tòa
├── dia_chi                    -- Địa chỉ
├── quan_huyen                 -- Quận/Huyện
└── thanh_pho                  -- Thành phố

-- Tầng Trong Tòa
tang (Floors)
├── ma_tang (PK)               -- ID
├── ma_toa (FK)                -- Tòa nhà
├── so_tang                    -- Số thứ tự tầng
└── ten_tang                   -- Tên tầng

-- Phòng (Room/Bed Space)
phong (Rooms)
├── ma_phong (PK)              -- ID
├── ma_toa (FK)                -- Tòa nhà
├── ma_tang (FK)               -- Tầng
├── ma_phong_hien_thi          -- Display ID (e.g., "101")
├── loai_phong                 -- "PHONG_RIENG" / "PHONG_CHUNG"
├── suc_chua                   -- Sức chứa (số giường)
├── gia_thang                  -- Giá thuê (VND)
└── trang_thai                 -- "TRONG" (trống), "SAP_DAY", "DA_THUE_HET"

-- Giường Trong Phòng
giuong (Beds)
├── ma_giuong (PK)             -- ID
├── ma_phong (FK)              -- Phòng
├── ma_giuong_hien_thi         -- Display ID (e.g., "A", "B")
├── nhan_giuong                -- Người nằm
├── gia_thang                  -- Giá thuê riêng
└── trang_thai                 -- "TRONG", "DA_CO_NGUOI"

-- Hình Ảnh & Tài Sản
hinh_anh_phong (Room Images)
├── ma_hinh_anh (PK)
├── ma_phong (FK)
├── duong_dan_cong_khai        -- URL
├── la_anh_bia                 -- Có phải ảnh bìa?
└── thu_tu_hien_thi            -- Thứ tự hiển thị

tai_san_phong (Room Assets)
├── ma_tai_san (PK)
├── ma_phong (FK)
├── ten_tai_san                -- "Điều hòa", "WiFi", etc
├── danh_muc                   -- Danh mục
└── muc_boi_thuong_mac_dinh    -- Mức bồi thường (nếu hỏng)
```

#### **[3] Yêu Cầu Thuê & Giữ Chỗ**

```sql
-- Yêu Cầu Thuê (Rental Requests)
yeu_cau_thue (Rental Requests)
├── ma_yeu_cau_thue (PK)
├── ma_ho_so_khach_hang (FK)    -- Khách hàng
├── ma_ho_so_nhan_vien_phu_trach (FK) -- Nhân viên phụ trách
├── loai_muc_tieu               -- "PHONG" / "GIUONG"
├── ma_phong (FK)               -- Phòng
├── ma_giuong (FK)              -- Giường
├── ngay_du_kien_vao_o          -- Ngày dự kiến vào ở
├── gia_thue_thang              -- Giá thuê (VND)
├── so_tien_dat_coc             -- Tiền cọc (VND)
├── trang_thai                  -- "MOI_TAO", "DANG_GIU_CHO", "CHAP_NHAN", etc
├── created_at
└── updated_at

-- Lịch Sử Trạng Thái Yêu Cầu
nhat_ky_yeu_cau_thue (Request Status History)
├── ma_nhat_ky (PK)
├── ma_yeu_cau_thue (FK)
├── trang_thai_cu               -- Trạng thái cũ
├── trang_thai_moi              -- Trạng thái mới
├── ma_ho_so_nguoi_thuc_hien (FK) -- Người thực hiện
├── ghi_chu                     -- Ghi chú
└── created_at

-- Giữ Chỗ Tạm (Holding Reserve)
giu_cho_tam (Temporary Holds)
├── ma_giu_cho_tam (PK)
├── ma_yeu_cau_thue (FK)
├── loai_muc_tieu               -- "PHONG" / "GIUONG"
├── ma_phong (FK)
├── ma_giuong (FK)
├── trang_thai                  -- "DANG_GIU", "DA_HUY"
├── thoi_gian_het_han           -- Hết hạn giữ chỗ
└── ly_do_huy_giu_cho           -- Lý do hủy
```

#### **[4] Hợp Đồng & Thanh Toán**

```sql
-- Hợp Đồng (Contracts)
hop_dong (Contracts)
├── ma_hop_dong (PK)
├── ma_yeu_cau_thue (FK)        -- Từ yêu cầu thuê
├── ma_ho_so_khach_hang (FK)    -- Khách hàng
├── loai_muc_tieu               -- "PHONG" / "GIUONG"
├── ma_phong (FK)
├── ma_giuong (FK)
├── ngay_vao_o                  -- Ngày vào ở thực tế
├── gia_thue_co_ban_thang       -- Giá cơ bản
├── so_tien_dat_coc_bao_dam     -- Tiền cọc bảo đảm
├── trang_thai                  -- "HIEU_LUC", "HET_HAN", "DINH_CHI"
├── created_at
└── updated_at

-- Hoá Đơn (Invoices)
hoa_don (Invoices)
├── ma_hoa_don (PK)
├── ma_yeu_cau_thue (FK)
├── ma_hop_dong (FK)
├── loai_hoa_don                -- "DAT_COC", "THANG_TAI_KHOAN", "HOAN_LAI"
├── trang_thai                  -- "CHO_THANH_TOAN", "DA_THANH_TOAN"
├── tong_so_tien                -- Tổng tiền (VND)
├── so_tien_da_thanh_toan       -- Đã thanh toán (VND)
├── ma_tai_khoan_ngan_hang      -- Tài khoản ngân hàng
├── ma_tham_chieu_qr            -- QR reference
├── ngay_lap                    -- Ngày lập
├── ngay_den_han                -- Hạn thanh toán
├── created_at
└── updated_at

-- Thanh Toán (Payments)
thanh_toan (Payments)
├── ma_thanh_toan (PK)
├── ma_hoa_don (FK)
├── so_tien_thanh_toan          -- Số tiền thanh toán
├── phuong_thuc                 -- "CHUYEN_KHOAN", "THE_TIN_DUNG", "TIEN_MAT"
├── ngay_thanh_toan             -- Ngày thanh toán
├── ghi_chu                     -- Ghi chú
└── created_at
```

### 5.3 Quan Hệ Giữa Các Bảng

```
ho_so (Profiles)
  ├── 1:N → yeu_cau_thue (Customer requests)
  ├── 1:N → yeu_cau_thue (Staff assigned)
  ├── 1:N → hop_dong (Customer contracts)
  └── 1:N → nhat_ky_yeu_cau_thue (Actions performed)

toa (Buildings)
  ├── 1:N → tang (Floors)
  └── 1:N → phong (Rooms)

phong (Rooms)
  ├── 1:N → giuong (Beds)
  ├── 1:N → hinh_anh_phong (Images)
  ├── 1:N → tai_san_phong (Assets)
  ├── 1:N → yeu_cau_thue (Rental requests)
  ├── 1:N → giu_cho_tam (Holds)
  └── 1:N → hop_dong (Contracts)

giuong (Beds)
  ├── 1:N → yeu_cau_thue
  ├── 1:N → giu_cho_tam
  └── 1:N → hop_dong

yeu_cau_thue (Rental Requests)
  ├── 1:1 → hop_dong (One request → One contract)
  ├── 1:N → nhat_ky_yeu_cau_thue (Status history)
  ├── 1:N → giu_cho_tam (Holds)
  ├── 1:N → hoa_don (Invoices)
  └── M:N → thanh_toan (Payments)
```

### 5.4 Cascade Rules

- **ON DELETE RESTRICT**: Không xóa nếu có dữ liệu con (e.g., tòa có phòng)
- **ON DELETE CASCADE**: Xóa dữ liệu con tự động (e.g., xóa phòng → xóa giường)
- **ON DELETE SET NULL**: Đặt NULL khi xóa cha (nhân viên phụ trách có thể NULL)

---

## 🔌 6. Công Nghệ Sử Dụng

### 6.1 Ngôn Ngữ Lập Trình

| Phần         | Ngôn Ngữ             | Bản Phát Hành    |
| ------------ | -------------------- | ---------------- |
| **Backend**  | JavaScript (Node.js) | Node.js 20+      |
| **Frontend** | JavaScript (JSX)     | ECMAScript 2022+ |
| **Database** | SQL (PostgreSQL)     | PostgreSQL 13+   |

### 6.2 Framework & Runtime

| Công Nghệ            | Phiên Bản | Vai Trò                 |
| -------------------- | --------- | ----------------------- |
| **Express**          | 5.2.1     | Web Framework (Backend) |
| **React**            | 19.2.4    | UI Library (Frontend)   |
| **Vite**             | 8.0.3     | Build Tool & Dev Server |
| **React Router DOM** | 7.13.2    | Client-side Routing     |
| **Supabase JS**      | 2.99.2    | Database & Auth Client  |

### 6.3 Thư Viện & Dependencies Quan Trọng

#### **Backend Dependencies**

```json
{
  "@supabase/supabase-js": "^2.99.2", // Database & Auth
  "cors": "^2.8.6", // Enable CORS
  "express": "^5.2.1", // Web Framework
  "dotenv": "^17.4.0" // Environment variables
}
```

#### **Backend DevDependencies**

```json
{
  "nodemon": "^3.1.14" // Auto-restart on file changes
}
```

#### **Frontend Dependencies**

```json
{
  "axios": "^1.14.0", // HTTP Client
  "react": "^19.2.4", // UI Library
  "react-dom": "^19.2.4", // DOM Rendering
  "react-router-dom": "^7.13.2" // Routing
}
```

#### **Frontend DevDependencies**

```json
{
  "@tailwindcss/vite": "^4.2.2", // Tailwind CSS Plugin
  "@vitejs/plugin-react": "^6.0.1", // React Plugin for Vite
  "tailwindcss": "^4.2.2", // CSS Framework
  "vite": "^8.0.3" // Build Tool
}
```

### 6.4 Các Công Cụ & Tool

| Tool                | Mục Đích                    |
| ------------------- | --------------------------- |
| **npm**             | Package Manager             |
| **Supabase**        | Database, Auth, Storage     |
| **Vite**            | Fast Build Tool             |
| **Tailwind CSS v4** | Utility-first CSS Framework |
| **Axios**           | Promise-based HTTP Client   |
| **Nodemon**         | Development auto-reload     |

### 6.5 Tóm Tắt Tech Stack

```
┌─────────────────────────────────────────────┐
│ FRONTEND                                    │
├─────────────────────────────────────────────┤
│ React 19 + Vite 8 + Tailwind CSS 4          │
│ React Router 7 + Axios 1                    │
│ Components: Functional + Hooks              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ COMMUNICATION                               │
├─────────────────────────────────────────────┤
│ HTTP/REST API (JSON)                        │
│ CORS Enabled                                │
│ Bearer Token Authentication                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ BACKEND                                     │
├─────────────────────────────────────────────┤
│ Node.js 20+ + Express 5                     │
│ MVC + Service Pattern                       │
│ Async/Await                                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ DATABASE                                    │
├─────────────────────────────────────────────┤
│ PostgreSQL 13+ via Supabase                 │
│ 13 Tables, Triggers, Constraints            │
│ Supabase Auth Integration                   │
└─────────────────────────────────────────────┘
```

---

## 🚀 7. Cách Chạy Dự Án

### 7.1 Yêu Cầu Môi Trường

```
- Node.js: 20+
- npm: 10+
- Git
- Supabase account (tạo project mới hoặc dùng existing)
```

### 7.2 Các Bước Setup & Installation

#### **Bước 1: Clone Repository & Install Dependencies**

```bash
# Clone project
git clone <repo-url>
cd DormStay

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (trong terminal khác)
cd frontend
npm install
```

#### **Bước 2: Cấu Hình Environment Backend**

```bash
# Tại thư mục backend/
cp .env.example .env
```

Chỉnh sửa file `.env`:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key...

# Server Configuration
PORT=4000
FRONTEND_URL=http://localhost:5173

# Other configs
NODE_ENV=development
```

**Lấy thông tin Supabase:**

1. Đăng nhập vào [Supabase Console](https://app.supabase.com)
2. Vào Project Settings → API
3. Copy `Project URL` → `SUPABASE_URL`
4. Copy `Service Role Key` → `SUPABASE_SERVICE_ROLE_KEY`

#### **Bước 3: Setup Database Schema**

```bash
# Tại Supabase Console:
# 1. Vào SQL Editor
# 2. Tạo query mới
# 3. Copy nội dung từ backend/supabase/scripts.sql
# 4. Chạy query (⌘ + Enter hoặc Ctrl + Enter)
```

Hoặc chạy từ terminal:

```bash
# Sẽ cần cài Supabase CLI
brew install supabase/tap/supabase  # macOS
# hoặc
choco install supabase             # Windows

# Sau đó:
supabase db push
```

#### **Bước 4: Chạy Backend Server**

```bash
cd backend
npm run dev
```

**Output:**

```
Backend is running at http://localhost:4000
✅ Supabase successfully connected.
```

**Health Check:**

```bash
curl http://localhost:4000/health
# Response: { "success": true, "message": "Server is healthy" }
```

#### **Bước 5: Chạy Frontend (trong terminal khác)**

```bash
cd frontend
npm run dev
```

**Output:**

```
Local:   http://localhost:5173
Press q to quit
```

### 7.3 Build & Deployment

#### **Build Frontend**

```bash
cd frontend
npm run build
```

Output: `frontend/dist/` (production-ready files)

#### **Preview Production Build**

```bash
npm run preview
```

#### **Deploy Backend** (ví dụ)

```bash
# Deploy to Vercel
vercel deploy

# hoặc Deploy to Railway
railway deploy

# hoặc Docker
docker build -t dormicare-backend .
docker run -p 4000:4000 dormicare-backend
```

#### **Deploy Frontend** (ví dụ)

```bash
# Deploy to Vercel
vercel

# hoặc Netlify
netlify deploy --prod --dir=dist

# hoặc GitHub Pages
npm run build
# Push dist folder to gh-pages branch
```

### 7.4 Các Lệnh Quan Trọng

**Backend:**

```bash
npm run dev      # Chạy dev server với nodemon
npm start        # Chạy production server
```

**Frontend:**

```bash
npm run dev      # Chạy dev server
npm run build    # Build production
npm run preview  # Xem preview build
```

### 7.5 Troubleshooting

| Lỗi                          | Nguyên Nhân                   | Giải Pháp                                      |
| ---------------------------- | ----------------------------- | ---------------------------------------------- |
| `Cannot connect to Supabase` | Missing env vars              | Kiểm tra `.env`, đảm bảo URL & key chính xác   |
| `CORS error`                 | Frontend URL not in whitelist | Thêm `http://localhost:5173` vào CORS settings |
| `Port 4000 already in use`   | Cổng bị chiếm                 | Dùng cổng khác hoặc kill process               |
| `npm ERR! missing`           | Dependencies chưa cài         | Chạy `npm install` lại                         |
| `React not found`            | Node modules delete           | `rm -rf node_modules` → `npm install`          |

---

## 📎 8. Ghi Chú Thêm

### 8.1 Design Patterns Sử Dụng

#### **1. MVC Pattern (Model-View-Controller)**

```
Model  → Dữ liệu & logic database
View   → Frontend (React components)
Controller → Xử lý request & response
```

#### **2. Service Layer Pattern**

```
Controller → Service → Model
(khác biệt: tách business logic ra Service)
```

#### **3. Data Mapper Pattern**

```
mapRoomToFrontendFormat() trong room.model.js
Chuyển đổi: Database format → API response format
```

#### **4. Middleware Pattern**

```
Express middleware chain:
CORS → JSON Parser → Auth → Route Handler → Error Handler
```

#### **5. Repository Pattern** (Partial)

```
Models coi như repositories lấy data từ Supabase
Có query methods: list(), getById(), create(), update()
```

#### **6. Error Handling Pattern**

```
asyncHandler wrapper → Bắt exception → errorHandler middleware
```

### 8.2 Các Phần Chưa Hoàn Thiện

- ⚠️ **Authentication**: Hiện tại mock (demo), cần kết nối với Supabase Auth thực tế
- ⚠️ **Authorization**: Chưa implement role-based access control (RBAC)
- ⚠️ **Validation**: Chưa có schema validation (nên dùng Joi, Zod)
- ⚠️ **Error Status Codes**: Chưa đầy đủ HTTP status codes
- ⚠️ **Pagination**: Chưa có pagination cho danh sách
- ⚠️ **Filtering/Search**: Chưa có filter & search functionality
- ⚠️ **Caching**: Chưa implement cache (Redis/Browser cache)
- ⚠️ **Testing**: Chưa có unit tests hoặc integration tests
- ⚠️ **Logging**: Chưa có proper logging system
- ⚠️ **File Upload**: Chưa support upload ảnh/tài liệu
- ⚠️ **Real-time Updates**: Chưa dùng WebSocket hoặc Supabase Realtime
- ⚠️ **Internationalization**: UI cứng tiếng Việt, chưa i18n

### 8.3 Các Hằng Số & Enum

**Vai Trò (Roles):**

```
KHACH_HANG  (Customer)
NHAN_VIEN   (Staff)
QUAN_LY     (Manager)
```

**Loại Phòng (Room Types):**

```
PHONG_RIENG (Private room)
PHONG_CHUNG (Dorm/Shared room)
```

**Loại Mục Tiêu (Target Types):**

```
PHONG (Room - entire room)
GIUONG (Bed - single bed in shared room)
```

**Trạng Thái Phòng (Room Status):**

```
TRONG        (Empty)
SAP_DAY      (Nearly full)
DA_THUE_HET  (Fully booked)
DAY          (Full)
```

**Trạng Thái Yêu Cầu (Request Status):**

```
MOI_TAO           (Newly created)
DANG_GIU_CHO      (Holding/Reserved)
CHAP_NHAN         (Accepted)
TU_CHOI           (Rejected)
HUY               (Cancelled)
```

**Trạng Thái Hợp Đồng (Contract Status):**

```
HIEU_LUC   (Active/Valid)
HET_HAN    (Expired)
DINH_CHI   (Terminated)
```

**Trạng Thái Hoá Đơn (Invoice Status):**

```
CHO_THANH_TOAN      (Pending)
THANH_TOAN_PHAN_TRAM (Partially paid)
THANH_TOAN_TOAN_BO  (Fully paid)
THUA_TIEN           (Overpaid)
```

### 8.4 Đề Xuất Cải Thiện Hệ Thống

#### **Ngắn Hạn (1-2 tuần)**

1. ✅ Thêm Input Validation (Joi/Zod)
2. ✅ Implement proper error handling với đúng HTTP status codes
3. ✅ Add unit tests cho services
4. ✅ Thêm pagination cho list endpoints
5. ✅ Implement search & filter functionality

#### **Trung Hạn (1-2 tháng)**

1. ✅ Setup Supabase Auth thực tế (OAuth, Email/Password)
2. ✅ Implement RBAC (role-based access control)
3. ✅ Add file upload (ảnh phòng, tài liệu hợp đồng)
4. ✅ Implement email notifications (nodemailer)
5. ✅ Add logging & monitoring
6. ✅ Setup CI/CD pipeline (GitHub Actions)
7. ✅ Implement caching (Redis)

#### **Dài Hạn (2-3 tháng)**

1. ✅ Real-time updates (WebSocket hoặc Supabase Realtime)
2. ✅ Integration tests & E2E tests
3. ✅ Performance optimization & CDN
4. ✅ Multi-language support (i18n)
5. ✅ Admin dashboard với analytics
6. ✅ Mobile app (React Native)
7. ✅ Payment gateway integration (Stripe, VNPay)
8. ✅ Advanced reporting (PDF export, Excel)

### 8.5 Các Convention & Best Practices Đang Dùng

#### **Naming Convention**

- 🟢 Database: `snake_case` + tiếng Việt (ma_phong, ten_toa)
- 🟢 Backend JS: `camelCase` (getRoomList, createContract)
- 🟢 Frontend: `PascalCase` (HomePage, RoomCard)
- 🟢 URLs: `kebab-case` (/api/rental-requests, /rooms/:id)

#### **File Organization**

- Service-oriented structure (controllers → services → models)
- Separate concerns: routes, controllers, services, models
- UI components mỗi component 1 file

#### **Error Handling**

- Try-catch wrappers trong controllers
- Global error middleware
- Consistent error response format

#### **Code Style**

- Node version: 20+
- ES6+: const/let, arrow functions, destructuring
- Async/await (không .then())
- Middleware pattern

### 8.6 Cấu Trúc Response API

**Success Response:**

```json
{
  "success": true,
  "data": {
    /* actual data */
  },
  "message": "Operation successful",
  "timestamp": "2024-04-07T10:30:00Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Error description",
  "details": {
    /* additional info */
  },
  "timestamp": "2024-04-07T10:30:00Z"
}
```

### 8.7 Roadmap Tính Năng

```
Phase 1 (Current)
├── Room Listing
├── Basic Auth
├── Rental Requests
└── Contract Management

Phase 2
├── Payment Integration
├── Email Notifications
├── Admin Dashboard
└── Role-based Access

Phase 3
├── Real-time Features
├── Mobile App
├── Analytics
└── Advanced Reporting

Phase 4
├── Multi-language
├── AI Recommendations
├── Marketplace Features
└── Integration APIs
```

---

## 📋 Tóm Tắt

| Aspect             | Chi Tiết                                            |
| ------------------ | --------------------------------------------------- |
| **Project Name**   | DormStay - Hệ Thống Quản Lý Ký Túc Xá               |
| **Architecture**   | Layered MVC + Service Pattern                       |
| **Frontend Stack** | React 19 + Vite + Tailwind CSS 4                    |
| **Backend Stack**  | Node.js 20 + Express 5 + Supabase                   |
| **Database**       | PostgreSQL via Supabase (13 tables)                 |
| **Main Modules**   | Auth, Room, RentalRequest, Contract, Payment        |
| **Deployment**     | Vercel/Railway (backend), Netlify/Vercel (frontend) |
| **Status**         | MVP Stage - Initial Release Ready                   |

---

**Document Version**: 1.0
**Last Updated**: April 7, 2024
**Created By**: Senior Software Engineer & Technical Writer
**Language**: Vietnamese

---

_Tài liệu này cung cấp thông tin chi tiết về dự án DormStay. Để cập nhật mới nhất, vui lòng check GitHub repository._
