package com.restaurant.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Thực thể TPSP (Thành phần sản phẩm / Định lượng công thức món ăn)
 * Đại diện cho bảng TPSP trong sơ đồ ERD của thầy.
 * Định nghĩa 1 Món ăn (SP) cần bao nhiêu nguyên liệu / thành phần (SPCT / Kho) với "Số lượng" (soLuong) cụ thể.
 * Khi khách đặt món và đơn hoàn tất, hệ thống tự động trừ kho nguyên liệu theo TPSP.
 */
@Entity
@Table(name = "product_recipes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRecipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Sản phẩm chính / Món ăn trên thực đơn (SP)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"recipes", "details", "hibernateLazyInitializer", "handler"})
    private MenuItem product;

    // Thành phần nguyên liệu trong kho (SPCT) dùng để chế biến món ăn
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_detail_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ProductDetail ingredientDetail;

    // Thuộc tính quan trọng nhất trong bảng TPSP trên sơ đồ ERD: • Số lượng định mức
    @Column(name = "quantity", nullable = false)
    private Double quantity;

    // Đơn vị tính tiêu hao: gram, ml, cái, lát, muỗng...
    @Column(name = "unit", nullable = false, length = 30)
    private String unit;

    // Ghi chú công thức / cách pha chế
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
