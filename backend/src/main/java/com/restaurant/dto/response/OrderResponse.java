package com.restaurant.dto.response;

import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.OrderType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;
    private String orderCode;
    private OrderType orderType;
    private Long tableId;
    private String tableNumber;
    private String deliveryAddress;
    private String contactPhone;
    private Long customerId;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String customerNote;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}
