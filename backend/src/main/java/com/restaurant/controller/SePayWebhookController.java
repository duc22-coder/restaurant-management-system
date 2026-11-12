package com.restaurant.controller;

import com.restaurant.dto.request.SePayWebhookRequest;
import com.restaurant.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class SePayWebhookController {

    private final PaymentService paymentService;

    @Value("${payment.sepay.api-key:}")
    private String apiKey;

    @PostMapping("/sepay")
    public ResponseEntity<Map<String, Object>> receiveSePayWebhook(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) SePayWebhookRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            return ResponseEntity.status(503).body(Map.of("success", false, "message", "SePay webhook is not configured"));
        }

        String prefix = "Apikey ";
        if (authorization == null || !authorization.startsWith(prefix)
                || !MessageDigest.isEqual(
                    apiKey.getBytes(StandardCharsets.UTF_8),
                    authorization.substring(prefix.length()).getBytes(StandardCharsets.UTF_8))) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid webhook credentials"));
        }

        if (request == null || request.id() == null || request.transferType() == null
                || !"in".equalsIgnoreCase(request.transferType())
                || request.transferAmount() == null || request.content() == null) {
            return ResponseEntity.ok(Map.of("success", false, "message", "Invalid incoming transfer payload"));
        }

        try {
            paymentService.processSePayWebhook(
                    String.valueOf(request.id()), request.content(), request.transferAmount());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.ok(Map.of("success", false, "message", exception.getMessage()));
        }
    }
}
