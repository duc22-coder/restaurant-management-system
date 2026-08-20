package com.restaurant.dto.response;

import com.restaurant.enums.CategoryStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private Long id;
    private String name;
    private String description;
    private String image;
    private CategoryStatus status;
    private Integer totalItems;
    private LocalDateTime createdAt;
}
