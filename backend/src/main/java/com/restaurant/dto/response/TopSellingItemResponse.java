package com.restaurant.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopSellingItemResponse {

    private Long menuItemId;
    private String menuItemName;
    private String menuItemImage;
    private String categoryName;
    private Long quantitySold;
    private BigDecimal revenueGenerated;
}
