package com.restaurant.dto.request;

import com.restaurant.enums.MenuItemStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemRequest {

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    @NotBlank(message = "Tên món ăn không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Giá tiền không được để trống")
    @Min(value = 0, message = "Giá tiền không được nhỏ hơn 0")
    private BigDecimal price;

    private String image;
    private MenuItemStatus status;
}
