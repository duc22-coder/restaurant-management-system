# 🍽️ Hệ Thống Quản Lý & Đặt Món Nhà Hàng (Restaurant Management System)

<div align="center">

![Java](https://img.shields.io/badge/Java-17-orange.svg?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.x-brightgreen.svg?style=for-the-badge&logo=springboot)
![React](https://img.shields.io/badge/React-18-blue.svg?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38bdf8.svg?style=for-the-badge&logo=tailwindcss)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg?style=for-the-badge&logo=mysql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?style=for-the-badge&logo=docker)

**Giải pháp chuyển đổi số toàn diện cho nhà hàng & quán ăn hiện đại:**
*Hỗ trợ đa kênh gọi món (Tại bàn, Mang về, Giao hàng) • Tích hợp VietQR động • Quản lý vận hành Bếp & Phục vụ • Báo cáo doanh thu thời gian thực.*

</div>

---

## 📌 Mục Lục
- [Giới Thiệu Hệ Thống](#-giới-thiệu-hệ-thống)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Tính Năng Nổi Bật](#-tính-năng-nổi-bật)
  - [1. Phân Hệ Khách Hàng (Customer)](#1-phân-hệ-khách-hàng-customer)
  - [2. Phân Hệ Nhân Viên Phục Vụ (Staff)](#2-phân-hệ-nhân-viên-phục-vụ-staff)
  - [3. Phân Hệ Quản Trị Viên (Admin)](#3-phân-hệ-quản-trị-viên-admin)
- [Tài Khoản Mặc Định](#-tài-khoản-mặc-định)
- [Hướng Dẫn Cài Đặt & Khởi Chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
  - [Cách 1: Khởi chạy bằng Docker Compose (Khuyên dùng)](#cách-1-khởi-chạy-bằng-docker-compose-khuyên-dùng)
  - [Cách 2: Khởi chạy thủ công (Local Development)](#cách-2-khởi-chạy-thủ-công-local-development)
- [Danh Sách Cổng & Địa Chỉ Dịch Vụ](#-danh-sách-cổng--địa-chỉ-dịch-vụ)
- [Cấu Trúc Thư Mục Dự Án](#-cấu-trúc-thư-mục-dự-án)
- [Một Số Lỗi Thường Gặp & Cách Xử Lý](#-một-số-lỗi-thường-gặp--cách-xử-lý)

---

## 📖 Giới Thiệu Hệ Thống

Hệ thống được thiết kế theo mô hình kiến trúc phân tầng (Client - Server) hiện đại, chuẩn **Responsive** mượt mà trên cả máy tính bàn (Desktop), máy tính bảng (Tablet) và điện thoại thông minh (Mobile):

1. **Khách hàng**: Trải nghiệm thực đơn trực quan, tìm kiếm & lọc theo danh mục, chọn phương thức nhận món (Ăn tại bàn, Đến lấy, Giao hàng), gửi ghi chú trực tiếp cho đầu bếp, thanh toán qua mã chuyển khoản VietQR tự động.
2. **Nhân viên (Staff/Kitchen)**: Nhận thông báo đơn món tức thì, theo dõi trạng thái món qua quy trình `Chờ xử lý` ➔ `Đang chế biến` ➔ `Đã lên món` ➔ `Đã thanh toán`, quản lý trạng thái bàn ăn.
3. **Quản lý (Admin)**: Thống kê doanh thu, đơn hàng, khách hàng; quản lý danh mục, món ăn, bàn ăn, tài khoản nhân viên và mã giảm giá (Vouchers).

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **Framework & Build tool**: React 18, Vite
- **Styling**: Tailwind CSS, Lucide Icons, Modern Glassmorphism & Micro-animations
- **Routing & State**: React Router v6, React Context API (`AuthContext`, `CartContext`)
- **HTTP Client**: Axios (Cấu hình Interceptor tự động đính kèm JWT và xử lý Token hết hạn)

### Backend
- **Core Framework**: Java 17, Spring Boot 3.3.x
- **Bảo mật & Phân quyền**: Spring Security, JSON Web Token (JWT)
- **Truy xuất dữ liệu**: Spring Data JPA / Hibernate
- **Database Migration & Seeding**: Tự động sinh bảng và nạp dữ liệu mẫu ban đầu (`DataInitializer`)
- **Build tool**: Apache Maven

### Cơ Sở Dữ Liệu & DevOps
- **Database**: MySQL 8.0 (Hỗ trợ cấu hình UTF-8mb4 chuẩn tiếng Việt)
- **Containerization**: Docker, Dockerfile đa tầng (Multi-stage build), Docker Compose
- **Web Server**: Nginx Alpine làm Reverse Proxy và SPA Server

---

## 🌟 Tính Năng Nổi Bật

### 1. Phân Hệ Khách Hàng (Customer)
- 🌐 **Duyệt Menu Trực Tiếp**: Xem toàn bộ thực đơn ngay trên trang chủ dạng lưới hiện đại, có hỗ trợ tìm kiếm theo tên và lọc theo từng danh mục.
- 📱 **Hỗ Trợ Quét Mã QR Bàn**: Truy cập qua URL kèm tham số bàn (ví dụ: `/menu?tableId=1`) sẽ tự động nhận diện và gán đúng bàn ăn.
- 🔄 **3 Hình Thức Đặt Món Linh Hoạt**:
  - 🍽️ **Ăn Tại Bàn (Dine-in)**: Chọn bàn trực tiếp trên sơ đồ bàn (B01 ➔ B08) hoặc nhận diện từ mã QR.
  - 🛍️ **Đến Lấy (Takeaway / Pickup)**: Đặt trước mang về, chỉ cần nhập số điện thoại liên hệ.
  - 🛵 **Giao Tận Nơi (Delivery)**: Đặt hàng giao tận nơi, nhập địa chỉ nhận hàng và số điện thoại.
- 🛒 **Giỏ Hàng Slide-Over Cao Cấp**: Panel trượt từ cạnh phải mượt mà, thêm ghi chú chi tiết cho từng món (ví dụ: *ít đường, không cay*) hoặc ghi chú đơn hàng.
- 💳 **Thanh Toán VietQR Động**: Tạo mã QR thanh toán ngân hàng có sẵn số tiền và nội dung chuyển khoản theo đúng mã đơn hàng.
- ⏱️ **Theo Dõi Tiến Độ Đơn Thời Gian Thực**: Tự động đồng bộ và hiển thị quy trình chế biến món ăn.

### 2. Phân Hệ Nhân Viên Phục Vụ (Staff)
- 🗺️ **Sơ Đồ Bàn Trực Quan**: Phân biệt rõ trạng thái bàn: `Trống (Xanh)`, `Có khách (Cam)`, `Yêu cầu tính tiền (Đỏ)`.
- 📋 **Quản Lý & Tiếp Nhận Đơn Món**:
  - Nhận đơn gọi món mới theo thời gian thực.
  - Chuyển trạng thái quy trình: `PENDING` (Chờ xử lý) ➔ `PREPARING` (Đang chế biến) ➔ `READY` (Đã xong) ➔ `SERVED` (Đã lên bàn).
- 💵 **Xác Nhận Thanh Toán & Giải Phóng Bàn**: Hỗ trợ nhiều hình thức thanh toán (Tiền mặt, VietQR, Chuyển khoản), giải phóng bàn để đón khách mới.

### 3. Phân Hệ Quản Trị Viên (Admin)
- 📊 **Dashboard Thống Kê**: Tổng doanh thu, số lượng đơn hàng, số khách hàng mới, biểu đồ phân tích.
- 📂 **Quản Lý Danh Mục**: Thêm, sửa, xóa, tải ảnh đại diện cho các nhóm món ăn (Khai vị, Món chính, Tráng miệng, Đồ uống,...).
- 🍲 **Quản Lý Thực Đơn (Menu)**: Thêm mới món ăn, giá tiền, mô tả chi tiết, hình ảnh, chuyển đổi trạng thái `Còn món` / `Hết món`.
- 🪑 **Quản Lý Bàn Ăn**: Tạo sơ đồ bàn, tùy chỉnh sức chứa và tự động xuất mã QR Code cho từng bàn.
- 👥 **Quản Lý Người Dùng**: Quản lý danh sách tài khoản, phân quyền vai trò (`ADMIN`, `STAFF`, `CUSTOMER`).
- 🎟️ **Quản Lý Khuyến Mãi (Vouchers)**: Tạo mã giảm giá theo tỷ lệ phần trăm (%) hoặc số tiền cố định, thời hạn áp dụng.

---

## 🔑 Tài Khoản Mặc Định

Hệ thống tự động khởi tạo các tài khoản mẫu khi khởi chạy lần đầu:

| Phân quyền | Tài khoản | Mật khẩu | Trang quản lý | Quyền hạn chính |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin` | `admin123` | `/admin/dashboard` | Toàn quyền kiểm soát và cấu hình hệ thống |
| **Nhân viên (Staff)** | `staff` | `staff123` | `/staff/dashboard` | Nhận đơn, đổi trạng thái món, quản lý bàn |
| **Khách hàng** | Tự do gọi món | - | `/menu` | Xem menu, đặt món, đăng ký tài khoản tại `/register` |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Cách 1: Khởi chạy bằng Docker Compose (Khuyên dùng)

> **Yêu cầu**: Máy đã cài đặt và đang bật **Docker Desktop**.

1. **Mở Terminal/PowerShell tại thư mục gốc dự án** (`banhang`):
   ```bash
   # Build và khởi chạy toàn bộ các containers ở chế độ chạy nền
   docker compose up -d --build
   ```

2. **Kiểm tra trạng thái các container**:
   ```bash
   docker compose ps
   ```
   *(Đảm bảo cả 3 dịch vụ `restaurant_mysql`, `restaurant_backend`, `restaurant_frontend` đều ở trạng thái `Up` hoặc `healthy`)*.

3. **Truy cập ứng dụng**:
   - 🌐 **Trang Web Khách Hàng**: [http://localhost:3000](http://localhost:3000)
   - ⚙️ **Backend API**: [http://localhost:8081/api](http://localhost:8081/api)

4. **Dừng hệ thống**:
   ```bash
   docker compose down
   ```

---

### Cách 2: Khởi chạy thủ công (Local Development)

> **Yêu cầu**: 
> - Java Development Kit (JDK 17+)
> - Node.js (v18+) & npm
> - Maven (hoặc dùng `./mvnw`)
> - Docker (để chạy MySQL) hoặc MySQL 8.0 cài sẵn trên máy

#### Bước 1: Khởi động cơ sở dữ liệu MySQL
Sử dụng Docker để khởi chạy MySQL nhanh:
```bash
docker compose up -d mysqldb
```
*(MySQL sẽ chạy tại cổng `3307`, user: `restaurant_user`, password: `restaurant_password`, database: `restaurant_db`)*.

#### Bước 2: Khởi chạy Backend (Spring Boot)
```bash
cd backend
mvn clean spring-boot:run
```
- Backend sẽ khởi chạy tại: **`http://localhost:8081`**
- Hibernate sẽ tự động tạo bảng và nạp dữ liệu mẫu ban đầu.

#### Bước 3: Khởi chạy Frontend (React Vite)
Mở một cửa sổ Terminal mới:
```bash
cd frontend
npm install
npm run dev
```
- Giao diện Frontend sẽ khởi chạy tại: **`http://localhost:5173`**

---

## 🌐 Danh Sách Cổng & Địa Chỉ Dịch Vụ

| Dịch vụ | Môi trường Docker | Môi trường Local Dev | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Frontend Web** | `http://localhost:3000` | `http://localhost:5173` | Giao diện React SPA |
| **Backend API** | `http://localhost:8081` | `http://localhost:8081` | Spring Boot REST API |
| **MySQL Database** | `localhost:3307` | `localhost:3307` | Database `restaurant_db` |

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
banhang/
├── backend/                              # Mã nguồn Spring Boot REST API
│   ├── src/main/java/com/restaurant/
│   │   ├── config/                      # Cấu hình Security, JWT, CORS, DataInitializer
│   │   ├── controller/                  # REST Controllers (Auth, Customer, Staff, Admin)
│   │   ├── dto/                         # Request & Response Data Transfer Objects
│   │   ├── entity/                      # JPA Entities (User, MenuItem, Order, Table, ...)
│   │   ├── repository/                  # Spring Data JPA Repositories
│   │   ├── security/                    # JWT Filters, UserDetails & Authentication
│   │   └── service/                     # Xử lý nghiệp vụ (Business Logic)
│   ├── src/main/resources/
│   │   └── application.yml              # File cấu hình backend (Port 8081, DB, JWT, VietQR)
│   ├── Dockerfile                       # Multi-stage Docker build cho Backend
│   └── pom.xml                          # Maven dependencies
│
├── frontend/                             # Mã nguồn React Vite Frontend
│   ├── src/
│   │   ├── api/                         # Cấu hình Axios Client & Interceptor
│   │   ├── assets/                      # Hình ảnh & icons tĩnh
│   │   ├── components/                  # Các UI components dùng chung (Navbar, Modal, ...)
│   │   ├── context/                     # Quản lý State toàn cục (AuthContext, CartContext)
│   │   ├── pages/
│   │   │   ├── admin/                   # Trang quản trị (Dashboard, Menu, Bàn, Khuyến mãi)
│   │   │   ├── auth/                    # Trang đăng nhập & đăng ký
│   │   │   ├── customer/                # Trang xem menu, đặt món, chọn bàn, giỏ hàng
│   │   │   └── staff/                   # Trang tiếp nhận đơn và phục vụ bàn
│   │   └── routes/                      # Điều hướng trang & bảo vệ Route (ProtectedRoute)
│   ├── nginx.conf                       # Cấu hình Nginx reverse proxy & SPA routing
│   ├── Dockerfile                       # Multi-stage Docker build (Node build -> Nginx serve)
│   ├── tailwind.config.js               # Cấu hình giao diện Tailwind CSS
│   └── vite.config.js                   # Cấu hình Vite & Proxy /api
│
├── docker-compose.yml                    # File điều phối Docker (MySQL, Backend, Frontend)
├── .env                                  # Biến môi trường hệ thống
└── README.md                             # Tài liệu hướng dẫn dự án
```

---

## 🔧 Một Số Lỗi Thường Gặp & Cách Xử Lý

### 1. Không kết nối được Backend / Frontend khi chạy Docker
- Đảm bảo các port `3000`, `8081`, `3307` trên máy bạn không bị chiếm dụng bởi ứng dụng khác.
- Chạy lệnh sau để build lại từ đầu không dùng cache:
  ```bash
  docker compose down
  docker compose up -d --build
  ```

### 2. Lỗi 404 khi F5 (Refresh) trang trên giao diện Docker
- Đã được giải quyết bằng file [frontend/nginx.conf](file:///d:/Luucode/banhang/frontend/nginx.conf) với lệnh `try_files $uri $uri/ /index.html;`.

### 3. Đổi thông tin tài khoản ngân hàng nhận tiền VietQR
- Mở file `.env` hoặc [backend/src/main/resources/application.yml](file:///d:/Luucode/banhang/backend/src/main/resources/application.yml) và chỉnh sửa các tham số:
  - `BANK_BIN`: Mã định danh ngân hàng (Ví dụ: `970436` là Vietcombank).
  - `BANK_ACCOUNT_NUMBER`: Số tài khoản ngân hàng nhận tiền.
  - `BANK_ACCOUNT_NAME`: Tên chủ tài khoản ngân hàng (viết hoa không dấu).

---

<div align="center">
  <sub>Phát triển và tối ưu cho quy trình vận hành nhà hàng hiện đại.</sub>
</div>
