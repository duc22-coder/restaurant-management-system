package com.restaurant.controller;

import com.restaurant.dto.request.OrderRequest;
import com.restaurant.dto.response.OrderResponse;
import com.restaurant.security.UserPrincipal;
import com.restaurant.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/orders")
@RequiredArgsConstructor
public class CustomerOrderController {

    private final OrderService orderService;

    // Khách vãng lai (chưa đăng nhập) vẫn đặt được bình thường (userPrincipal = null).
    // Nếu khách đã đăng nhập (có JWT hợp lệ), đơn hàng sẽ tự động gắn vào tài khoản để lưu lịch sử.
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request,
                                                       @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long customerId = userPrincipal != null ? userPrincipal.getId() : null;
        OrderResponse response = orderService.createCustomerOrder(request, customerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Lịch sử đơn hàng của tài khoản đang đăng nhập (bắt buộc phải đăng nhập)
    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(orderService.getMyOrders(userPrincipal.getId()));
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
