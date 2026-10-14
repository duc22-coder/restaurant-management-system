package com.restaurant.controller;

import com.restaurant.dto.request.ReservationRequest;
import com.restaurant.dto.response.ReservationResponse;
import com.restaurant.dto.response.TimeSlotAvailabilityResponse;
import com.restaurant.enums.ReservationStatus;
import com.restaurant.security.UserPrincipal;
import com.restaurant.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/staff/reservations")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class StaffReservationController {

    private final ReservationService reservationService;

    // Danh sách đặt bàn theo bộ lọc Ngày, Khung giờ, Trạng thái
    @GetMapping
    public ResponseEntity<List<ReservationResponse>> getReservations(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String timeSlot,
            @RequestParam(required = false) ReservationStatus status) {
        return ResponseEntity.ok(reservationService.getReservations(date, timeSlot, status));
    }

    // Tra cứu tình trạng bàn theo khung giờ của một ngày
    @GetMapping("/availability")
    public ResponseEntity<List<TimeSlotAvailabilityResponse>> getAvailability(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getAvailabilityByDate(date));
    }

    // Nhân viên tạo lượt đặt bàn cho khách (ví dụ khách gọi điện)
    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(
            @Valid @RequestBody ReservationRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long staffId = (userPrincipal != null) ? userPrincipal.getId() : null;
        ReservationResponse response = reservationService.createStaffReservation(request, staffId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Xem chi tiết một lượt đặt bàn
    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> getReservationById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }

    // Cập nhật trạng thái đặt bàn: CONFIRMED, ARRIVED (nhận bàn), COMPLETED, CANCELLED
    @PutMapping("/{id}/status")
    public ResponseEntity<ReservationResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam ReservationStatus status) {
        return ResponseEntity.ok(reservationService.updateReservationStatus(id, status));
    }

    // Xóa đặt bàn
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable Long id) {
        reservationService.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }
}
