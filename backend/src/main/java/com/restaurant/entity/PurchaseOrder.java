package com.restaurant.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.restaurant.enums.PurchaseOrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Thực thể ĐNP (Đơn nhập / Phiếu nhập kho)
 * Đại diện cho bảng ĐNP / PNK trong sơ đồ ERD của thầy.
 * Quản lý các phiếu nhập hàng vào kho do Nhân viên/Thủ kho (TK) thực hiện.
 */
@Entity
@Table(name = "purchase_orders", indexes = {
        @Index(name = "idx_purchase_order_code", columnList = "code"),
        @Index(name = "idx_purchase_order_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mã phiếu nhập duy nhất: ví dụ PN-20261001-001
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    // Nhân viên / Người lập phiếu (liên kết với TK - User trong sơ đồ ERD)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User creator;

    // Nhà cung cấp / Nguồn hàng
    @Column(name = "supplier_name", nullable = false, length = 150)
    private String supplierName;

    @Column(name = "supplier_phone", length = 20)
    private String supplierPhone;

    @Column(name = "supplier_address", columnDefinition = "TEXT")
    private String supplierAddress;

    // Trạng thái phiếu nhập: PENDING (Chờ duyệt/Nhập dở dang), COMPLETED (Đã nhập kho - cộng tồn), CANCELLED (Hủy)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PurchaseOrderStatus status = PurchaseOrderStatus.PENDING;

    // Tổng tiền của phiếu nhập
    @Column(name = "total_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    // 1 ĐNP có nhiều CT ĐN (Chi tiết đơn nhập)
    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("purchaseOrder")
    @Builder.Default
    private List<PurchaseOrderItem> items = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = PurchaseOrderStatus.PENDING;
        if (totalAmount == null) totalAmount = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
