package com.restaurant.dto.response;

import com.restaurant.enums.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponse {

    private Long id;
    private String reservationCode;
    private Long tableId;
    private String tableNumber;
    private Integer tableCapacity;
    private Long customerId;
    private String customerUsername;
    private String customerName;
    private String customerPhone;
    private Integer guestCount;
    private LocalDate reservationDate;
    private String timeSlot;
    private ReservationStatus status;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
