package com.restaurant.controller;

import com.restaurant.dto.request.ReservationRequest;
import com.restaurant.dto.response.ReservationResponse;
import com.restaurant.dto.response.TimeSlotAvailabilityResponse;
import com.restaurant.security.UserPrincipal;
import com.restaurant.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/customer/reservations")
@RequiredArgsConstructor
public class CustomerReservationController {

    private final ReservationService reservationService;

    // Mỗi tài khoản chỉ được có một lượt đặt bàn đang hoạt động.
    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(@Valid @RequestBody ReservationRequest request,
                                                                 @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long customerId = userPrincipal.getId();
        ReservationResponse response = reservationService.createCustomerReservation(request, customerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Lấy danh sách khung giờ và tình trạng bàn trống theo ngày (mặc định hôm nay nếu không truyền)
    @GetMapping("/slots")
    public ResponseEntity<List<TimeSlotAvailabilityResponse>> getAvailability(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<TimeSlotAvailabilityResponse> publicSlots = reservationService.getAvailabilityByDate(date).stream()
                .map(slot -> TimeSlotAvailabilityResponse.builder()
                        .timeSlot(slot.getTimeSlot())
                        .label(slot.getLabel())
                        .period(slot.getPeriod())
                        .availableTablesCount(slot.getAvailableTablesCount())
                        .totalTablesCount(slot.getTotalTablesCount())
                        .tables(slot.getTables().stream().map(table -> TimeSlotAvailabilityResponse.TableSlotStatus.builder()
                                .tableId(table.getTableId())
                                .tableNumber(table.getTableNumber())
                                .capacity(table.getCapacity())
                                .isAvailable(table.getIsAvailable())
                                .status(table.getStatus())
                                .build()).toList())
                        .build())
                .toList();
        return ResponseEntity.ok(publicSlots);
    }

    // Xem lịch sử đặt bàn của tài khoản khách hàng đang đăng nhập
    @GetMapping("/my")
    public ResponseEntity<List<ReservationResponse>> getMyReservations(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(reservationService.getMyReservations(userPrincipal.getId()));
    }

    // Khách hàng tự hủy lượt đặt bàn của mình
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id,
                                                  @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        reservationService.cancelCustomerReservation(id, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
}
