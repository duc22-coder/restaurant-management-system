package com.restaurant.dto.response;

import com.restaurant.enums.ProductDetailStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetailResponse {

    private Long id;
    private Long menuItemId;
    private String menuItemName;
    private String sku;
    private String variantName;
    private String unit;
    private Double stockQuantity;
    private Double minStockAlert;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private ProductDetailStatus status;
    private boolean isLowStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
