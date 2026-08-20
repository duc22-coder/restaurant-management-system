package com.restaurant.service.impl;

import com.restaurant.dto.request.OrderItemRequest;
import com.restaurant.dto.request.OrderRequest;
import com.restaurant.dto.response.OrderItemResponse;
import com.restaurant.dto.response.OrderResponse;
import com.restaurant.entity.MenuItem;
import com.restaurant.entity.Order;
import com.restaurant.entity.OrderItem;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.enums.MenuItemStatus;
import com.restaurant.enums.OrderItemStatus;
import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.TableStatus;
import com.restaurant.repository.MenuItemRepository;
import com.restaurant.repository.OrderItemRepository;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.RestaurantTableRepository;
import com.restaurant.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final RestaurantTableRepository tableRepository;
    private final MenuItemRepository menuItemRepository;

    @Override
    @Transactional
    public OrderResponse createCustomerOrder(OrderRequest request) {
        // 1. Kiểm tra Bàn tồn tại
        RestaurantTable table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn với ID: " + request.getTableId()));

        // 2. Cập nhật trạng thái bàn sang OCCUPIED (Đang có khách) nếu bàn đang trống
        if (table.getStatus() == TableStatus.AVAILABLE) {
            table.setStatus(TableStatus.OCCUPIED);
            tableRepository.save(table);
        }

        // 3. Sinh mã Đơn hàng ngẫu nhiên độc nhất (Mẫu: ORD-TIMESTAMP-RANDOM4)
        String orderCode = "ORD-" + (System.currentTimeMillis() / 1000) + "-" + String.format("%04d", (int)(Math.random() * 10000));

        // 4. Khởi tạo đối tượng Order
        Order order = Order.builder()
                .orderCode(orderCode)
                .table(table)
                .status(OrderStatus.PENDING)
                .note(request.getCustomerNote())
                .totalAmount(BigDecimal.ZERO)
                .orderItems(new ArrayList<>())
                .build();

        Order savedOrder = orderRepository.save(order);

        // 5. Thêm các OrderItem từ giỏ hàng
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> itemsToSave = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn với ID: " + itemReq.getMenuItemId()));

            if (menuItem.getStatus() != MenuItemStatus.AVAILABLE) {
                throw new RuntimeException("Món ăn '" + menuItem.getName() + "' hiện đang tạm dừng bán!");
            }

            BigDecimal subtotal = menuItem.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .menuItem(menuItem)
                    .quantity(itemReq.getQuantity())
                    .price(menuItem.getPrice())
                    .note(itemReq.getNote())
                    .status(OrderItemStatus.PENDING)
                    .build();

            itemsToSave.add(orderItem);
        }

        orderItemRepository.saveAll(itemsToSave);
        savedOrder.setOrderItems(itemsToSave);
        savedOrder.setTotalAmount(totalAmount);
        orderRepository.save(savedOrder);

        return mapToResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderCode(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + orderCode));
        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByTableId(Long tableId) {
        return orderRepository.findActiveOrdersByTableId(tableId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllActiveOrders() {
        return orderRepository.findAll().stream()
                .filter(order -> order.getStatus() != OrderStatus.COMPLETED && order.getStatus() != OrderStatus.CANCELLED)
                .sorted(Comparator.comparing(Order::getCreatedAt))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));

        order.setStatus(status);
        Order updated = orderRepository.save(order);

        // Tự động giải phóng bàn nếu đơn hàng bị hủy hoặc hoàn tất thanh toán
        if (status == OrderStatus.COMPLETED || status == OrderStatus.CANCELLED) {
            List<Order> remainingActive = orderRepository.findActiveOrdersByTableId(order.getTable().getId());
            if (remainingActive.isEmpty()) {
                RestaurantTable table = order.getTable();
                table.setStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);
            }
        }

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public OrderItemResponse updateOrderItemStatus(Long orderItemId, OrderItemStatus status) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết món ăn với ID: " + orderItemId));

        item.setStatus(status);
        OrderItem updated = orderItemRepository.save(item);

        // Nếu món ăn được bếp nhận chế biến, tự động đổi trạng thái đơn hàng sang PROCESSING
        Order order = item.getOrder();
        if (status == OrderItemStatus.PREPARING && order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.PROCESSING);
            orderRepository.save(order);
        }

        BigDecimal subtotal = updated.getPrice().multiply(BigDecimal.valueOf(updated.getQuantity()));
        return OrderItemResponse.builder()
                .id(updated.getId())
                .menuItemId(updated.getMenuItem().getId())
                .menuItemName(updated.getMenuItem().getName())
                .menuItemImage(updated.getMenuItem().getImage())
                .quantity(updated.getQuantity())
                .price(updated.getPrice())
                .subtotal(subtotal)
                .note(updated.getNote())
                .status(updated.getStatus())
                .build();
    }

    private OrderResponse mapToResponse(Order order) {
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

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .tableId(order.getTable().getId())
                .tableNumber(order.getTable().getTableNumber())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .customerNote(order.getNote())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
