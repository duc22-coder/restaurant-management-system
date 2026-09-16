package com.restaurant.dto.request;

import com.restaurant.enums.OrderType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
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

    // Chỉ bắt buộc khi orderType = DINE_IN (được kiểm tra thủ công trong OrderServiceImpl,
    // vì @NotNull tĩnh không thể điều kiện theo giá trị field khác trong cùng DTO)
    private Long tableId;

    // Mặc định DINE_IN nếu không truyền lên (khách quét QR tại bàn - hành vi cũ không đổi)
    private OrderType orderType;

    // Bắt buộc khi orderType = DELIVERY
    private String deliveryAddress;

    // Số điện thoại liên hệ khi orderType = PICKUP hoặc DELIVERY
    private String contactPhone;

    private String customerNote;

    @NotEmpty(message = "Danh sách món ăn không được để trống")
    @Valid
    private List<OrderItemRequest> items;
}
