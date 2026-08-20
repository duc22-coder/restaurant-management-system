package com.restaurant.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Long completedOrders;
    private Long activeTablesCount;
    private Double successRate;
    private List<TopSellingItemResponse> topSellingItems;
    private Map<String, BigDecimal> revenueByPaymentMethod;
}
