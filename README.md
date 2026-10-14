# Restaurant Management System

Hệ thống quản lý nhà hàng gồm giao diện khách hàng, màn hình vận hành cho nhân viên và khu vực quản trị. Ứng dụng hỗ trợ đặt bàn theo khung giờ, gọi món, xử lý đơn, quản lý kho và thanh toán VietQR.

## Công nghệ

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios.
- **Backend:** Java 17, Spring Boot 3, Spring Security, JWT, Spring Data JPA.
- **Database:** MySQL 8, Flyway migrations, Hibernate schema validation.
- **Triển khai:** Docker Compose, Nginx, Caddy tự cấp TLS cho production.

## Luồng sử dụng

### Khách hàng

1. Xem thực đơn và tình trạng món.
2. Đăng nhập để đặt bàn theo ngày, khung giờ và số khách; một tài khoản chỉ có một lượt đặt bàn đang hiệu lực.
3. Khi đến nhà hàng, nhân viên xác nhận khách đã tới; khách có thể gọi món gắn với bàn.
4. Theo dõi đơn, áp dụng voucher và thanh toán theo số tiền sau giảm giá.

### Nhân viên

- Xem tình trạng bàn và danh sách đặt bàn.
- Xác nhận khách đến, hỗ trợ gọi món cho bàn đã nhận khách.
- Chuyển đơn qua các bước bếp/phục vụ, tạo yêu cầu tính tiền và xác nhận thanh toán.
- Sau khi thanh toán, bàn được giải phóng theo trạng thái đơn.

### Quản trị viên

- Quản lý thực đơn, danh mục, bàn, tài khoản và voucher.
- Quản lý nguyên liệu, tồn kho, công thức món và phiếu nhập.
- Theo dõi đơn hàng và số liệu hoạt động.

## Chạy local bằng Docker

Yêu cầu Docker Desktop hoặc Docker Engine có Compose plugin.

1. Tạo file môi trường:

   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env

   # Linux/macOS
   cp .env.example .env
   ```

2. Trong `.env`, thay tất cả giá trị `REPLACE_...` bằng giá trị riêng. Không dùng cấu hình mẫu cho production.
3. Build và chạy:

   ```bash
   docker compose up --build -d
   docker compose ps
   docker compose logs -f backend
   ```

4. Mở [http://localhost:3000](http://localhost:3000). Dừng các container bằng `docker compose down`.

Profile local là `dev` và tạo dữ liệu demo khi cần. Nếu database local đã có dữ liệu, ứng dụng giữ dữ liệu đó. Để chạy backend trực tiếp, cần JDK 17, Maven, Node.js và MySQL 8; cấu hình các biến môi trường trong `.env` trước khi chạy.

## Production bằng Docker Compose và HTTPS

Production cần máy chủ Linux/Docker, domain có DNS trỏ tới máy chủ, mở cổng TCP 80/443 và UDP 443 nếu dùng HTTP/3. MySQL nên nằm trong mạng riêng hoặc dịch vụ database riêng, không mở cổng database ra Internet.

1. Tạo `.env.production` từ `.env.example` và thay mọi giá trị mẫu bằng secrets riêng. Tạo JWT secret bằng `openssl rand -hex 32`; dùng mật khẩu database dài và ngẫu nhiên.
2. Cấu hình `SITE_DOMAIN`, email nhận thông báo TLS (`CADDY_EMAIL`), `CORS_ALLOWED_ORIGINS=https://<domain>`, thông tin ngân hàng và `PROD_DATABASE_URL`.
3. Lần đầu khởi động, đặt `INITIAL_ADMIN_USERNAME` cùng `INITIAL_ADMIN_PASSWORD` mạnh (ít nhất 16 ký tự). Sau khi admin được khởi tạo, xóa hai biến này khỏi môi trường triển khai.
4. Chạy:

   ```bash
   docker compose --env-file .env.production \
     -f docker-compose.yml -f docker-compose.prod.yml \
     --profile production up --build -d
   ```

   Windows PowerShell có thể viết cùng lệnh trên một dòng.

Caddy nhận lưu lượng public và cấp/gia hạn HTTPS tự động. Backend và MySQL không publish cổng ra host. Production profile từ chối secret mặc định, cấu hình domain/CORS chưa hợp lệ và tài khoản demo còn tồn tại.

## Database và migration

- `backend/src/main/resources/db/migration/V1__initial_schema.sql` tạo schema ban đầu cho database mới.
- `V2__fix_fresh_beef_image.sql` cập nhật ảnh mẫu của **Thịt Bò Mỹ Tươi** trong database đã có dữ liệu.
- Flyway quản lý phiên bản migration; Hibernate dùng `validate`, không tự sửa schema.
- Với database cũ chưa có Flyway history, cấu hình baseline version 1 để giữ dữ liệu hiện hữu. Hãy backup và kiểm tra schema trước khi nâng cấp production.
- Lên lịch backup MySQL và thử khôi phục bản backup định kỳ.

## Cổng dịch vụ

| Dịch vụ | Local | Production |
| --- | --- | --- |
| Frontend | `http://localhost:3000` (loopback) | Qua Caddy trên HTTPS |
| Backend API | Mạng Docker nội bộ | Mạng Docker nội bộ |
| MySQL | Mạng Docker nội bộ | Mạng riêng / dịch vụ DB riêng |

## Cấu trúc chính

```text
backend/                       Spring Boot API, nghiệp vụ, bảo mật và migrations
frontend/                      React SPA, trang khách hàng/nhân viên/admin
docker-compose.yml             Môi trường local
docker-compose.prod.yml        Cấu hình production và Caddy
Caddyfile                      Reverse proxy và HTTPS
.env.example                   Mẫu biến môi trường (không chứa secret dùng thật)
```

## Lưu ý bảo mật

- Không commit `.env`, `.env.production`, secret JWT, mật khẩu database hoặc thông tin thanh toán thật.
- Không triển khai với tài khoản/mật khẩu mẫu hoặc database local.
- Trước khi nhận giao dịch thật, cấu hình backup, kiểm tra phục hồi dữ liệu và rà soát các luồng đặt bàn → phục vụ → thanh toán trên môi trường staging.
