package com.restaurant.controller;

import com.restaurant.dto.request.PaymentRequest;
import com.restaurant.dto.response.BankQrResponse;
import com.restaurant.dto.response.PaymentResponse;
import com.restaurant.dto.response.VoucherApplyResponse;
import com.restaurant.service.PaymentService;
import com.restaurant.service.VoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/staff/payment")
@RequiredArgsConstructor
public class StaffPaymentController {

    private final PaymentService paymentService;
    private final VoucherService voucherService;

    @PostMapping("/process")
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processStaffPayment(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/receipt/{orderId}")
    public ResponseEntity<PaymentResponse> getReceipt(@PathVariable Long orderId) {
        PaymentResponse response = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(response);
    }

    // Nhân viên tạo mã QR chuyển khoản khi khách ăn tại bàn muốn thanh toán bằng chuyển khoản thay vì tiền mặt
    @GetMapping("/qr/{orderId}")
    public ResponseEntity<BankQrResponse> getBankQr(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.generateBankQrByOrderId(orderId));
    }

    // Kiểm tra mã voucher có hợp lệ với đơn hàng không, trả về số tiền được giảm thực tế (chưa trừ tiền, chỉ xem trước)
    @GetMapping("/validate-voucher")
    public ResponseEntity<VoucherApplyResponse> validateVoucher(
            @RequestParam String code,
            @RequestParam BigDecimal orderAmount) {
        return ResponseEntity.ok(voucherService.validateVoucher(code, orderAmount));
    }
}
