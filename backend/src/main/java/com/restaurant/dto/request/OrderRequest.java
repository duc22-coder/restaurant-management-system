package com.restaurant.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {

    @NotNull(message = "ID bàn không được để trống")
    private Long tableId;

    private String customerNote;

    @NotEmpty(message = "Danh sách món ăn không được để trống")
    @Valid
    private List<OrderItemRequest> items;
}
