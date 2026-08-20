package com.restaurant.controller;

import com.restaurant.dto.request.PaymentRequest;
import com.restaurant.dto.response.PaymentResponse;
import com.restaurant.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff/payment")
@RequiredArgsConstructor
public class StaffPaymentController {

    private final PaymentService paymentService;

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
}
