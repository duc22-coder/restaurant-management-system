# 🍽️ Restaurant Management System

<div align="center">

![Java](https://img.shields.io/badge/Java-17-orange.svg?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.x-brightgreen.svg?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-blue.svg?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38bdf8.svg?style=flat-square&logo=tailwindcss)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg?style=flat-square&logo=mysql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?style=flat-square&logo=docker)

**Hệ thống quản lý nhà hàng toàn diện: Quản lý đơn hàng, kho nguyên liệu, thực đơn, bàn ăn và thanh toán VietQR động.**

</div>

---

## 📌 Mục Lục
- [Công Nghệ Sử Dụng](#️-công-nghệ-sử-dụng)
- [Tính Năng Chính](#-tính-năng-chính)
- [Sơ Đồ ERD](#-sơ-đồ-thực-thể---liên-kết-erd)
- [Tài Khoản Mặc Định](#-tài-khoản-mặc-định)
- [Hướng Dẫn Khởi Chạy](#-hướng-dẫn-khởi-chạy)
- [Cổng & Địa Chỉ Dịch Vụ](#-cổng--địa-chỉ-dịch-vụ)
- [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)

---

## 🛠️ Công Nghệ Sử Dụng

| Phân hệ | Công nghệ chính |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, React Router v6, Axios, Lucide React |
| **Backend** | Java 17, Spring Boot 3.3.x (Spring Security, Spring Data JPA, Hibernate, JWT) |
| **Database** | MySQL 8.0 |
| **DevOps & Server** | Docker, Docker Compose, Nginx Alpine |

---

## 🌟 Tính Năng Chính

### 👤 Khách Hàng (Customer)

| Tính năng | Mô tả |
| :--- | :--- |
| Xem thực đơn | Xem danh sách món theo danh mục, tìm kiếm & lọc theo thời gian thực |
| Quét QR bàn | Tự động nhận diện bàn ăn qua tham số URL (`/menu?tableId=1`) |
| Ăn tại bàn *(Dine-in)* | Chọn bàn trên sơ đồ hoặc qua mã QR |
| Mang về *(Takeaway)* | Đặt trước đến lấy kèm số điện thoại liên hệ |
| Giao hàng *(Delivery)* | Giao hàng tận nơi theo địa chỉ cụ thể |
| Giỏ hàng & Ghi chú | Tùy chỉnh số lượng, ghi chú món ăn, áp dụng voucher |
| Thanh toán VietQR | Tự động sinh mã VietQR động theo đúng mã đơn hàng và số tiền |
| Theo dõi đơn | Tra cứu trạng thái đơn hàng theo thời gian thực |

### 👨‍🍳 Nhân Viên (Staff)

| Tính năng | Mô tả |
| :--- | :--- |
| Sơ đồ bàn trực quan | Theo dõi trạng thái bàn: `Trống` / `Có khách` / `Yêu cầu tính tiền` |
| Quy trình đơn bếp | Chuyển trạng thái đơn: `PENDING` → `PREPARING` → `READY` → `SERVED` |
| Thu ngân | Xác nhận thanh toán (Tiền mặt / VietQR / Chuyển khoản), giải phóng bàn |

### 🔧 Quản Trị Viên (Admin)

| Tính năng | Mô tả |
| :--- | :--- |
| Dashboard phân tích | Thống kê doanh thu, số đơn hàng, khách hàng mới theo ngày/tháng |
| Quản lý danh mục | Thêm, sửa, xóa danh mục món ăn |
| Quản lý thực đơn | Thêm món, cập nhật giá, hình ảnh, đổi trạng thái `Còn món` / `Hết món` |
| Quản lý bàn ăn | Thêm bàn, cấu hình số ghế, xuất link & mã QR đặt món |
| Quản lý người dùng | Quản lý tài khoản và phân quyền `ADMIN` / `STAFF` / `CUSTOMER` |
| Quản lý Voucher | Tạo mã giảm giá theo % hoặc số tiền cố định, đặt thời hạn hiệu lực |
| 📦 Kho nguyên liệu (SPCT) | Quản lý quy cách, đơn vị tính, tồn kho, định mức tối thiểu, cảnh báo sắp hết hàng |
| 🚚 Nhập hàng (ĐNP) | Lập phiếu nhập kho, duyệt nhập → tự động cộng tồn kho nguyên liệu |
| ⚖️ Định lượng công thức (TPSP) | Thiết lập nguyên liệu tiêu hao cho từng món ăn → hệ thống tự trừ kho khi nấu |
| Quản lý đơn hàng | Xem toàn bộ lịch sử đơn, lọc theo trạng thái và khoảng ngày |

---

## 📊 Sơ Đồ Thực Thể - Liên Kết (ERD)

Hệ thống được thiết kế khớp 100% theo sơ đồ ERD đề tài Quản Lý Nhà Hàng gồm **10 thực thể nghiệp vụ**:

| Ký hiệu ERD | Bảng Database | Ý nghĩa nghiệp vụ |
| :---: | :--- | :--- |
| **TK** | `users` | Tài khoản hệ thống: Admin, Nhân viên, Khách hàng |
| **Bàn** | `restaurant_tables` | Bàn ăn, sức chứa, trạng thái, link QR |
| **Loại món** | `categories` | Danh mục phân loại món ăn |
| **SP** | `menu_items` | Sản phẩm / Món ăn & Đồ uống trên thực đơn |
| **SPCT** | `product_details` | Nguyên liệu kho: đơn vị, tồn kho, mức tối thiểu |
| **TPSP** | `product_recipes` | Định lượng công thức: 1 suất món dùng bao nhiêu nguyên liệu |
| **Đơn** | `orders` | Đơn hàng bán ra (gắn khách hàng, bàn, nhân viên) |
| **CT ĐƠN** | `order_items` | Chi tiết các món trong từng đơn hàng bán |
| **ĐNP** | `purchase_orders` | Phiếu nhập kho từ nhà cung cấp |
| **CT ĐN** | `purchase_order_items` | Chi tiết nguyên liệu trong từng phiếu nhập |

### Luồng nghiệp vụ kho tự động:

```
[Nhập hàng]  Tạo ĐNP → Duyệt nhập → Tồn kho SPCT (+)
[Bán hàng]   Đặt món → Bếp xử lý  → Đọc TPSP  → Tồn kho SPCT (-)
```

---

## 🔑 Tài Khoản Mặc Định

Hệ thống tự động seed dữ liệu mẫu khi khởi chạy lần đầu:

| Vai trò | Tên đăng nhập | Mật khẩu | Đường dẫn | Quyền hạn |
| :---: | :---: | :---: | :--- | :--- |
| **Admin** | `admin` | `admin123` | `/admin/dashboard` | Quản trị toàn bộ hệ thống |
| **Staff** | `staff` | `staff123` | `/staff/dashboard` | Xử lý đơn, quản lý bàn, thu ngân |
| **Khách hàng** | *(Đăng ký tự do)* | — | `/menu` hoặc `/register` | Xem menu, đặt món, theo dõi đơn |

---

## 🚀 Hướng Dẫn Khởi Chạy

### Bước 0: Tạo file cấu hình môi trường

```bash
# Windows
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

> Có thể chỉnh sửa `.env` để thay đổi mật khẩu, cổng kết nối theo nhu cầu.

---

### Cách 1: Docker Compose *(Khuyên dùng)*

> **Yêu cầu**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã cài đặt và đang chạy.

```bash
# 1. Khởi chạy toàn bộ hệ thống (MySQL + Backend + Frontend)
docker compose up -d --build

# 2. Kiểm tra trạng thái các container
docker compose ps

# 3. Xem log backend (theo dõi quá trình khởi động)
docker compose logs -f backend

# 4. Dừng hệ thống khi không sử dụng
docker compose down
```

✅ Sau khi tất cả container `Healthy`, truy cập: **http://localhost:3000**

> **Lưu ý**: Lần đầu chạy backend cần ~30 giây để kết nối database và khởi tạo dữ liệu mẫu.

---

### Cách 2: Chạy thủ công (Local Development)

> **Yêu cầu**: JDK 17+, Maven 3.8+, Node.js 18+, MySQL 8.0.

**Bước 1 — Khởi động MySQL**
```bash
docker compose up -d mysqldb
```

**Bước 2 — Chạy Backend**
```bash
cd backend
mvn clean spring-boot:run
```
> API sẵn sàng tại: `http://localhost:8081`

**Bước 3 — Chạy Frontend**
```bash
cd frontend
npm install
npm run dev
```
> Giao diện mở tại: `http://localhost:5173`

---

## 🌐 Cổng & Địa Chỉ Dịch Vụ

| Dịch vụ | Docker Compose | Local Dev | Ghi chú |
| :--- | :---: | :---: | :--- |
| **Frontend Web** | http://localhost:3000 | http://localhost:5173 | React SPA (Nginx) |
| **Backend API** | http://localhost:8081 | http://localhost:8081 | Spring Boot REST API |
| **MySQL Database** | `localhost:3307` | `localhost:3307` | Database `restaurant_db` |

---

## 📁 Cấu Trúc Thư Mục

```
restaurant-management-system/
│
├── backend/                                  # Spring Boot REST API (Java 17)
│   ├── src/main/java/com/restaurant/
│   │   ├── config/                           # Security, JWT, CORS, DataInitializer
│   │   ├── controller/                       # REST Controllers (Admin, Staff, Auth...)
│   │   ├── dto/                              # Request / Response DTOs
│   │   ├── entity/                           # JPA Entities (12 bảng)
│   │   │   ├── User.java                     # TK  - Tài khoản
│   │   │   ├── RestaurantTable.java          # Bàn - Bàn ăn
│   │   │   ├── Category.java                 # Loại món
│   │   │   ├── MenuItem.java                 # SP  - Sản phẩm / Món ăn
│   │   │   ├── ProductDetail.java            # SPCT - Nguyên liệu / Kho
│   │   │   ├── ProductRecipe.java            # TPSP - Định lượng công thức
│   │   │   ├── Order.java                    # Đơn - Đơn hàng bán ra
│   │   │   ├── OrderItem.java                # CT Đơn
│   │   │   ├── PurchaseOrder.java            # ĐNP - Phiếu nhập kho
│   │   │   ├── PurchaseOrderItem.java        # CT Đơn nhập
│   │   │   ├── Voucher.java                  # Mã giảm giá
│   │   │   └── Payment.java                  # Thanh toán
│   │   ├── enums/                            # OrderStatus, OrderType, Role, TableStatus...
│   │   ├── repository/                       # Spring Data JPA Repositories
│   │   ├── security/                         # JWT Filter, UserDetailsService
│   │   └── service/impl/                     # Business Logic
│   ├── src/main/resources/
│   │   └── application.yml                   # Database, JWT, Server config
│   ├── Dockerfile                            # Multi-stage: Maven build → JRE runtime
│   └── pom.xml
│
├── frontend/                                 # React + Vite SPA
│   ├── src/
│   │   ├── api/                              # Axios client & interceptors
│   │   ├── context/                          # AuthContext, CartContext
│   │   ├── pages/
│   │   │   ├── admin/                        # Dashboard, Menu, Bàn, Kho, Nhập hàng, Công thức...
│   │   │   ├── staff/                        # Sơ đồ bàn, Đơn bếp, Thu ngân
│   │   │   ├── customer/                     # Thực đơn, Giỏ hàng, Đặt món, VietQR
│   │   │   └── auth/                         # Đăng nhập, Đăng ký
│   │   └── routes/                           # ProtectedRoute phân quyền theo role
│   ├── nginx.conf                            # Reverse proxy & SPA routing
│   ├── Dockerfile                            # Multi-stage: Node build → Nginx serve
│   └── package.json
│
├── docker-compose.yml                        # Điều phối 3 services: MySQL, Backend, Frontend
├── .env.example                              # Template biến môi trường
└── README.md
```

---

<div align="center">
  Made with ❤️ — Restaurant Management System
</div>