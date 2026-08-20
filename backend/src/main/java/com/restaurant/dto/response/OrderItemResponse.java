package com.restaurant.dto.response;

import com.restaurant.enums.OrderItemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {

    private Long id;
    private Long menuItemId;
    private String menuItemName;
    private String menuItemImage;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subtotal;
    private String note;
    private OrderItemStatus status;
}
