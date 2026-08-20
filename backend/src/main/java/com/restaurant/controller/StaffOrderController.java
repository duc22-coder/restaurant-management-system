package com.restaurant.controller;

import com.restaurant.dto.response.OrderItemResponse;
import com.restaurant.dto.response.OrderResponse;
import com.restaurant.enums.OrderItemStatus;
import com.restaurant.enums.OrderStatus;
import com.restaurant.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff/orders")
@RequiredArgsConstructor
public class StaffOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllActiveOrders() {
        List<OrderResponse> orders = orderService.getAllActiveOrders();
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        OrderResponse response = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/items/{orderItemId}/status")
    public ResponseEntity<OrderItemResponse> updateOrderItemStatus(
            @PathVariable Long orderItemId,
            @RequestParam OrderItemStatus status) {
        OrderItemResponse response = orderService.updateOrderItemStatus(orderItemId, status);
        return ResponseEntity.ok(response);
    }
}
