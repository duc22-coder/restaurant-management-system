package com.restaurant.service;

import com.restaurant.dto.request.ReservationRequest;
import com.restaurant.dto.response.ReservationResponse;
import com.restaurant.dto.response.TimeSlotAvailabilityResponse;
import com.restaurant.enums.ReservationStatus;

import java.time.LocalDate;
import java.util.List;

public interface ReservationService {

    ReservationResponse createCustomerReservation(ReservationRequest request, Long customerId);

    ReservationResponse createStaffReservation(ReservationRequest request, Long staffId);

    List<TimeSlotAvailabilityResponse> getAvailabilityByDate(LocalDate date);

    List<ReservationResponse> getReservations(LocalDate date, String timeSlot, ReservationStatus status);

    List<ReservationResponse> getMyReservations(Long customerId);

    ReservationResponse getReservationById(Long id);

    ReservationResponse updateReservationStatus(Long id, ReservationStatus status);

    void cancelCustomerReservation(Long id, Long customerId);

    void deleteReservation(Long id);
}
