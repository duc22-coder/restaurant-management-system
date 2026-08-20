package com.restaurant.service.impl;

import com.restaurant.dto.request.PaymentRequest;
import com.restaurant.dto.response.OrderItemResponse;
import com.restaurant.dto.response.PaymentResponse;
import com.restaurant.entity.Order;
import com.restaurant.entity.OrderItem;
import com.restaurant.entity.Payment;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.PaymentStatus;
import com.restaurant.enums.TableStatus;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.PaymentRepository;
import com.restaurant.repository.RestaurantTableRepository;
import com.restaurant.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;

    @Override
    @Transactional
    public void requestCustomerPayment(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn với ID: " + tableId));

        table.setStatus(TableStatus.PAYING);
        tableRepository.save(table);
    }

    @Override
    @Transactional
    public PaymentResponse processStaffPayment(PaymentRequest request) {
        // 1. Tìm Đơn hàng
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + request.getOrderId()));

        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new RuntimeException("Đơn hàng này đã được thanh toán trước đó!");
        }

        // 2. Tạo hoặc Cập nhật bản ghi Thanh toán
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElse(Payment.builder().order(order).build());

        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        // 3. Đánh dấu Đơn hàng thành COMPLETED
        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        // 4. Giải phóng bàn ăn về AVAILABLE nếu không còn đơn chưa hoàn thành nào
        RestaurantTable table = order.getTable();
        List<Order> remainingActive = orderRepository.findActiveOrdersByTableId(table.getId());
        if (remainingActive.isEmpty()) {
            table.setStatus(TableStatus.AVAILABLE);
            tableRepository.save(table);
        }


        return mapToResponse(savedPayment, order);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));

        Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);

        if (payment != null) {
            return mapToResponse(payment, order);
        }

        // Tạo dữ liệu xem trước Hóa đơn khi chưa bấm thanh toán
        return PaymentResponse.builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .tableId(order.getTable().getId())
                .tableNumber(order.getTable().getTableNumber())
                .amount(order.getTotalAmount())
                .status(PaymentStatus.PENDING)
                .items(mapOrderItems(order))
                .build();
    }

    private PaymentResponse mapToResponse(Payment payment, Order order) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .tableId(order.getTable().getId())
                .tableNumber(order.getTable().getTableNumber())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .paidAt(payment.getPaidAt())
                .items(mapOrderItems(order))
                .build();
    }

    private List<OrderItemResponse> mapOrderItems(Order order) {
        List<OrderItemResponse> itemResponses = new ArrayList<>();
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                BigDecimal subtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                itemResponses.add(OrderItemResponse.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItem().getId())
                        .menuItemName(item.getMenuItem().getName())
                        .menuItemImage(item.getMenuItem().getImage())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subtotal(subtotal)
                        .note(item.getNote())
                        .status(item.getStatus())
                        .build());
            }
        }
        return itemResponses;
    }
}
