package com.restaurant.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlotAvailabilityResponse {

    private String timeSlot;
    private String label;
    private String period; // MORNING, LUNCH, DINNER
    private int availableTablesCount;
    private int totalTablesCount;
    private List<TableSlotStatus> tables;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TableSlotStatus {
        private Long tableId;
        private String tableNumber;
        private Integer capacity;
        private Boolean isAvailable;
        private String bookedBy;
        private Long reservationId;
        private String reservationCode;
        private String status; // "AVAILABLE", "RESERVED", "OCCUPIED"
    }
}
