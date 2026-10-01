package com.restaurant.service.impl;

import com.restaurant.dto.request.OrderItemRequest;
import com.restaurant.dto.request.OrderRequest;
import com.restaurant.dto.response.OrderItemResponse;
import com.restaurant.dto.response.OrderResponse;
import com.restaurant.entity.MenuItem;
import com.restaurant.entity.Order;
import com.restaurant.entity.OrderItem;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.entity.User;
import com.restaurant.enums.MenuItemStatus;
import com.restaurant.enums.OrderItemStatus;
import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.OrderType;
import com.restaurant.enums.TableStatus;
import com.restaurant.repository.MenuItemRepository;
import com.restaurant.repository.OrderItemRepository;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.ProductDetailRepository;
import com.restaurant.repository.ProductRecipeRepository;
import com.restaurant.repository.RestaurantTableRepository;
import com.restaurant.repository.UserRepository;
import com.restaurant.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final RestaurantTableRepository tableRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final ProductRecipeRepository productRecipeRepository;
    private final ProductDetailRepository productDetailRepository;

    @Override
    @Transactional
    public OrderResponse createCustomerOrder(OrderRequest request, Long customerId) {
        // 1. Xác định hình thức đặt món (mặc định DINE_IN nếu không truyền lên - giữ hành vi cũ cho khách quét QR)
        OrderType orderType = request.getOrderType() != null ? request.getOrderType() : OrderType.DINE_IN;

        RestaurantTable table = null;
        if (orderType == OrderType.DINE_IN) {
            // Ăn tại bàn: bắt buộc phải có bàn hợp lệ
            if (request.getTableId() == null) {
                throw new RuntimeException("Vui lòng chọn bàn khi đặt món ăn tại chỗ!");
            }
            table = tableRepository.findById(request.getTableId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn với ID: " + request.getTableId()));

            // Cập nhật trạng thái bàn sang OCCUPIED (Đang có khách) nếu bàn đang trống
            if (table.getStatus() == TableStatus.AVAILABLE) {
                table.setStatus(TableStatus.OCCUPIED);
                tableRepository.save(table);
            }
        } else if (orderType == OrderType.DELIVERY) {
            // Giao tận nơi: bắt buộc phải có địa chỉ giao hàng
            if (request.getDeliveryAddress() == null || request.getDeliveryAddress().isBlank()) {
                throw new RuntimeException("Vui lòng nhập địa chỉ giao hàng!");
            }
        }
        // PICKUP (đến lấy): không cần bàn, không cần địa chỉ

        // 2. Sinh mã Đơn hàng ngẫu nhiên độc nhất (Mẫu: ORD-TIMESTAMP-RANDOM6)
        // Dùng 6 chữ số ngẫu nhiên (thay vì 4) để giảm rủi ro trùng mã khi nhiều đơn được tạo cùng lúc (unique constraint).
        String orderCode = "ORD-" + (System.currentTimeMillis() / 1000) + "-" + String.format("%06d", (int) (Math.random() * 1_000_000));

        // 3. Nếu khách đã đăng nhập (có customerId từ JWT) thì gắn đơn hàng vào tài khoản để lưu lịch sử
        User customer = null;
        if (customerId != null) {
            customer = userRepository.findById(customerId).orElse(null);
        }

        // 4. Khởi tạo đối tượng Order
        Order order = Order.builder()
                .orderCode(orderCode)
                .orderType(orderType)
                .table(table)
                .deliveryAddress(orderType == OrderType.DELIVERY ? request.getDeliveryAddress() : null)
                .contactPhone(request.getContactPhone())
                .customer(customer)
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
    public List<OrderResponse> getMyOrders(Long customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllActiveOrders() {
        return orderRepository.findAllWithDetails().stream()
                .filter(order -> order.getStatus() != OrderStatus.COMPLETED && order.getStatus() != OrderStatus.CANCELLED)
                .sorted(Comparator.comparing(Order::getCreatedAt))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders(OrderStatus status) {
        List<Order> orders = status != null ? orderRepository.findByStatus(status) : orderRepository.findAllWithDetails();
        return orders.stream()
                .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
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

        // Trừ tồn kho nguyên liệu theo công thức TPSP khi đơn sang PROCESSING hoặc COMPLETED
        if ((status == OrderStatus.PROCESSING || status == OrderStatus.COMPLETED) && !Boolean.TRUE.equals(order.getStockDeducted())) {
            deductStockForOrder(order);
        }

        // Tự động giải phóng bàn nếu đơn hàng bị hủy hoặc hoàn tất thanh toán (chỉ áp dụng đơn DINE_IN có bàn)
        if ((status == OrderStatus.COMPLETED || status == OrderStatus.CANCELLED) && order.getTable() != null) {
            List<Order> remainingActive = orderRepository.findActiveOrdersByTableId(order.getTable().getId());
            if (remainingActive.isEmpty()) {
                RestaurantTable table = order.getTable();
                table.setStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);
            }
        }

        return mapToResponse(updated);
    }

    private void deductStockForOrder(Order order) {
        if (Boolean.TRUE.equals(order.getStockDeducted())) {
            return;
        }
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                if (item.getMenuItem() != null) {
                    List<com.restaurant.entity.ProductRecipe> recipes = productRecipeRepository.findByProductId(item.getMenuItem().getId());
                    for (com.restaurant.entity.ProductRecipe recipe : recipes) {
                        com.restaurant.entity.ProductDetail detail = recipe.getIngredientDetail();
                        if (detail != null) {
                            double needed = (recipe.getQuantity() != null ? recipe.getQuantity() : 0.0) * (item.getQuantity() != null ? item.getQuantity() : 1);
                            double current = detail.getStockQuantity() != null ? detail.getStockQuantity() : 0.0;
                            double after = Math.max(0.0, current - needed);
                            detail.setStockQuantity(after);
                            if (after <= 0) {
                                detail.setStatus(com.restaurant.enums.ProductDetailStatus.OUT_OF_STOCK);
                            }
                            productDetailRepository.save(detail);
                            log.info("Trừ kho TPSP cho món '{}' - Nguyên liệu '{}': {} - {} = {}",
                                    item.getMenuItem().getName(), detail.getVariantName(), current, needed, after);
                        }
                    }
                }
            }
        }
        order.setStockDeducted(true);
        orderRepository.save(order);
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
                .orderType(order.getOrderType())
                .tableId(order.getTable() != null ? order.getTable().getId() : null)
                .tableNumber(order.getTable() != null ? order.getTable().getTableNumber() : null)
                .deliveryAddress(order.getDeliveryAddress())
                .contactPhone(order.getContactPhone())
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .customerNote(order.getNote())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
