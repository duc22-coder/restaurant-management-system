package com.restaurant.controller;

import com.restaurant.dto.request.PurchaseOrderRequest;
import com.restaurant.dto.response.PurchaseOrderResponse;
import com.restaurant.enums.PurchaseOrderStatus;
import com.restaurant.security.UserPrincipal;
import com.restaurant.service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/purchases")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class AdminPurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    public ResponseEntity<List<PurchaseOrderResponse>> getAll(
            @RequestParam(required = false) PurchaseOrderStatus status) {
        if (status != null) {
            return ResponseEntity.ok(purchaseOrderService.getPurchaseOrdersByStatus(status));
        }
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrderById(id));
    }

    @PostMapping
    public ResponseEntity<PurchaseOrderResponse> create(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody PurchaseOrderRequest request) {
        Long creatorId = (userPrincipal != null) ? userPrincipal.getId() : 1L;
        return ResponseEntity.status(HttpStatus.CREATED).body(purchaseOrderService.createPurchaseOrder(request, creatorId));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<PurchaseOrderResponse> complete(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.completePurchaseOrder(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<PurchaseOrderResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.cancelPurchaseOrder(id));
    }
}
