package com.restaurant.dto.request;

import com.restaurant.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotNull(message = "ID đơn hàng không được để trống")
    private Long orderId;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;

    // Mã voucher/giảm giá áp dụng (không bắt buộc)
    private String voucherCode;

    @DecimalMin(value = "0", message = "Số tiền giảm giá không được âm")
    private BigDecimal discountAmount;
}
