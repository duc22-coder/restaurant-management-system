# Nguồn và cách dựng báo cáo Chương 3

## Các tệp chính

- `../BAO_CAO_CHUONG3.docx`: bản Word cần sử dụng/nộp.
- `../BAO_CAO_CHUONG3.md`: nội dung văn bản tương ứng.
- `uml/*.puml`: 13 biểu đồ UML có thể sửa bằng văn bản.
- `uml/_theme.puml`: font/ký hiệu/trình bày chung.
- `images/*.png`: ảnh được render và nhúng trong Word, không phải ảnh AI.

Sửa nguồn Markdown/PlantUML rồi dựng lại, tránh chỉ sửa ảnh nhúng trong DOCX và làm hai bản lệch nhau. Số hình thống nhất `3.1`–`3.13`; UC01/UC02/UC03 tương ứng đăng nhập, đặt món và thu ngân.

## Dựng lại

Yêu cầu Python 3.10+, Java và Graphviz (`dot`); font DejaVu Sans để thể hiện đầy đủ tiếng Việt. Java/Graphviz có thể cài bằng trình quản lý gói của hệ điều hành. Không cần khởi động ứng dụng, database, hoặc truy cập dịch vụ PlantUML online.

Từ thư mục gốc repository:

```bash
python -m pip install -r docs/requirements.txt
python docs/bao-cao/scripts/render_uml.py --check
python docs/bao-cao/scripts/render_uml.py
python docs/md2docx.py
python -m unittest discover -s docs/tests -v
```

`plantuml-local-client` cung cấp JAR. Nếu có sẵn PlantUML khác, có thể chỉ định `PLANTUML_JAR` hoặc dùng lệnh `plantuml` trên PATH. Java lấy từ PATH/`JAVA_HOME` (cũng nhận gói `jdk4py` nếu đã cài). PlantUML hỗ trợ `GRAPHVIZ_DOT` khi `dot` nằm ở vị trí riêng.

Hai lệnh cũ vẫn dùng được:

```bash
python docs/bao-cao/scripts/ve-bieu-do-usecase.py
python docs/bao-cao/scripts/ve-bieu-do-uml.py
```

`md2docx.py` có `--source` và `--output` để dựng bản thử. Thiếu ảnh, sai bảng hoặc ảnh hỏng sẽ dừng trước khi ghi đè bản Word hiện có. Ảnh được giữ đúng tỷ lệ, có alt text và một caption phía dưới. Các trang tuần tự dùng A4 ngang; văn bản và các sơ đồ còn lại dùng A4 dọc. Directive `<!-- pagebreak -->`, `<!-- landscape -->`, `<!-- portrait -->` điều khiển bố cục.

## Nội dung đã lược bỏ / sửa

| Bản cũ | Bản hiện tại |
| --- | --- |
| Lặp caption trước ảnh và tiêu đề trong ảnh | Một caption dưới ảnh; sơ đồ không chứa số hình trùng |
| Đánh số Hình 2.x trong tài liệu Chương 3 | Hình 3.x và mục 3.x thống nhất |
| “Lớp tổng quan” thực chất là các package kiến trúc | Loại bỏ; kiến trúc đặt trong Component Diagram |
| Bảng dài liệt kê thuộc tính, quan hệ DB trùng với lớp | Thể hiện trực tiếp trên hai Class Diagram (bán hàng và kho), bao phủ 12 Entity |
| Các phương thức giả như `calculateTotal`, `isAvailable` trên Entity | Không đưa phương thức không có trong mã nguồn vào biểu đồ lớp |
| QR bàn là include bắt buộc của đặt món | Chọn bàn/quét QR là các cách xác định bàn; đặt món không phụ thuộc QR |
| Yêu cầu tính tiền include xem QR | Hai thao tác độc lập; yêu cầu tính tiền chỉ đổi bàn thành PAYING |
| Voucher luôn là include | Voucher là extend có điều kiện trong Thu ngân; không có voucher trong OrderRequest |
| Sequence đặt phản hồi thành công vào nhánh lỗi | alt tách đúng hai nhánh; opt chỉ bao hành vi tùy chọn |
| Mỗi đơn luôn có một Payment/bàn/khách | Payment, bàn, khách và staff là 0..1 phía tham chiếu tương ứng |
| Payment chuyển Order thành PAID, tự trừ kho | Mô tả đúng COMPLETED; trừ kho ở `OrderServiceImpl.updateOrderStatus` |
| VietQR được gọi từ backend như một ngân hàng/callback | Backend lập URL, trình duyệt tải ảnh; nhân viên xác nhận thủ công |
| Docker/Nginx được mô tả đã có HTTPS | HTTP theo cấu hình hiện tại; chỉ tải VietQR là HTTPS |
| Hướng dẫn CRUD/tổng kết kho lặp lại, dòng “Hết nội dung” | Loại bỏ; giữ các điểm đối chiếu triển khai có ảnh hưởng đến biểu đồ |
| XML Word lồng pPr và đặt b/font trực tiếp dưới run | Dựng bằng python-docx; bảng có tiêu đề lặp, không tách hàng qua trang |

## Căn cứ kiểm tra nghiệp vụ

- `backend/src/main/java/com/restaurant/config/SecurityConfig.java`: quyền CUSTOMER/public, STAFF/ADMIN và ADMIN.
- `service/impl/AuthServiceImpl.java`, `security/CustomUserDetailsService.java`, `security/UserPrincipal.java`: đăng nhập và trạng thái tài khoản.
- `service/impl/OrderServiceImpl.java`, `dto/request/OrderRequest.java`: tạo đơn, điều kiện bàn/địa chỉ, transaction và thời điểm trừ kho.
- `service/impl/PaymentServiceImpl.java`, `service/impl/VoucherServiceImpl.java`: ghi nhận thanh toán, voucher, QR và giải phóng bàn.
- `service/impl/PurchaseOrderServiceImpl.java`: duyệt phiếu mới cộng kho.
- `entity/*.java`: lớp, kiểu thuộc tính, tính nullable, cascade/orphanRemoval và cardinality.
- `frontend/src/pages/customer/CustomerMenuPage.jsx`, `frontend/src/pages/staff/StaffDashboard.jsx`: kiểm tra thông tin, tải QR, chọn phương thức và xác nhận.
- `docker-compose.yml`, `frontend/nginx.conf`: node, artifact, giao thức và cổng thực tế.

Đường dẫn tương đối `service/...`, `entity/...` ở trên thuộc `backend/src/main/java/com/restaurant/`.

**Giới hạn đối chiếu tài liệu tham khảo:** cuộc trò chuyện có thông báo đính kèm `OOAD_report.pdf`, nhưng tệp không truy cập được tại đường dẫn upload trong môi trường làm việc. Bản sửa này dựa trên quy ước UML và mã nguồn đã kiểm tra, không khẳng định đã đọc/đối chiếu PDF đó. Không chèn nội dung giáo trình hoặc nội dung giả định từ PDF vào báo cáo.
