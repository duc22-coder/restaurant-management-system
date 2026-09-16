package com.restaurant.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherApplyResponse {
    private String code;
    private BigDecimal discountAmount;   // Số tiền được giảm thực tế (đã tính toán và áp giới hạn)
    private BigDecimal finalAmount;      // Số tiền phải trả sau khi giảm
}
