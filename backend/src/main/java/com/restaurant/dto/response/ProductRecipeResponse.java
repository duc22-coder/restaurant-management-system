package com.restaurant.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRecipeResponse {

    private Long id;
    private Long productId;
    private String productName;
    private Long ingredientDetailId;
    private String ingredientName;
    private String ingredientSku;
    private Double currentStock;
    private Double quantity;
    private String unit;
    private String note;
    private LocalDateTime createdAt;
}
