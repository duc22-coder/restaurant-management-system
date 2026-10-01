# CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

> **Đề tài:** Hệ thống Quản lý Nhà hàng (Restaurant Management System)
> **Công nghệ:** Java 17 · Spring Boot 3.3 · Spring Security + JWT · Spring Data JPA · MySQL 8.0 · React 18 + Vite (Client)
> **Phương pháp:** Mô hình hướng đối tượng, kiến trúc Client – Server / REST, mô hình 3 lớp (Presentation – Business – Data).

---

## 3.1. Tổng quan kiến trúc hệ thống

Hệ thống được thiết kế theo mô hình **Client – Server**, trong đó:

- **Client (Presentation):** Ứng dụng React (SPA) chạy trên trình duyệt, giao tiếp với backend qua giao thức **HTTP/REST** (JSON), đính kèm token **JWT** trong header `Authorization`.
- **Server (Business + Data):** Ứng dụng Spring Boot cung cấp REST API, xử lý nghiệp vụ (Service), phân quyền (Spring Security), truy cập dữ liệu qua **Spring Data JPA / Hibernate** xuống **MySQL**.

```
[ React SPA ]  ──HTTP/REST (JSON + JWT)──▶  [ Spring Boot REST API ]
   (Client)                                      │  Controller → Service → Repository
                                                 ▼
                                          [ MySQL Database ]
```

Các tầng trong backend:

| Tầng | Thành phần | Vai trò |
| :--- | :--- | :--- |
| Presentation | `controller/` | Nhận request, validate DTO, trả response REST |
| Business | `service/impl/` | Xử lý nghiệp vụ (đặt món, trừ kho, thanh toán…) |
| Data | `repository/`, `entity/` | Ánh xạ ORM xuống MySQL qua JPA/Hibernate |
| Cross-cutting | `config/`, `security/`, `enums/` | Bảo mật JWT, CORS, khởi tạo dữ liệu mẫu, tập hợp trạng thái |

---

## 3.2. Xác định tác nhân (Actors)

| Ký hiệu | Tác nhân | Mô tả | Quyền truy cập chính |
| :---: | :--- | :--- | :--- |
| KH | **Khách hàng** (Customer) | Người dùng cuối đặt món (ăn tại bàn / đến lấy / giao hàng) | Xem thực đơn, đặt món, thanh toán, tra cứu đơn, quản lý hồ sơ |
| NV | **Nhân viên** (Staff) | Phục vụ, pha chế/bếp, thu ngân | Sơ đồ bàn, xử lý đơn bếp, thu ngân, nhập kho |
| AD | **Quản trị viên** (Admin) | Người quản trị hệ thống | Toàn quyền: dashboard, CRUD toàn bộ danh mục, thực đơn, bàn, người dùng, voucher, kho, nhập hàng, công thức |

> **Quan hệ giữa các tác nhân:** `Admin` là tập cha của `Staff` (Admin thừa hưởng mọi quyền của Staff); cả hai đều kế thừa từ vai trò đã đăng nhập. `Khách hàng` độc lập.

---

## 3.3. Sơ đồ Use Case (Use Case Diagram)

### 3.3.1. Sơ đồ Use Case tổng quát

```mermaid
flowchart TB
    subgraph SYSTEM["🎯 HỆ THỐNG QUẢN LÝ NHÀ HÀNG"]
        direction TB

        subgraph AUTH["Nhóm Xác thực & Chung"]
            UC_Login(["Đăng nhập"])
            UC_Register(["Đăng ký tài khoản"])
            UC_Profile(["Quản lý hồ sơ cá nhân"])
        end

        subgraph CUS["Nhóm Khách hàng"]
            UC_ViewMenu(["Xem thực đơn"])
            UC_ViewTable(["Xem sơ đồ bàn"])
            UC_Order(["Đặt món"])
            UC_Track(["Tra cứu đơn hàng"])
            UC_Pay(["Thanh toán VietQR"])
        end

        subgraph STF["Nhóm Nhân viên"]
            UC_TableMap(["Quản lý sơ đồ bàn"])
            UC_Kitchen(["Xử lý đơn bếp"])
            UC_Cashier(["Thu ngân / Xác nhận thanh toán"])
            UC_Import(["Nhập kho nguyên liệu"])
        end

        subgraph ADM["Nhóm Quản trị"]
            UC_Dash(["Xem Dashboard phân tích"])
            UC_Cat(["Quản lý danh mục"])
            UC_Menu(["Quản lý thực đơn"])
            UC_TableCRUD(["Quản lý bàn ăn"])
            UC_User(["Quản lý người dùng"])
            UC_Voucher(["Quản lý voucher"])
            UC_Stock(["Quản lý kho SPCT"])
            UC_Recipe(["Quản lý công thức TPSP"])
            UC_OrderMng(["Quản lý đơn hàng"])
        end
    end

    KH(["👤 Khách hàng"]) --> UC_Login & UC_Register & UC_Profile
    KH --> UC_ViewMenu & UC_ViewTable & UC_Order & UC_Track & UC_Pay

    NV(["👨‍🍳 Nhân viên"]) --> UC_Login & UC_TableMap & UC_Kitchen & UC_Cashier & UC_Import

    AD(["🔧 Quản trị viên"]) --> UC_Dash & UC_Cat & UC_Menu & UC_TableCRUD
    AD --> UC_User & UC_Voucher & UC_Stock & UC_Recipe & UC_OrderMng & UC_Import

    UC_Order -. <<include>> .-> UC_ViewMenu
    UC_Pay -. <<include>> .-> UC_Order
    UC_Cashier -. <<include>> .-> UC_Kitchen
    UC_Import -. <<extend>> .-> UC_Stock
```

### 3.3.2. Sơ đồ Use case theo tác nhân Khách hàng

```mermaid
flowchart LR
    KH(["👤 Khách hàng"])
    subgraph S1["Hệ thống (phía Khách)"]
        direction TB
        A1(["Đăng ký"]) ; A2(["Đăng nhập"]) ; A3(["Xem thực đơn"])
        A4(["Quét QR / Chọn bàn"]) ; A5(["Đặt món"]) ; A6(["Theo dõi đơn"])
        A7(["Thanh toán VietQR"]) ; A8(["Quản lý hồ sơ"])
    end
    KH --> A1 & A2 & A3 & A4 & A5 & A6 & A7 & A8
    A5 -.->|include| A3
    A7 -.->|include| A5
```

### 3.3.3. Sơ đồ Use case theo tác nhân Nhân viên

```mermaid
flowchart LR
    NV(["👨‍🍳 Nhân viên"])
    subgraph S2["Hệ thống (phía Nhân viên)"]
        direction TB
        B1(["Đăng nhập"]) ; B2(["Xem/Cập nhật sơ đồ bàn"])
        B3(["Xử lý đơn bếp"]) ; B4(["Thu ngân / Xác nhận TT"])
        B5(["Lập phiếu nhập kho"]) ; B6(["Quản lý công thức"])
    end
    NV --> B1 & B2 & B3 & B4 & B5 & B6
    B4 -.->|include| B3
```

### 3.3.4. Sơ đồ Use case theo tác nhân Quản trị viên

```mermaid
flowchart LR
    AD(["🔧 Quản trị viên"])
    subgraph S3["Hệ thống (phía Admin)"]
        direction TB
        C1(["Đăng nhập"]) ; C2(["Xem Dashboard"])
        C3(["CRUD Danh mục"]) ; C4(["CRUD Thực đơn"])
        C5(["CRUD Bàn ăn"]) ; C6(["CRUD Người dùng"])
        C7(["CRUD Voucher"]) ; C8(["CRUD Kho SPCT"])
        C9(["CRUD Công thức"]) ; C10(["Quản lý đơn hàng"])
        C11(["Duyệt phiếu nhập"])
    end
    AD --> C1 & C2 & C3 & C4 & C5 & C6 & C7 & C8 & C9 & C10 & C11
```

---

## 3.4. Đặc tả Use Case (Use Case Specification)

### Đặc tả UC-KH05 – Đặt món (tạo đơn hàng)

| Thuộc tính | Nội dung |
| :--- | :--- |
| **Mã / Tên UC** | UC-KH05 – Đặt món |
| **Tác nhân chính** | Khách hàng |
| **Mô tả** | Khách chọn món, số lượng, ghi chú, hình thức (ăn tại bàn / đến lấy / giao hàng), áp dụng voucher và tạo đơn hàng |
| **Tiền điều kiện** | Khách đã truy cập thực đơn (qua QR bàn `/menu?tableId=..` hoặc trực tiếp); hệ thống đang hoạt động |
| **Hậu điều kiện** | Đơn hàng được tạo với trạng thái `PENDING`; tổng tiền được tính; nếu ăn tại bàn → bàn chuyển `OCCUPIED` |
| **Luồng chính** | 1. Khách xem thực đơn & chọn món.<br>2. Khách điều chỉnh số lượng, ghi chú từng món.<br>3. Khách chọn hình thức đặt (DINE_IN / PICKUP / DELIVERY).<br>4. Nếu DELIVERY → nhập địa chỉ & SĐT; nếu PICKUP → nhập SĐT.<br>5. (Tùy chọn) Nhập mã voucher → hệ thống kiểm tra & tính giảm.<br>6. Khách xác nhận đặt món.<br>7. Hệ thống sinh `orderCode`, lưu đơn + chi tiết đơn (`order_items`, mỗi món `PENDING`), tính `total_amount`.<br>8. Hệ thống trả về mã đơn & thông tin thanh toán. |
| **Luồng thay thế** | **3a.** Chọn Ăn tại bàn → chọn bàn trống trên sơ đồ hoặc quét QR.<br>**5a.** Voucher không hợp lệ/hết hạn → thông báo lỗi, giữ nguyên đơn.<br>**7a.** Món vừa chuyển `UNAVAILABLE` (hết món) → thông báo & yêu cầu bỏ chọn. |
| **Nghiệp vụ liên quan** | Tính tổng tiền = Σ(slượng × giá) − giảm voucher; tồn kho chỉ trừ khi đơn hoàn tất (xem UC-NV03/UC-NV04) |

### Đặc tả UC-KH07 – Thanh toán VietQR

| Thuộc tính | Nội dung |
| :--- | :--- |
| **Mã / Tên UC** | UC-KH07 – Thanh toán VietQR |
| **Tác nhân chính** | Khách hàng |
| **Mô tả** | Sinh mã QR thanh toán động theo đúng mã đơn và số tiền cần trả |
| **Tiền điều kiện** | Đơn hàng tồn tại (`PENDING`/`PROCESSING`), chưa thanh toán |
| **Hậu điều kiện** | Mã VietQR được trả về để khách quét; khi nhân viên xác nhận → `Payment.status = COMPLETED` |
| **Luồng chính** | 1. Khách mở trang thanh toán của đơn.<br>2. Hệ thống lấy `total_amount`, `orderCode`.<br>3. Hệ thống sinh URL/ảnh VietQR động (ngân hàng – số TK – số tiền – nội dung = orderCode).<br>4. Khách quét & chuyển khoản; hệ thống/chờ nhân viên xác nhận. |
| **Luồng thay thế** | 2a. Đơn đã thanh toán → thông báo "Đã thanh toán". |

### Đặc tả UC-KH06 – Tra cứu đơn hàng

| Thuộc tính | Nội dung |
| :--- | :--- |
| **Mã / Tên UC** | UC-KH06 – Tra cứu đơn hàng |
| **Tác nhân chính** | Khách hàng |
| **Mô tả** | Xem trạng thái đơn theo thời gian thực (theo mã đơn, theo bàn, hoặc danh sách "đơn của tôi") |
| **Tiền điều kiện** | Có mã đơn hoặc đang ngồi tại bàn có mã QR |
| **Hậu điều kiện** | Hiển thị trạng thái đơn & từng món (`PENDING→PREPARING→READY→SERVED`) |
| **Luồng chính** | 1. Khách nhập mã đơn / mở link bàn / mở "Đơn của tôi".<br>2. Hệ thống truy vấn đơn + chi tiết.<br>3. Hiển thị trạng thái tổng và từng món. |

### Đặc tả UC-NV03 – Xử lý đơn bếp

| Thuộc vật | Nội dung |
| :--- | :--- |
| **Mã / Tên UC** | UC-NV03 – Xử lý đơn bếp |
| **Tác nhân chính** | Nhân viên (pha chế/bếp) |
| **Mô tả** | Chuyển trạng thái từng món và cả đơn theo luồng chế biến |
| **Tiền điều kiện** | Nhân viên đăng nhập; tồn tại đơn `PENDING/PROCESSING` |
| **Hậu điều kiện** | Món chuyển `PENDING→PREPARING→READY→SERVED`; đơn có thể chuyển `COMPLETED` |
| **Luồng chính** | 1. NV mở danh sách đơn.<br>2. NV chọn đơn → xem chi tiết món.<br>3. NV cập nhật trạng thái món (bắt đầu/pha chế xong).<br>4. Khi tất cả món `READY`/`SERVED` → cập nhật trạng thái đơn. |
| **Luồng thay thế** | 3a. Thiếu nguyên liệu (SPCT `OUT_OF_STOCK`) → báo cáo quản lý nhập thêm. |

### Đặc tả UC-NV04 – Thu ngân / Xác nhận thanh toán

| Thuộc tính | Nội dung |
| :--- | :--- |
| **Mã / Tên UC** | UC-NV04 – Thu ngân / Xác nhận thanh toán |
| **Tác nhân chính** | Nhân viên (thu ngân) |
| **Mô tả** | Xác nhận thanh toán đơn (tiền mặt / chuyển khoản / VNPAY), lập hóa đơn, giải phóng bàn |
| **Tiền điều kiện** | Đơn đã chế biến xong (`COMPLETED`), chưa thanh toán |
| **Hậu điều kiện** | Tạo `Payment` (status `COMPLETED`); đơn → `PAID`; bàn → `AVAILABLE`; **trừ kho nguyên liệu theo công thức TPSP** (nếu chưa trừ) |
| **Luồng chính** | 1. NV mở đơn cần thanh toán.<br>2. Hệ thống hiển thị tổng tiền, voucher đã áp dụng.<br>3. NV chọn phương thức thanh toán & xác nhận.<br>4. Hệ thống tạo bản ghi `Payment`, cập nhật đơn `PAID`.<br>5. Hệ thống đọc `TPSP` của từng món → trừ `stock_quantity` SPCT tương ứng.<br>6. Giải phóng bàn (`AVAILABLE`), in/tạo hóa đơn. |
| **Luồng thay thế** | 3a. Thanh toán VNPAY/Bank → NV kiểm tra giao dịch trước khi xác nhận.<br>5a. Tồn kho không đủ → ghi log cảnh báo, vẫn cho phép thanh toán (báo quản lý). |

### Đặc tả UC-AD01 – Quản lý thực đơn

| Thuộc tính | Nội dung |
| :--- | :--- |
| **Mã / Tên UC** | UC-AD01 – Quản lý thực đơn (CRUD) |
| **Tác nhân chính** | Quản trị viên |
| **Mô tả** | Thêm/sửa/xóa món ăn, cập nhật giá, hình ảnh, đổi trạng thái Còn món/Hết món |
| **Tiền điều kiện** | Đăng nhập với vai trò `ADMIN` |
| **Hậu điều kiện** | Dữ liệu `menu_items` được cập nhật |
| **Luồng chính** | 1. AD mở trang Thực đơn.<br>2. AD thêm/sửa món (tên, mô tả, giá, ảnh, danh mục).<br>3. AD lưu → hệ thống validate & ghi nhận.<br>4. (Tùy chọn) AD bật/tắt trạng thái (`AVAILABLE`↔`UNAVAILABLE`) hoặc xóa món. |

### Đặc tả UC-AD07 – Quản lý kho nguyên liệu (SPCT)

| Thuộc tính | Nội dung |
| :--- | :--- |
| **Mã / Tên UC** | UC-AD07 – Quản lý kho SPCT |
| **Tác nhân chính** | Quản trị viên (Nhân viên được xem/cập nhật tồn) |
| **Mô tả** | Quản lý quy cách/đơn vị/tồn kho/định mức tối thiểu; cảnh báo sắp hết hàng |
| **Tiền điều kiện** | Đăng nhập (`ADMIN`/`STAFF`) |
| **Hậu điều kiện** | `product_details` được cập nhật; cảnh báo khi `stock_quantity ≤ min_stock_alert` |
| **Luồng chính** | 1. Mở trang Kho.<br>2. Xem danh sách SPCT, lọc "sắp hết".<br>3. Thêm/sửa quy cách, đơn vị, giá vốn, ngưỡng cảnh báo.<br>4. Cập nhật nhanh tồn kho nếu cần. |
| **Nghiệp vụ** | Khi `stock_quantity ≤ 0` → status tự động `OUT_OF_STOCK` (xử lý trong `@PreUpdate`) |

### Đặc tả UC-AD08 – Nhập kho / Duyệt phiếu nhập (ĐNP)

| Thuộc tính | Nội dung |
| :--- | :--- |
| **Mã / Tên UC** | UC-AD08 – Nhập kho (ĐNP) |
| **Tác nhân chính** | Quản trị viên / Nhân viên |
| **Mô tả** | Lập phiếu nhập từ nhà cung cấp; duyệt nhập → tự động cộng tồn kho SPCT |
| **Tiền điều kiện** | Đăng nhập (`ADMIN`/`STAFF`); có SPCT để nhập |
| **Hậu điều kiện** | Phiếu `PENDING`→`COMPLETED`; `stock_quantity` của SPCT được **cộng thêm** số lượng nhập |
| **Luồng chính** | 1. Tạo phiếu nhập (mã, NCC, SĐT, địa chỉ).<br>2. Thêm dòng chi tiết: chọn SPCT, số lượng, đơn giá → thành tiền.<br>3. Lưu phiếu (`PENDING`).<br>4. Duyệt nhập (`complete`) → hệ thống duyệt từng dòng: `SPCT.stock += quantity`, cập nhật `cost_price`.<br>5. Phiếu → `COMPLETED`, cập nhật tổng tiền. |
| **Luồng thay thế** | 4a. Hủy phiếu (`cancel`) → không cộng tồn, phiếu `CANCELLED`. |

### Đặc tả UC-AD09 – Quản lý công thức (TPSP)

| Thuộc tính | Nội dung |
| :--- | :--- |
| **Mã / Tên UC** | UC-AD09 – Quản lý công thức (TPSP) |
| **Tác nhân chính** | Quản trị viên / Nhân viên |
| **Mô tả** | Thiết lập định lượng nguyên liệu cho mỗi món ăn (1 suất dùng bao nhiêu SPCT) |
| **Tiền điều kiện** | Đăng nhập; món ăn và SPCT tồn tại |
| **Hậu điều kiện** | `product_recipes` được cập nhật; hệ thống dùng để tự trừ kho khi bán |
| **Luồng chính** | 1. Chọn món ăn.<br>2. Thêm nguyên liệu (SPCT) + số lượng định mức + đơn vị.<br>3. Lưu công thức.<br>4. Sửa/xóa dòng công thức nếu cần. |

### Đặc tả UC-AD04 – Quản lý voucher

| Thuộc tính | Nội dung |
| :--- | :--- |
| **Mã / Tên UC** | UC-AD04 – Quản lý voucher |
| **Tác nhân chính** | Quản trị viên |
| **Mô tả** | Tạo mã giảm giá theo % hoặc số tiền cố định, đặt điều kiện & thời hạn |
| **Tiền điều kiện** | Đăng nhập `ADMIN` |
| **Hậu điều kiện** | `vouchers` được tạo/cập nhật |
| **Luồng chính** | 1. Tạo voucher: mã, loại giảm, giá trị.<br>2. Nếu PERCENTAGE → đặt mức giảm tối đa; nếu FIXED_AMOUNT → nhập số tiền.<br>3. Đặt đơn tối thiểu, thời hạn, giới hạn lượt dùng.<br>4. Lưu/kích hoạt voucher. |

### Đặc tả UC-AD06 – Quản lý người dùng & phân quyền

| Thuộc tính | Nội dung |
| :--- | :--- |
| **Mã / Tên UC** | UC-AD06 – Quản lý người dùng |
| **Tác nhân chính** | Quản trị viên |
| **Mô tả** | Quản lý tài khoản, phân quyền `ADMIN`/`STAFF`/`CUSTOMER`, bật/tắt trạng thái |
| **Tiền điều kiện** | Đăng nhập `ADMIN` |
| **Hậu điều kiện** | `users` được cập nhật (vai trò, trạng thái ACTIVE/INACTIVE) |
| **Luồng chính** | 1. Xem danh sách người dùng.<br>2. Thêm/sửa: họ tên, email, SĐT, vai trò.<br>3. Đặt lại mật khẩu / bật-khóa tài khoản.<br>4. Lưu. |

---

## 3.5. Sơ đồ thực thể – liên kết (ERD)

### 3.5.1. Sơ đồ ERD

```mermaid
erDiagram
    CATEGORY ||--o{ MENU_ITEM : "phân loại"
    MENU_ITEM ||--o{ PRODUCT_DETAIL : "có quy cách"
    MENU_ITEM ||--o{ PRODUCT_RECIPE : "có công thức"
    PRODUCT_DETAIL ||--o{ PRODUCT_RECIPE : "làm nguyên liệu"
    PRODUCT_DETAIL ||--o{ PURCHASE_ORDER_ITEM : "được nhập"

    RESTAURANT_TABLE ||--o{ ORDERS : "phục vụ"
    USERS ||--o{ ORDERS : "là khách đặt"
    USERS ||--o{ ORDERS : "là NV xử lý"
    MENU_ITEM ||--o{ ORDER_ITEM : "được gọi"
    ORDERS ||--o{ ORDER_ITEM : "gồm"
    ORDERS ||--|| PAYMENT : "thanh toán"

    USERS ||--o{ PURCHASE_ORDER : "lập phiếu"
    PURCHASE_ORDER ||--o{ PURCHASE_ORDER_ITEM : "gồm"

    CATEGORY {
        bigint id PK
        varchar name
        text description
        varchar image
        varchar status "ACTIVE/INACTIVE"
        datetime created_at
        datetime updated_at
    }
    MENU_ITEM {
        bigint id PK
        bigint category_id FK
        varchar name
        text description
        decimal price
        varchar image
        varchar status "AVAILABLE/UNAVAILABLE"
        datetime created_at
        datetime updated_at
    }
    PRODUCT_DETAIL {
        bigint id PK
        bigint menu_item_id FK
        varchar sku
        varchar variant_name
        varchar unit
        double stock_quantity
        double min_stock_alert
        decimal cost_price
        decimal selling_price
        varchar status "ACTIVE/OUT_OF_STOCK/INACTIVE"
    }
    PRODUCT_RECIPE {
        bigint id PK
        bigint product_id FK
        bigint ingredient_detail_id FK
        double quantity
        varchar unit
        text note
    }
    RESTAURANT_TABLE {
        bigint id PK
        varchar table_number
        int capacity
        varchar status "AVAILABLE/OCCUPIED/PAYING"
        varchar qr_code
    }
    USERS {
        bigint id PK
        varchar username
        varchar password
        varchar full_name
        varchar email
        varchar phone
        text address
        varchar role "ADMIN/STAFF/CUSTOMER"
        varchar status "ACTIVE/INACTIVE"
    }
    ORDERS {
        bigint id PK
        varchar order_code
        bigint table_id FK
        bigint customer_id FK
        bigint staff_id FK
        varchar order_type "DINE_IN/PICKUP/DELIVERY"
        text delivery_address
        varchar contact_phone
        varchar status "PENDING/PROCESSING/COMPLETED/PAID/CANCELLED"
        decimal total_amount
        boolean stock_deducted
        text note
    }
    ORDER_ITEM {
        bigint id PK
        bigint order_id FK
        bigint menu_item_id FK
        int quantity
        decimal price
        varchar status "PENDING/PREPARING/READY/SERVED"
        text note
    }
    PAYMENT {
        bigint id PK
        bigint order_id FK
        varchar payment_method "CASH/BANK_TRANSFER/VNPAY"
        decimal amount
        varchar voucher_code
        decimal discount_amount
        varchar status "PENDING/COMPLETED/FAILED"
        datetime paid_at
    }
    VOUCHER {
        bigint id PK
        varchar code
        text description
        varchar discount_type "PERCENTAGE/FIXED_AMOUNT"
        decimal discount_value
        decimal max_discount_amount
        decimal min_order_amount
        datetime start_date
        datetime end_date
        int usage_limit
        int used_count
        boolean active
    }
    PURCHASE_ORDER {
        bigint id PK
        varchar code
        bigint creator_id FK
        varchar supplier_name
        varchar supplier_phone
        text supplier_address
        varchar status "PENDING/COMPLETED/CANCELLED"
        decimal total_amount
        text note
    }
    PURCHASE_ORDER_ITEM {
        bigint id PK
        bigint purchase_order_id FK
        bigint product_detail_id FK
        double quantity
        decimal unit_price
        decimal total_price
        text note
    }
```

> **Ghi chú liên kết:** `VOUCHER` không liên kết khóa ngoại trực tiếp với `PAYMENT` mà liên kết *lỏng* qua trường `payment.voucher_code = voucher.code` (kiểu liên kết theo mã/logic), phù với nghiệp vụ "mỗi lần thanh toán có thể áp dụng 1 mã giảm giá".

### 3.5.2. Mô tả các thực thể và thuộc tính

| STT | Thực thể (Ký hiệu ERD) | Bảng | Thuộc tính chính | Mô tả nghiệp vụ |
| :--: | :--- | :--- | :--- | :--- |
| 1 | **TK** | `users` | id, username, password, fullName, email, phone, address, role, status | Tài khoản hệ thống, đóng 3 vai trò: ADMIN, STAFF, CUSTOMER |
| 2 | **Bàn** | `restaurant_tables` | id, tableNumber, capacity, status, qrCode | Bàn ăn, sức chứa, trạng thái (Trống/Có khách/Yêu cầu tính tiền), liên kết QR |
| 3 | **Loại món** | `categories` | id, name, description, image, status | Danh mục phân loại món ăn |
| 4 | **SP** | `menu_items` | id, categoryId, name, description, price, image, status | Món ăn/đồ uống trên thực đơn |
| 5 | **SPCT** | `product_details` | id, menuItemId, sku, variantName, unit, stockQuantity, minStockAlert, costPrice, sellingPrice, status | Quy cách/nguyên liệu kho: đơn vị, tồn kho, ngưỡng tối thiểu |
| 6 | **TPSP** | `product_recipes` | id, productId, ingredientDetailId, quantity, unit, note | Định lượng công thức: 1 suất món tiêu hao bao nhiêu nguyên liệu |
| 7 | **Đơn** | `orders` | id, orderCode, tableId, customerId, staffId, orderType, deliveryAddress, contactPhone, status, totalAmount, stockDeducted, note | Đơn hàng bán ra (gắn khách, bàn, nhân viên) |
| 8 | **CT ĐƠN** | `order_items` | id, orderId, menuItemId, quantity, price, status, note | Chi tiết món trong đơn |
| 9 | **ĐNP** | `purchase_orders` | id, code, creatorId, supplierName/Phone/Address, status, totalAmount, note | Phiếu nhập kho từ nhà cung cấp |
| 10 | **CT ĐN** | `purchase_order_items` | id, purchaseOrderId, productDetailId, quantity, unitPrice, totalPrice, note | Chi tiết nguyên liệu trong phiếu nhập |
| 11 | **Voucher** | `vouchers` | id, code, discountType, discountValue, maxDiscountAmount, minOrderAmount, startDate, endDate, usageLimit, usedCount, active | Mã giảm giá |
| 12 | **Thanh toán** | `payments` | id, orderId, paymentMethod, amount, voucherCode, discountAmount, status, paidAt | Giao dịch thanh toán cho đơn |

### 3.5.3. Mô tả các mối quan hệ

| Quan hệ | Thực thể | Bản số | Diễn giải |
| :--- | :--- | :--- | :--- |
| R1 | Loại món – SP | 1 – N | Một danh mục có nhiều món; món thuộc 1 danh mục |
| R2 | SP – SPCT | 1 – N | Một món có nhiều quy cách/biến thể kho |
| R3 | SP – TPSP | 1 – N | Một món có nhiều dòng công thức |
| R4 | SPCT – TPSP | 1 – N | Một nguyên liệu xuất hiện trong nhiều công thức |
| R5 | SPCT – CT ĐN | 1 – N | Một nguyên liệu được nhập qua nhiều phiếu |
| R6 | Bàn – Đơn | 1 – N | Một bàn có nhiều đơn theo thời gian |
| R7 | TK(khách) – Đơn | 1 – N | Một khách có nhiều đơn |
| R8 | TK(NV) – Đơn | 1 – N | Một nhân viên xử lý nhiều đơn |
| R9 | Đơn – CT ĐƠN | 1 – N | Một đơn gồm nhiều món |
| R10 | SP – CT ĐƠN | 1 – N | Một món xuất hiện trong nhiều chi tiết đơn |
| R11 | Đơn – Thanh toán | 1 – 1 | Mỗi đơn có đúng 1 giao dịch thanh toán |
| R12 | TK – ĐNP | 1 – N | Một nhân viên lập nhiều phiếu nhập |
| R13 | ĐNP – CT ĐN | 1 – N | Một phiếu gồm nhiều dòng nguyên liệu |
| R14 | Voucher – Thanh toán | 1 – N (lỏng) | Liên kết theo mã (không FK) |

---

## 3.6. Sơ đồ lớp phân tích (Class Diagram)

```mermaid
classDiagram
    class User {
        +Long id
        +String username
        +String password
        +String fullName
        +String email
        +String phone
        +Role role
        +UserStatus status
        +login()
        +register()
    }
    class RestaurantTable {
        +Long id
        +String tableNumber
        +Integer capacity
        +TableStatus status
        +String qrCode
    }
    class Category {
        +Long id
        +String name
        +String description
        +CategoryStatus status
    }
    class MenuItem {
        +Long id
        +String name
        +BigDecimal price
        +MenuItemStatus status
    }
    class ProductDetail {
        +Long id
        +String sku
        +String unit
        +Double stockQuantity
        +Double minStockAlert
        +BigDecimal costPrice
    }
    class ProductRecipe {
        +Long id
        +Double quantity
        +String unit
    }
    class Order {
        +Long id
        +String orderCode
        +OrderType orderType
        +OrderStatus status
        +BigDecimal totalAmount
        +Boolean stockDeducted
    }
    class OrderItem {
        +Long id
        +Integer quantity
        +BigDecimal price
        +OrderItemStatus status
    }
    class Payment {
        +Long id
        +PaymentMethod method
        +BigDecimal amount
        +String voucherCode
        +PaymentStatus status
    }
    class Voucher {
        +Long id
        +String code
        +DiscountType discountType
        +BigDecimal discountValue
    }
    class PurchaseOrder {
        +Long id
        +String code
        +String supplierName
        +PurchaseOrderStatus status
    }
    class PurchaseOrderItem {
        +Long id
        +Double quantity
        +BigDecimal unitPrice
        +BigDecimal totalPrice
    }

    Category "1" --> "*" MenuItem
    MenuItem "1" --> "*" ProductDetail
    MenuItem "1" --> "*" ProductRecipe
    ProductDetail "1" --> "*" ProductRecipe
    ProductDetail "1" --> "*" PurchaseOrderItem
    RestaurantTable "1" --> "*" Order
    User "1" --> "*" Order : khách đặt
    User "1" --> "*" Order : NV xử lý
    MenuItem "1" --> "*" OrderItem
    Order "1" --> "*" OrderItem
    Order "1" --> "1" Payment
    User "1" --> "*" PurchaseOrder
    PurchaseOrder "1" --> "*" PurchaseOrderItem
    Order ..> Voucher : áp dụng theo mã
```

---

## 3.7. Sơ đồ hoạt động (Activity Diagram)

### 3.7.1. Hoạt động "Đặt món" (Khách hàng)

```mermaid
flowchart TD
    Start([Bắt đầu]) --> A1[Xem thực đơn]
    A1 --> A2{Chọn món}
    A2 --> A3[Chọn số lượng & ghi chú]
    A3 --> A4{Chọn hình thức đặt}
    A4 -->|DINE_IN| A5[Chọn bàn / Quét QR]
    A4 -->|PICKUP| A6[Nhập SĐT liên hệ]
    A4 -->|DELIVERY| A7[Nhập địa chỉ & SĐT]
    A5 --> A8{Có voucher?}
    A6 --> A8
    A7 --> A8
    A8 -->|Có| A9[Kiểm tra & áp dụng voucher]
    A8 -->|Không| A10
    A9 --> A10[Xác nhận đặt món]
    A10 --> A11[Món còn hàng?]
    A11 -->|Không| A12[Thông báo hết món] --> A2
    A11 -->|Có| A13[Tạo đơn PENDING + tính tổng tiền]
    A13 --> End([Kết thúc])
```

### 3.7.2. Hoạt động "Xử lý đơn bếp → Thu ngân" (Nhân viên)

```mermaid
flowchart TD
    S([Bắt đầu]) --> B1[NV nhận đơn PENDING]
    B1 --> B2[Cập nhật món → PREPARING]
    B2 --> B3[Pha chế/nấu xong]
    B3 --> B4[Cập nhật món → READY]
    B4 --> B5[Phục vụ bàn → SERVED]
    B5 --> B6[Tất cả món hoàn tất?]
    B6 -->|Chưa| B3
    B6 -->|Rồi| B7[Đơn → COMPLETED]
    B7 --> B8[Thu ngân xác nhận thanh toán]
    B8 --> B9[Chọn phương thức: CASH/BANK/VNPAY]
    B9 --> B10[Tạo Payment COMPLETED]
    B10 --> B11[Đọc TPSP → trừ kho SPCT]
    B11 --> B12[Đơn → PAID]
    B12 --> B13[Giải phóng bàn → AVAILABLE]
    B13 --> E([Kết thúc])
```

### 3.7.3. Hoạt động "Nhập kho & duyệt phiếu" (Admin/Nhân viên)

```mermaid
flowchart TD
    S2([Bắt đầu]) --> C1[Lập phiếu nhập ĐNP: NCC + dòng SPCT]
    C1 --> C2[Nhập số lượng, đơn giá]
    C2 --> C3[Lưu phiếu trạng thái PENDING]
    C3 --> C4{Duyệt hay Hủy?}
    C4 -->|Hủy| C5[Phiếu → CANCELLED] --> E2([Kết thúc])
    C4 -->|Duyệt| C6[Với mỗi dòng: SPCT.stock += quantity]
    C6 --> C7[Cập nhật cost_price SPCT]
    C7 --> C8[Phiếu → COMPLETED]
    C8 --> E2
```

---

## 3.8. Sơ đồ tuần tự (Sequence Diagram)

### 3.8.1. Tuần tự "Đặt món"

```mermaid
sequenceDiagram
    actor KH as Khách hàng
    participant FE as React SPA
    participant API as Spring Boot API
    participant DB as MySQL

    KH->>FE: Chọn món, số lượng, hình thức, xác nhận
    FE->>API: POST /api/customer/orders (JWT)
    API->>DB: Kiểm tra món & bàn
    API->>DB: INSERT orders (PENDING)
    API->>DB: INSERT order_items
    API->>DB: Tính total_amount
    API-->>FE: Trả về orderCode + tổng tiền
    FE-->>KH: Hiển thị mã đơn & nút thanh toán
```

### 3.8.2. Tuần tự "Thanh toán VietQR & trừ kho"

```mermaid
sequenceDiagram
    actor NV as Nhân viên (Thu ngân)
    participant FE as React SPA
    participant API as Spring Boot API
    participant DB as MySQL

    NV->>FE: Mở đơn cần thanh toán
    FE->>API: GET /api/staff/payment/qr/{orderId}
    API-->>FE: Sinh VietQR (orderCode + amount)
    NV->>KH: Yêu cầu quét/chuyển khoản
    NV->>FE: Xác nhận thanh toán (method)
    FE->>API: POST /api/staff/payment/process
    API->>DB: INSERT payments (COMPLETED)
    API->>DB: Đọc product_recipes (TPSP)
    API->>DB: UPDATE product_details (trừ stock)
    API->>DB: UPDATE orders → PAID, bàn → AVAILABLE
    API-->>FE: Trả về hóa đơn
    FE-->>NV: Hiển thị hóa đơn hoàn tất
```

### 3.8.3. Tuần tự "Duyệt phiếu nhập kho"

```mermaid
sequenceDiagram
    actor AD as Admin/Nhân viên
    participant FE as React SPA
    participant API as Spring Boot API
    participant DB as MySQL

    AD->>FE: Tạo phiếu nhập (NCC + dòng SPCT)
    FE->>API: POST /api/admin/purchases
    API->>DB: INSERT purchase_orders (PENDING)
    API->>DB: INSERT purchase_order_items
    API-->>FE: Phiếu đã lưu
    AD->>FE: Bấm "Duyệt nhập"
    FE->>API: POST /api/admin/purchases/{id}/complete
    API->>DB: Với mỗi dòng: stock += quantity
    API->>DB: UPDATE purchase_orders → COMPLETED
    API-->>FE: Nhập kho thành công
    FE-->>AD: Thông báo + tồn kho mới
```

---

## 3.9. Luồng nghiệp vụ kho tự động (tổng kết)

```
[Nhập hàng]   Tạo ĐNP (PENDING) ──Duyệt──▶ stock SPCT (+ quantity)
[Bán hàng]    Đặt món (PENDING) ──Bếp xử lý──▶ Đọc TPSP ──Thanh toán──▶ stock SPCT (−)
```

| Giai đoạn | Sự kiện | Ảnh hưởng kho |
| :--- | :--- | :--- |
| Nhập | Duyệt phiếu nhập (`complete`) | **Cộng** tồn SPCT theo số lượng nhập |
| Bán | Xác nhận thanh toán (`processPayment`) | **Trừ** tồn SPCT theo định mức công thức TPSP |

---

*Hết Chương 3.*
