package com.restaurant.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRecipeRequest {

    @NotNull(message = "Món ăn chính không được để trống")
    private Long productId;

    @NotNull(message = "Thành phần nguyên liệu (SPCT) không được để trống")
    private Long ingredientDetailId;

    @NotNull(message = "Số lượng định mức không được để trống")
    @Positive(message = "Số lượng định mức phải lớn hơn 0")
    private Double quantity;

    @NotNull(message = "Đơn vị tính không được để trống")
    private String unit;

    private String note;
}
