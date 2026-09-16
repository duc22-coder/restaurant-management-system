# Hệ Thống Quản Lý & Đặt Món Nhà Hàng (Restaurant Management System)

Dự án Web App Quản lý nhà hàng hiện đại với giao diện Website chuẩn **Desktop & Mobile Responsive**, phục vụ quy trình gọi món và vận hành nhà hàng toàn diện:
- **Khách Hàng**: Truy cập trực tiếp Website xem toàn bộ thực đơn ngay lập tức (không bắt buộc quét QR), tìm kiếm & lọc món, chọn bàn linh hoạt hoặc đặt mang về/giao tận nơi, giỏ hàng trượt cao cấp, thanh toán chuyển khoản VietQR và theo dõi đơn thời gian thực.
- **Nhân Viên (Staff)**: Tiếp nhận đơn gọi món tại các bàn theo thời gian thực, chuyển trạng thái chế biến -> hoàn tất, quản lý trạng thái bàn ăn và xác nhận thanh toán.
- **Quản Lý (Admin)**: Dashboard thống kê doanh thu, quản lý danh mục, thực đơn món ăn, quản lý bàn ăn, người dùng và các chương trình khuyến mãi (Vouchers).

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons
- **Backend**: Java 17, Spring Boot 3.3.x, Spring Data JPA, Spring Security, JWT, Lombok, Maven
- **Database**: MySQL 8.0
- **Thanh toán**: Tích hợp mã VietQR động theo đơn hàng
- **DevOps**: Docker, Docker Compose

---

## 🌟 Các Tính Năng Trọng Tâm

### 1. Phân Hệ Khách Hàng (Customer Web)
- **Truy cập tự do**: Vào thẳng trang chủ xem ngay toàn bộ danh mục & món ăn dạng lưới (Grid) 4 cột màn hình rộng, không cần quét mã QR mới xem được.
- **Hỗ trợ QR Code bàn**: Quét QR bàn ăn (`/menu?tableId=X`) vẫn tự động nhận diện và gán đúng bàn.
- **Đa dạng hình thức đặt món**:
  - 🍽️ **Ăn Tại Bàn**: Tự chọn bàn từ sơ đồ bàn (B01 -> B08) hoặc nhận diện từ QR.
  - 🛍️ **Đến Lấy (Takeaway)**: Đặt trước mang về, chỉ cần số điện thoại.
  - 🛵 **Giao Tận Nơi (Delivery)**: Nhập địa chỉ và số điện thoại giao hàng.
- **Giỏ hàng Slide-Over**: Panel giỏ hàng trượt mượt mà từ cạnh phải, thêm ghi chú riêng từng món hoặc ghi chú toàn đơn cho nhà bếp.
- **Thanh toán & Theo dõi đơn**: Gửi yêu cầu tính tiền tại bàn, tạo mã VietQR chuyển khoản ngân hàng tự động, theo dõi tiến độ đơn hàng tự làm mới mỗi 8 giây.

### 2. Phân Hệ Nhân Viên (Staff Dashboard)
- Sơ đồ trực quan trạng thái bàn ăn (Trống / Có khách / Đang yêu cầu tính tiền).
- Tiếp nhận đơn hàng theo thời gian thực: `Đã Nhận` -> `Đang Chế Biến` -> `Đã Lên Bàn` -> `Đã Thanh Toán`.
- Xử lý yêu cầu thanh toán và giải phóng bàn.

### 3. Phân Hệ Quản Trị (Admin Dashboard)
- Thống kê doanh thu, đơn hàng, khách hàng.
- Quản lý danh mục món ăn (Thêm/Sửa/Xóa, ảnh danh mục).
- Quản lý thực đơn (Món ăn, giá bán, mô tả, hình ảnh, bật/tắt trạng thái Còn món / Tạm hết).
- Quản lý bàn ăn và tạo mã QR Code cho từng bàn.
- Quản lý tài khoản người dùng và phân quyền (Admin, Staff, Customer).
- Quản lý mã giảm giá (Vouchers).

---

## 🔑 Tài Khoản Mặc Định (Hệ thống tự tạo)

| Vai trò | Tên đăng nhập | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên** | `admin` | `admin123` | Toàn quyền quản trị hệ thống (`/admin/dashboard`) |
| **Nhân viên phục vụ** | `staff` | `staff123` | Nhận đơn, chế biến, quản lý bàn (`/staff/dashboard`) |
| **Khách hàng** | Tự do xem món & đặt món | - | Đăng ký tài khoản tại `/register` để lưu lịch sử |

---

## 🚀 Hướng Dẫn Khởi Chạy Project

### Cách 1: Chạy bằng Docker Compose (Khuyên dùng)

> **Yêu cầu**: Đã bật ứng dụng Docker Desktop.

1. Mở terminal tại thư mục gốc dự án (`d:\Luucode\banhang`):
   ```bash
   docker compose up -d --build
   ```
2. Truy cập ứng dụng:
   - **Giao diện Web Khách Hàng**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8081/api](http://localhost:8081/api)
   - **Database MySQL**: cổng `3307`
3. Dừng ứng dụng:
   ```bash
   docker compose down
   ```

---

### Cách 2: Chạy Thủ Công (Local Development)

#### Bước 1: Khởi động Database MySQL
Chạy container MySQL riêng qua Docker:
```bash
docker compose up -d mysqldb
```
*(MySQL sẽ chạy tại cổng `3307`, user: `restaurant_user`, password: `restaurant_password`, database: `restaurant_db`)*.

#### Bước 2: Khởi động Backend (Spring Boot)
Mở terminal thư mục backend:
```bash
cd backend
mvn spring-boot:run
```
- Backend sẽ chạy tại: **`http://localhost:8081`**
- Hệ thống tự động tạo bảng dữ liệu và nạp sẵn dữ liệu mẫu (món ăn, danh mục, bàn, tài khoản).

#### Bước 3: Khởi động Frontend (React Vite)
Mở terminal thư mục frontend:
```bash
cd frontend
npm install
npm run dev
```
- Frontend sẽ chạy tại: **`http://localhost:5173`**
- Vite đã cấu hình proxy tự động chuyển tiếp request `/api` sang backend port `8081`.

---

## 📁 Cấu Trúc Thư Mục

```text
banhang/
├── backend/                  # Mã nguồn Spring Boot Backend
│   ├── src/main/java/com/restaurant/
│   │   ├── config/          # Cấu hình Security, JWT, CORS, DataInitializer
│   │   ├── controller/      # REST API Controllers (Customer, Staff, Admin, Auth)
│   │   ├── dto/             # Request & Response DTOs
│   │   ├── entity/          # JPA Entities (User, MenuItem, Order, Table, ...)
│   │   ├── repository/      # Spring Data JPA Repositories
│   │   └── service/         # Business Logic Services
│   └── pom.xml
│
├── frontend/                 # Mã nguồn React Vite Frontend
│   ├── src/
│   │   ├── api/             # Cấu hình Axios Client & Interceptors
│   │   ├── context/         # AuthContext, CartContext
│   │   ├── pages/
│   │   │   ├── customer/    # Trang thực đơn web rộng, tài khoản, đăng ký
│   │   │   ├── staff/       # Dashboard phục vụ & nhận đơn
│   │   │   ├── admin/       # Dashboard & quản trị danh mục, menu, bàn, users
│   │   │   └── auth/        # Trang đăng nhập
│   │   └── routes/          # Cấu hình định tuyến & phân quyền ProtectedRoute
│   └── package.json
│
├── docker-compose.yml        # Điều phối Docker (MySQL, Backend, Frontend)
└── .env                      # Cấu hình biến môi trường
```
