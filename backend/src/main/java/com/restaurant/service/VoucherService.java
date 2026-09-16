package com.restaurant.service;

import com.restaurant.dto.request.VoucherRequest;
import com.restaurant.dto.response.VoucherApplyResponse;
import com.restaurant.dto.response.VoucherResponse;

import java.math.BigDecimal;
import java.util.List;

public interface VoucherService {
    List<VoucherResponse> getAllVouchers();
    VoucherResponse createVoucher(VoucherRequest request);
    VoucherResponse updateVoucher(Long id, VoucherRequest request);
    void deleteVoucher(Long id);

    // Kiểm tra voucher có hợp lệ với đơn hàng orderAmount không, trả về số tiền được giảm (KHÔNG tăng usedCount)
    VoucherApplyResponse validateVoucher(String code, BigDecimal orderAmount);

    // Áp dụng thật (tăng usedCount) - dùng khi đơn hàng đã được thanh toán thành công
    BigDecimal applyVoucherAndIncrementUsage(String code, BigDecimal orderAmount);
}
