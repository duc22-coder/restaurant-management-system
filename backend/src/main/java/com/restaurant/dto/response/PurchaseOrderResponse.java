package com.restaurant.dto.response;

import com.restaurant.enums.PurchaseOrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderResponse {

    private Long id;
    private String code;
    private Long creatorId;
    private String creatorName;
    private String supplierName;
    private String supplierPhone;
    private String supplierAddress;
    private PurchaseOrderStatus status;
    private BigDecimal totalAmount;
    private String note;
    private List<PurchaseOrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
