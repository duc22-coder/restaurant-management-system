package com.restaurant.service.impl;

import com.restaurant.dto.response.DashboardStatsResponse;
import com.restaurant.dto.response.TopSellingItemResponse;
import com.restaurant.entity.MenuItem;
import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.PaymentMethod;
import com.restaurant.enums.TableStatus;
import com.restaurant.repository.OrderItemRepository;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.PaymentRepository;
import com.restaurant.repository.RestaurantTableRepository;
import com.restaurant.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final RestaurantTableRepository tableRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        // 1. Tổng doanh thu
        BigDecimal totalRevenue = paymentRepository.calculateTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        // 2. Tổng số đơn hàng & Số đơn hoàn thành
        long totalOrders = orderRepository.count();
        long completedOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .count();

        double successRate = totalOrders > 0 ? ((double) completedOrders / totalOrders) * 100.0 : 100.0;

        // 3. Số bàn đang phục vụ khách
        long activeTablesCount = tableRepository.findAll().stream()
                .filter(t -> t.getStatus() == TableStatus.OCCUPIED || t.getStatus() == TableStatus.PAYING)
                .count();

        // 4. Top 5 món ăn bán chạy nhất
        List<Object[]> topItemsData = orderItemRepository.findTopSellingItems();
        List<TopSellingItemResponse> topSellingItems = new ArrayList<>();

        int limit = Math.min(topItemsData.size(), 5);
        for (int i = 0; i < limit; i++) {
            Object[] row = topItemsData.get(i);
            MenuItem menuItem = (MenuItem) row[0];
            Long quantitySold = (Long) row[1];
            BigDecimal revenue = (BigDecimal) row[2];

            topSellingItems.add(TopSellingItemResponse.builder()
                    .menuItemId(menuItem.getId())
                    .menuItemName(menuItem.getName())
                    .menuItemImage(menuItem.getImage())
                    .categoryName(menuItem.getCategory() != null ? menuItem.getCategory().getName() : "Khác")
                    .quantitySold(quantitySold)
                    .revenueGenerated(revenue)
                    .build());
        }

        // 5. Cơ cấu doanh thu theo phương thức thanh toán
        List<Object[]> paymentMethodData = paymentRepository.getRevenueGroupedByPaymentMethod();
        Map<String, BigDecimal> revenueByPaymentMethod = new HashMap<>();
        revenueByPaymentMethod.put("CASH", BigDecimal.ZERO);
        revenueByPaymentMethod.put("BANK_TRANSFER", BigDecimal.ZERO);
        revenueByPaymentMethod.put("VNPAY", BigDecimal.ZERO);

        for (Object[] row : paymentMethodData) {
            PaymentMethod method = (PaymentMethod) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            if (method != null && amount != null) {
                revenueByPaymentMethod.put(method.name(), amount);
            }
        }

        return DashboardStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .activeTablesCount(activeTablesCount)
                .successRate(Math.round(successRate * 10.0) / 10.0)
                .topSellingItems(topSellingItems)
                .revenueByPaymentMethod(revenueByPaymentMethod)
                .build();
    }
}
