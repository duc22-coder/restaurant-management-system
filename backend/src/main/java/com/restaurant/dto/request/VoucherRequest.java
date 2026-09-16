package com.restaurant.dto.request;

import com.restaurant.enums.DiscountType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherRequest {

    @NotBlank(message = "Mã voucher không được để trống")
    private String code;

    private String description;

    @NotNull(message = "Loại giảm giá không được để trống")
    private DiscountType discountType;

    @NotNull(message = "Giá trị giảm giá không được để trống")
    @DecimalMin(value = "0.01", message = "Giá trị giảm giá phải lớn hơn 0")
    private BigDecimal discountValue;

    private BigDecimal maxDiscountAmount;

    @DecimalMin(value = "0", message = "Đơn tối thiểu không được âm")
    private BigDecimal minOrderAmount;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @Min(value = 1, message = "Số lần sử dụng tối thiểu là 1")
    private Integer usageLimit;

    private Boolean active;
}
