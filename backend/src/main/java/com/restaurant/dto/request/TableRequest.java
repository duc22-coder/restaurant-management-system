package com.restaurant.dto.request;

import com.restaurant.enums.TableStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableRequest {

    @NotBlank(message = "Số bàn không được để trống")
    private String tableNumber;

    @Min(value = 1, message = "Sức chứa tối thiểu là 1 người")
    private Integer capacity;

    private TableStatus status;
}
