package com.restaurant.dto.response;

import com.restaurant.enums.MenuItemStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String description;
    private BigDecimal price;
    private String image;
    private MenuItemStatus status;
    private LocalDateTime createdAt;
}
