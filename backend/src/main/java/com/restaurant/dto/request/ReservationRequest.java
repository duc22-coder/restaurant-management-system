package com.restaurant.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequest {

    // Bàn muốn đặt (nếu khách tự chọn bàn cụ thể; nếu null thì hệ thống tự gán bàn trống phù hợp)
    private Long tableId;

    @NotBlank(message = "Tên khách hàng không được để trống")
    private String customerName;

    @NotBlank(message = "Số điện thoại liên hệ không được để trống")
    private String customerPhone;

    @NotNull(message = "Số lượng khách không được để trống")
    @Min(value = 1, message = "Số lượng khách tối thiểu là 1 người")
    private Integer guestCount;

    @NotNull(message = "Ngày đặt bàn không được để trống")
    private LocalDate reservationDate;

    @NotBlank(message = "Khung giờ đặt bàn không được để trống")
    private String timeSlot;

    private String note;
}
