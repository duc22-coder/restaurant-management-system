package com.restaurant.controller;

import com.restaurant.dto.request.OrderRequest;
import com.restaurant.dto.response.OrderResponse;
import com.restaurant.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/orders")
@RequiredArgsConstructor
public class CustomerOrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.createCustomerOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<OrderResponse> getOrderByCode(@PathVariable String orderCode) {
        OrderResponse response = orderService.getOrderByOrderCode(orderCode);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/table/{tableId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByTable(@PathVariable Long tableId) {
        List<OrderResponse> responses = orderService.getOrdersByTableId(tableId);
        return ResponseEntity.ok(responses);
    }
}
