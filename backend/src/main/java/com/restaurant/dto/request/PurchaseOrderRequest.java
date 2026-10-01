package com.restaurant.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderRequest {

    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    private String supplierName;

    private String supplierPhone;

    private String supplierAddress;

    private String note;

    @NotEmpty(message = "Danh sách hàng nhập không được để trống")
    @Valid
    private List<PurchaseOrderItemRequest> items;
}
