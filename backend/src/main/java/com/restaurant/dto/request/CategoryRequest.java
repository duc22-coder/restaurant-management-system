package com.restaurant.dto.request;

import com.restaurant.enums.CategoryStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequest {

    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;

    private String description;
    private String image;
    private CategoryStatus status;
}
