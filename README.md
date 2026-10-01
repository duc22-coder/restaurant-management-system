# 🍽️ Restaurant Management System

<div align="center">

![Java](https://img.shields.io/badge/Java-17-orange.svg?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.x-brightgreen.svg?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-blue.svg?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38bdf8.svg?style=flat-square&logo=tailwindcss)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg?style=flat-square&logo=mysql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?style=flat-square&logo=docker)

**Hệ thống quản lý và gọi món nhà hàng đa kênh (Ăn tại bàn, Mang về, Giao hàng) tích hợp thanh toán VietQR động.**

</div>

---

## 📌 Mục Lục
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Tính Năng Chính](#-tính-năng-chính)
- [Tài Khoản Mặc Định](#-tài-khoản-mặc-định)
- [Hướng Dẫn Khởi Chạy](#-hướng-dẫn-khởi-chạy)
  - [Cách 1: Khởi chạy bằng Docker Compose (Khuyên dùng)](#cách-1-docker-compose-khuyên-dùng)
  - [Cách 2: Khởi chạy thủ công (Local Development)](#cách-2-khởi-chạy-thủ-công-local-dev)
- [Cổng & Địa Chỉ Dịch Vụ](#-cổng--địa-chỉ-dịch-vụ)
- [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)

---

## 🛠️ Công Nghệ Sử Dụng

| Phân hệ | Công nghệ chính |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS, React Router v6, Axios, Lucide React |
| **Backend** | Java 17, Spring Boot 3.3.x (Spring Security, Spring Data JPA, Hibernate, JWT) |
| **Database** | MySQL 8.0 |
| **DevOps & Server**| Docker, Docker Compose, Nginx Alpine |

---

## 🌟 Tính Năng Chính

### 1. Khách Hàng (Customer)
- **Xem thực đơn & Tìm kiếm**: Xem danh sách món theo danh mục, tìm kiếm và lọc theo thời gian thực.
- **Quét mã QR bàn**: Tự động nhận diện bàn ăn qua tham số URL (ví dụ: `/menu?tableId=1`).
- **3 Hình thức đặt món**:
  - 🍽️ *Ăn tại bàn (Dine-in)*: Chọn bàn trên sơ đồ hoặc qua mã QR.
  - 🛍️ *Mang về (Takeaway)*: Đặt trước đến lấy kèm số điện thoại liên hệ.
  - 🛵 *Giao tận nơi (Delivery)*: Giao hàng tận nơi theo địa chỉ.
- **Giỏ hàng & Ghi chú**: Tùy chỉnh số lượng, ghi chú món ăn (ít cay, không đường,...), áp dụng voucher.
- **Thanh toán VietQR**: Tự động sinh mã VietQR động theo đúng mã đơn hàng và số tiền cần thanh toán.

### 2. Nhân Viên (Staff)
- **Sơ đồ bàn trực quan**: Theo dõi trạng thái từng bàn (`Trống`, `Có khách`, `Yêu cầu tính tiền`).
- **Quy trình đơn bếp**: Tiếp nhận và chuyển đổi trạng thái đơn: `PENDING` ➔ `PREPARING` ➔ `READY` ➔ `SERVED`.
- **Thanh toán & Thu ngân**: Xác nhận thanh toán (Tiền mặt, VietQR, Chuyển khoản) và giải phóng bàn ăn.

### 3. Quản Trị Viên (Admin)
- **Dashboard phân tích**: Thống kê doanh thu, số lượng đơn hàng, số khách hàng mới.
- **Quản lý danh mục & món ăn**: Thêm, sửa, đổi trạng thái (`Còn món` / `Hết món`), cập nhật giá và hình ảnh.
- **Quản lý bàn ăn**: Thêm bàn, cấu hình số ghế, tự động xuất liên kết và mã QR đặt món.
- **Quản lý người dùng**: Quản lý tài khoản và phân quyền (`ADMIN`, `STAFF`, `CUSTOMER`).
- **Quản lý Voucher**: Tạo và quản lý mã giảm giá theo phần trăm (%) hoặc số tiền cố định.
- 📦 **Quản lý Kho & SPCT (Sản Phẩm Chi Tiết)**: Quản lý quy cách chi tiết, đơn vị tính, số lượng tồn kho, định mức tồn tối thiểu, cảnh báo sắp hết hàng.
- 🚚 **Quản lý Nhập Hàng (Đơn Nhập & CT Đơn Nhập)**: Lập phiếu nhập kho từ nhà cung cấp, chi tiết các mặt hàng nhập với số lượng & đơn giá; duyệt nhập kho tự động cộng dồn tồn kho SPCT.
- ⚖️ **Định Lượng Món Ăn (TPSP - Thành Phần Sản Phẩm)**: Thiết lập công thức chế biến (1 suất món ăn tiêu hao bao nhiêu nguyên liệu trong kho); hệ thống tự động trừ kho nguyên liệu khi bếp chế biến đơn.

---

## 📊 Sơ Đồ Thực Thể - Liên Kết (ERD Chuẩn)

Hệ thống được thiết kế khớp 100% theo sơ đồ ERD đề tài Quản Lý Nhà Hàng:

| Ký hiệu ERD | Tên Bảng (Database) | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- |
| **TK** | `users` | Tài khoản hệ thống (Admin, Nhân viên, Khách hàng) |
| **Bàn** | `restaurant_tables` | Bàn ăn, sức chứa, trạng thái bàn, mã QR |
| **Loại món** | `categories` | Phân loại / Danh mục món ăn |
| **SP** | `menu_items` | Sản phẩm / Món ăn & Đồ uống trên thực đơn |
| **SPCT** | `product_details` | Sản phẩm chi tiết / Biến thể & Quản lý tồn kho |
| **TPSP** | `product_recipes` | Thành phần sản phẩm / Định lượng công thức tiêu hao |
| **Đơn** | `orders` | Đơn hàng bán ra (gắn với Khách hàng, Bàn, Nhân viên) |
| **CT ĐƠN** | `order_items` | Chi tiết các món ăn trong từng đơn hàng bán |
| **ĐNP** | `purchase_orders` | Đơn nhập hàng / Phiếu nhập kho từ nhà cung cấp |
| **CT ĐN** | `purchase_order_items` | Chi tiết các mặt hàng SPCT trong từng đợt nhập kho |

---

## 🔑 Tài Khoản Mặc Định

Hệ thống tự động khởi tạo dữ liệu mẫu khi chạy lần đầu:

| Vai trò | Tài khoản | Mật khẩu | Đường dẫn truy cập | Quyền hạn |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | `/admin/dashboard` | Quản trị toàn bộ hệ thống |
| **Staff** | `staff` | `staff123` | `/staff/dashboard` | Tiếp nhận đơn, đổi trạng thái món, quản lý bàn |
| **Khách hàng** | *(Tự do / Đăng ký)* | - | `/menu` hoặc `/register` | Xem menu, đặt món, theo dõi đơn |

---

## 🚀 Hướng Dẫn Khởi Chạy

### Chuẩn bị file cấu hình môi trường
Trước khi khởi chạy, tạo file `.env` từ file mẫu:
```bash
cp .env.example .env
```

---

### Cách 1: Docker Compose (Khuyên dùng)
> **Yêu cầu**: Đã cài đặt [Docker Desktop](https://www.docker.com/).

```bash
# 1. Khởi chạy toàn bộ hệ thống (MySQL + Backend + Frontend)
docker compose up -d --build

# 2. Kiểm tra trạng thái các container
docker compose ps

# 3. Dừng hệ thống khi không sử dụng
docker compose down
```

---

### Cách 2: Khởi chạy thủ công (Local Dev)
> **Yêu cầu**: JDK 17+, Node.js 18+, Maven, MySQL 8.0 (cổng 3307).

**Bước 1: Bật Database MySQL**
```bash
# Bật nhanh MySQL bằng Docker
docker compose up -d mysqldb
```

**Bước 2: Chạy Backend (Spring Boot)**
```bash
cd backend
mvn clean spring-boot:run
```
*API khởi chạy tại: `http://localhost:8081`*

**Bước 3: Chạy Frontend (React Vite)**
```bash
cd frontend
npm install
npm run dev
```
*Giao diện mở tại: `http://localhost:5173`*

---

## 🌐 Cổng & Địa Chỉ Dịch Vụ

| Dịch vụ | Chạy qua Docker | Chạy Local Dev | Mô tả |
| :--- | :--- | :--- | :--- |
| **Frontend Web** | [http://localhost:3000](http://localhost:3000) | [http://localhost:5173](http://localhost:5173) | Giao diện React SPA |
| **Backend API** | [http://localhost:8081](http://localhost:8081) | [http://localhost:8081](http://localhost:8081) | Spring Boot REST API |
| **MySQL Database**| `localhost:3307` | `localhost:3307` | Database `restaurant_db` |

---

## 📁 Cấu Trúc Thư Mục

```text
restaurant-management-system/
├── backend/                              # Spring Boot REST API (Java 17)
│   ├── src/main/java/com/restaurant/
│   │   ├── config/                      # Cấu hình Security, JWT, CORS, DataInitializer
│   │   ├── controller/                  # REST API Controllers (Admin, Staff, Customer, Auth)
│   │   ├── dto/                         # Data Transfer Objects (Request/Response)
│   │   ├── entity/                      # JPA Entities (User, Order, MenuItem, Table, ...)
│   │   ├── repository/                  # Spring Data JPA Repositories
│   │   └── service/                     # Xử lý nghiệp vụ (Business Logic)
│   ├── src/main/resources/
│   │   └── application.yml              # Cấu hình Database, JWT, VietQR
│   ├── Dockerfile                       # Multi-stage build cho Spring Boot
│   └── pom.xml                          # Quản lý thư viện Maven
│
├── frontend/                             # React Vite SPA (Tailwind CSS)
│   ├── src/
│   │   ├── api/                         # Cấu hình Axios client & Interceptors
│   │   ├── context/                     # Quản lý state (AuthContext, CartContext)
│   │   ├── pages/                       # Giao diện Khách hàng, Nhân viên, Admin, Auth
│   │   └── routes/                      # Định tuyến và bảo vệ Route (ProtectedRoute)
│   ├── nginx.conf                       # Cấu hình Nginx reverse proxy & SPA routing
│   ├── Dockerfile                       # Multi-stage build Nginx phục vụ Frontend
│   └── package.json
│
├── docker-compose.yml                    # Điều phối MySQL, Backend, Frontend
├── .env.example                          # File mẫu biến môi trường
└── README.md
```
