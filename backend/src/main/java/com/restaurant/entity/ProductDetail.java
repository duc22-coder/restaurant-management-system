package com.restaurant.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.restaurant.enums.ProductDetailStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Thực thể SPCT (Sản phẩm chi tiết / Biến thể tồn kho / Quy cách kho)
 * Đại diện cho bảng SPCT trong sơ đồ ERD của thầy.
 * Mỗi SP (MenuItem) có 1 hoặc nhiều SPCT (ví dụ: Ly nhỏ, Ly lớn, Chai, Lon, Kg...).
 * SPCT kết nối trực tiếp với Chi tiết đơn nhập (CT ĐN) khi nhập kho.
 */
@Entity
@Table(name = "product_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Liên kết với bảng Sản Phẩm (SP - MenuItem)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    @JsonIgnoreProperties({"details", "recipes", "hibernateLazyInitializer", "handler"})
    private MenuItem menuItem;

    // Mã SPCT / Barcode / SKU
    @Column(name = "sku", nullable = false, unique = true, length = 50)
    private String sku;

    // Quy cách / Tên chi tiết (ví dụ: "Tiêu chuẩn", "Size M", "Size L", "Hộp 1kg", "Lon 330ml")
    @Column(name = "variant_name", nullable = false, length = 100)
    private String variantName;

    // Đơn vị tính: Bát, Đĩa, Ly, Lon, Chai, Kg, Gram, Gói, Suất...
    @Column(name = "unit", nullable = false, length = 30)
    private String unit;

    // Số lượng tồn kho hiện tại
    @Column(name = "stock_quantity", nullable = false)
    @Builder.Default
    private Double stockQuantity = 0.0;

    // Ngưỡng cảnh báo sắp hết hàng
    @Column(name = "min_stock_alert", nullable = false)
    @Builder.Default
    private Double minStockAlert = 5.0;

    // Giá vốn / Giá nhập gần nhất
    @Column(name = "cost_price", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal costPrice = BigDecimal.ZERO;

    // Giá bán theo chi tiết (nếu có, mặc định lấy theo giá SP)
    @Column(name = "selling_price", precision = 12, scale = 2)
    private BigDecimal sellingPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ProductDetailStatus status = ProductDetailStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = ProductDetailStatus.ACTIVE;
        if (stockQuantity == null) stockQuantity = 0.0;
        if (minStockAlert == null) minStockAlert = 5.0;
        if (costPrice == null) costPrice = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (stockQuantity != null && stockQuantity <= 0) {
            status = ProductDetailStatus.OUT_OF_STOCK;
        } else if (status == ProductDetailStatus.OUT_OF_STOCK && stockQuantity != null && stockQuantity > 0) {
            status = ProductDetailStatus.ACTIVE;
        }
    }
}
