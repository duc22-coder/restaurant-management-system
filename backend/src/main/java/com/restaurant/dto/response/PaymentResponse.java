package com.restaurant.dto.response;

import com.restaurant.enums.PaymentMethod;
import com.restaurant.enums.PaymentStatus;
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
public class PaymentResponse {

    private Long id;
    private Long orderId;
    private String orderCode;
    private Long tableId;
    private String tableNumber;
    private BigDecimal amount;
    private String voucherCode;
    private BigDecimal discountAmount;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private LocalDateTime paidAt;
    private List<OrderItemResponse> items;
}
