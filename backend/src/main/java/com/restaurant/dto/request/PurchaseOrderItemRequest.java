package com.restaurant.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderItemRequest {

    @NotNull(message = "Mặt hàng SPCT không được để trống")
    private Long productDetailId;

    @NotNull(message = "Số lượng nhập không được để trống")
    @Positive(message = "Số lượng nhập phải lớn hơn 0")
    private Double quantity;

    @NotNull(message = "Đơn giá nhập không được để trống")
    @Positive(message = "Đơn giá nhập phải lớn hơn 0")
    private BigDecimal unitPrice;

    private String note;
}
