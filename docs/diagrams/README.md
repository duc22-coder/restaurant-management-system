# 📐 Bộ biểu đồ thiết kế — Hệ thống Quản lý Nhà hàng

Thư mục này chứa **biểu đồ ca sử dụng (Use Case)** và **biểu đồ tuần tự (Sequence)** của hệ thống,
được vẽ lại theo đúng chuẩn UML 2.5 và bám sát mã nguồn thực tế trong `backend/` + `frontend/`.

---

## 📁 Cấu trúc thư mục

```
docs/diagrams/
├── Bieu-do-thiet-ke.docx              # 📄 File Word: đặc tả ca sử dụng + toàn bộ biểu đồ (17 hình)
├── Bieu-do-thiet-ke.pdf               # 📄 Bản PDF tổng hợp (1 biểu đồ / trang A4)
├── index.html                         # 🌐 Trang xem toàn bộ biểu đồ trên trình duyệt
├── render.sh                          # Script kết xuất ảnh từ file .puml
├── README.md                          # Quy ước vẽ chuẩn & hướng dẫn sử dụng
│
├── use-case/                          # Biểu đồ ca sử dụng (.puml + .png)
│   ├── 00-use-case-tong-quan.puml     # Tổng quan các nhóm chức năng (mức module)
│   ├── 01-dat-mon-tai-ban.puml        # Nhóm: đặt món tại bàn
│   ├── 02-dat-mon-giao-tan-noi.puml   # Nhóm: đặt món giao tận nơi
│   ├── 03-xu-ly-don-hang-tai-bep.puml # Nhóm: xử lý đơn tại bếp
│   ├── 04-thanh-toan-va-giai-phong-ban.puml
│   ├── 05-quan-ly-nhap-kho-nguyen-lieu.puml
│   ├── 06-quan-ly-thuc-don-va-dinh-luong.puml
│   ├── 07-dang-nhap-va-dang-ky.puml
│   └── 08-xem-bao-cao-thong-ke.puml
│
└── sequence/                          # Biểu đồ tuần tự tương ứng 1-1
    ├── 01-dat-mon-tai-ban.puml
    ├── 02-dat-mon-giao-tan-noi.puml
    ├── 03-xu-ly-don-hang-tai-bep.puml
    ├── 04-thanh-toan-va-giai-phong-ban.puml
    ├── 05-quan-ly-nhap-kho-nguyen-lieu.puml
    ├── 06-quan-ly-thuc-don-va-dinh-luong.puml
    ├── 07-dang-nhap-va-dang-ky.puml
    └── 08-xem-bao-cao-thong-ke.puml
```

> **Nguyên tắc:** mỗi biểu đồ ca sử dụng đều có **đúng một biểu đồ tuần tự** cùng số thứ tự mô tả
> luồng thông điệp chi tiết của ca sử dụng đó.

### 📄 File Word `Bieu-do-thiet-ke.docx` gồm những gì?

| Phần | Nội dung |
| :--- | :--- |
| **Trang bìa** | Chừa chỗ trống để điền trường, khoa, sinh viên, lớp, GVHD |
| **Mục lục nội dung** | Danh mục các phần và 8 ca sử dụng |
| **Phần 1** | Biểu đồ ca sử dụng tổng quan (**Hình 1**) + Bảng đối chiếu UC ↔ Sequence |
| **Phần 2** | 8 ca sử dụng, mỗi ca gồm: <br>• Bảng đặc tả (tác nhân, mục đích, tiền điều kiện, luồng chính, luồng phụ, hậu điều kiện, API) <br>• Biểu đồ ca sử dụng <br>• Biểu đồ tuần tự tương ứng |
| **Phụ lục** | Quy ước vẽ biểu đồ ca sử dụng, biểu đồ tuần tự và cách kết xuất lại ảnh |

- Font chuẩn báo cáo: **Times New Roman 13**, giãn dòng 1.3, khổ **A4**, lề 2.5 / 2.0 / 2.0 / 2.0 cm.
- Toàn bộ **17 hình** đã được chèn sẵn với tỉ lệ vừa khổ giấy, **9 bảng** ở dạng Table Grid.
- Muốn ghép vào báo cáo chính: mở `lan3.docx` → copy từng mục từ file này dán sang
  (hoặc dùng *Insert → Object → Text from File* để chèn toàn bộ nội dung).

---

## 1️⃣ Quy ước vẽ biểu đồ ca sử dụng (Use Case Diagram)

| Thành phần | Quy ước chuẩn |
| :--- | :--- |
| **Actor** | Hình người que, đặt **ngoài** khung hệ thống (Khách hàng / Nhân viên / Quản trị viên) |
| **Hệ thống** | Hình chữ nhật bao ngoài toàn bộ use case, tên hệ thống ghi ở phía trên |
| **Use case** | Hình **elip**, đặt tên theo cấu trúc **“Động từ + Đối tượng”** (VD: *Đặt món tại bàn*) |
| **Association** (Actor — Use case) | **Nét liền, KHÔNG có mũi tên**, thể hiện actor có tham gia vào use case |
| **`<<include>>`** | **Nét đứt + mũi tên** đi **từ use case chính → use case bắt buộc** (luôn được thực thi) |
| **`<<extend>>`** | **Nét đứt + mũi tên** đi **từ use case mở rộng → use case gốc** (chỉ chạy khi có điều kiện) |
| **Ghi chú (note)** | Khung vàng, ghi **tiền điều kiện / hậu điều kiện** hoặc luồng trạng thái |

⚠️ **Lỗi thường gặp cần tránh**

- Vẽ mũi tên (→) cho quan hệ Actor — Use case → **sai**, phải là đường thẳng không mũi tên.
- Đặt mũi tên `<<include>>` ngược (từ use case được gọi trỏ về use case chính) → **sai**.
- Dùng `<<include>>` cho hành vi **có điều kiện** (VD: *Áp dụng voucher*) → phải dùng `<<extend>>`.
- Đặt actor **bên trong** khung hệ thống → **sai**.

---

## 2️⃣ Quy ước vẽ biểu đồ tuần tự (Sequence Diagram)

| Thành phần | Quy ước chuẩn |
| :--- | :--- |
| **Lifeline** | Đường thẳng đứng có tên `Actor` hoặc `:Đối tượng`; thứ tự trái → phải theo luồng gọi |
| **Thông điệp gọi** | Mũi tên **liền**, đầu đặc (synchronous), kèm số thứ tự tự động (`autonumber`) |
| **Thông điệp phản hồi** | Mũi tên **nét đứt**, thể hiện giá trị trả về |
| **Activation bar** | Thanh chữ nhật trên lifeline, chỉ khoảng thời gian đối tượng đang xử lý |
| **`alt`** | Rẽ nhánh có điều kiện (if / else) |
| **`opt`** | Luồng tùy chọn (chỉ xảy ra khi thỏa điều kiện) |
| **`loop`** | Khối lặp |
| **`== tiêu đề ==`** | Phân đoạn luồng nghiệp vụ lớn (Xem thực đơn → Đặt món → Thanh toán) |

---

## 3️⃣ Bảng đối chiếu biểu đồ ↔ chức năng hệ thống

| # | Biểu đồ ca sử dụng | Biểu đồ tuần tự | API / lớp xử lý chính |
| :-: | :--- | :--- | :--- |
| 00 | `00-use-case-tong-quan` | — | Tổng quan toàn hệ thống |
| 01 | Đặt món tại bàn (quét QR) | `sequence/01-dat-mon-tai-ban` | `POST /api/customer/orders`, `OrderServiceImpl.createCustomerOrder()` |
| 02 | Đặt món giao tận nơi | `sequence/02-dat-mon-giao-tan-noi` | `OrderType.DELIVERY`, `deliveryAddress`, `contactPhone` |
| 03 | Xử lý đơn hàng tại bếp | `sequence/03-xu-ly-don-hang-tai-bep` | `PATCH /api/staff/orders/items/{id}/status`, `deductStockForOrder()` |
| 04 | Thanh toán & giải phóng bàn | `sequence/04-thanh-toan-va-giai-phong-ban` | `POST /api/staff/payment/process`, `PaymentServiceImpl.processStaffPayment()` |
| 05 | Quản lý nhập kho nguyên liệu | `sequence/05-quan-ly-nhap-kho-nguyen-lieu` | `/api/admin/purchase-orders`, `PurchaseOrderServiceImpl.completePurchaseOrder()` |
| 06 | Quản lý thực đơn & định lượng | `sequence/06-quan-ly-thuc-don-va-dinh-luong` | `/api/admin/menu-items`, `/api/admin/recipes` (TPSP) |
| 07 | Đăng nhập / Đăng ký | `sequence/07-dang-nhap-va-dang-ky` | `POST /api/auth/login`, `/api/auth/register`, JWT + Spring Security |
| 08 | Xem báo cáo - thống kê | `sequence/08-xem-bao-cao-thong-ke` | `GET /api/admin/analytics/dashboard`, `AnalyticsServiceImpl` |

---

## 4️⃣ Cách mở / chỉnh sửa / kết xuất ảnh

### Cách A — Dùng extension PlantUML (khuyên dùng khi viết báo cáo)

**VS Code**

1. Cài extension **PlantUML** (`jebbs.plantuml`).
2. Cài **Java JDK 17+** (bắt buộc để PlantUML render).
3. Mở file `.puml` → `Alt + D` để xem trước, `Ctrl + Shift + P` → *PlantUML: Export Current Diagram* để xuất PNG/SVG.

**IntelliJ IDEA / Eclipse**: cài plugin *PlantUML Integration* rồi mở file `.puml` là xem được ngay.

### Cách B — Kết xuất hàng loạt bằng dòng lệnh

```bash
# Cần Java 17+ và file plantuml.jar (tải tại plantuml.com/download)
cd docs/diagrams
java -jar plantuml.jar -tpng -charset UTF-8 "use-case/*.puml"
java -jar plantuml.jar -tpng -charset UTF-8 "sequence/*.puml"
```

Hoặc dùng script có sẵn:

```bash
cd docs/diagrams
./render.sh          # tự tìm plantuml.jar trong thư mục hiện tại hoặc trong PATH
```

> 💡 Ảnh `.png` trong repo đã được kết xuất sẵn với tỉ lệ 2x để dán trực tiếp vào báo cáo
> mà không bị vỡ nét. Muốn ảnh nét hơn nữa, xuất định dạng **SVG** (`-tsvg`).

---

## 5️⃣ Ghi chú kỹ thuật

- File nguồn dùng font **DejaVu Sans** để hiển thị đầy đủ **tiếng Việt có dấu** trên mọi hệ điều hành.
- `skinparam linetype ortho` giúp đường liên kết đi vuông góc, dễ nhìn trong báo cáo in ấn.
- Nội dung thông điệp trong biểu đồ tuần tự bám đúng tên hàm / endpoint trong mã nguồn,
  nên có thể dùng để **đối chiếu khi bảo vệ đồ án**.
