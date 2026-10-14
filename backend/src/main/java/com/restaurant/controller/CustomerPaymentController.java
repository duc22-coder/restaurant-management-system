package com.restaurant.controller;

import com.restaurant.dto.response.BankQrResponse;
import com.restaurant.service.PaymentService;
import com.restaurant.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/customer/payment")
@RequiredArgsConstructor
public class CustomerPaymentController {

    private final PaymentService paymentService;

    @PostMapping("/request")
    public ResponseEntity<Map<String, String>> requestPayment(@RequestParam Long tableId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) return ResponseEntity.status(401).build();
        paymentService.requestCustomerPayment(tableId, userPrincipal.getId());
        return ResponseEntity.ok(Map.of("message", "Đã gửi yêu cầu thanh toán tới nhân viên phục vụ!"));
    }

    // Sinh mã QR chuyển khoản ngân hàng (VietQR) để khách tự thanh toán online bằng app ngân hàng bất kỳ
    @GetMapping("/qr/{orderCode}")
    public ResponseEntity<BankQrResponse> getBankQr(@PathVariable String orderCode,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(paymentService.generateBankQr(orderCode, userPrincipal.getId()));
    }
}
