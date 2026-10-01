package com.restaurant.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderItemResponse {

    private Long id;
    private Long productDetailId;
    private String productDetailSku;
    private String productDetailName;
    private String unit;
    private Double quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String note;
}
