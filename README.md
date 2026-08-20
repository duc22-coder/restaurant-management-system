# Hệ Thống Web Quản Lý Nhà Hàng (Restaurant Management System)

Dự án Web App Quản lý nhà hàng phục vụ đồ án môn học / đồ án tốt nghiệp với quy trình tự động hóa:
`Khách quét QR Code` -> `Xem Menu` -> `Order món` -> `Nhân viên tiếp nhận & chế biến` -> `Thanh toán` -> `Giải phóng bàn & Cập nhật doanh thu`.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React, Vite, Tailwind CSS, React Router, Axios
- **Backend**: Java 17, Spring Boot 3.3.x, Spring Data JPA, Spring Security, JWT, Validation, Maven
- **Database**: MySQL 8.0
- **DevOps**: Docker, Docker Compose

---

## 🚀 Hướng Dẫn Khởi Chạy Project (Phase 1)

### Cách 1: Chạy bằng Docker Compose (Khuyên dùng)

1. Mở terminal tại thư mục gốc của dự án.
2. Khởi chạy tất cả dịch vụ với 1 câu lệnh duy nhất:
   ```bash
   docker compose up -d --build
   ```
3. Truy cập ứng dụng:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend Health Check**: [http://localhost:8080/api/health](http://localhost:8080/api/health)
   - **Database**: MySQL khả dụng tại `localhost:3306`

---

### Cách 2: Chạy Thủ Công (Local Development)

#### 1. Khởi động MySQL Container
```bash
docker compose up -d mysqldb
```

#### 2. Khởi động Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
Backend sẽ chạy tại: `http://localhost:8080`

#### 3. Khởi động Frontend (React Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend sẽ chạy tại: `http://localhost:5173`
