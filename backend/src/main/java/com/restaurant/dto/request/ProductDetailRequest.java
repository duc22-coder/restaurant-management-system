package com.restaurant.dto.request;

import com.restaurant.enums.ProductDetailStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetailRequest {

    @NotNull(message = "Sản phẩm (món ăn) không được để trống")
    private Long menuItemId;

    @NotBlank(message = "Mã SKU/Barcode không được để trống")
    private String sku;

    @NotBlank(message = "Tên quy cách/biến thể không được để trống")
    private String variantName;

    @NotBlank(message = "Đơn vị tính không được để trống")
    private String unit;

    private Double stockQuantity;

    private Double minStockAlert;

    private BigDecimal costPrice;

    private BigDecimal sellingPrice;

    private ProductDetailStatus status;
}
