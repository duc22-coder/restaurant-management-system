package com.restaurant.service;

import com.restaurant.dto.request.OrderRequest;
import com.restaurant.dto.response.OrderItemResponse;
import com.restaurant.dto.response.OrderResponse;
import com.restaurant.enums.OrderItemStatus;
import com.restaurant.enums.OrderStatus;

import java.util.List;

public interface OrderService {
    OrderResponse createCustomerOrder(OrderRequest request, Long customerId);
    OrderResponse getOrderByOrderCode(String orderCode);
    List<OrderResponse> getOrdersByTableId(Long tableId);
    List<OrderResponse> getMyOrders(Long customerId);
    List<OrderResponse> getAllActiveOrders();
    List<OrderResponse> getAllOrders(OrderStatus status);
    OrderResponse updateOrderStatus(Long orderId, OrderStatus status);
    OrderItemResponse updateOrderItemStatus(Long orderItemId, OrderItemStatus status);
}
