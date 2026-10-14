package com.restaurant.repository;

import com.restaurant.entity.Reservation;
import com.restaurant.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Optional<Reservation> findByReservationCode(String reservationCode);

    List<Reservation> findByReservationDate(LocalDate reservationDate);

    List<Reservation> findByReservationDateAndTimeSlot(LocalDate reservationDate, String timeSlot);

    List<Reservation> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    boolean existsByCustomerIdAndStatusIn(Long customerId, List<ReservationStatus> statuses);

    boolean existsByCustomerIdAndTableIdAndStatus(Long customerId, Long tableId, ReservationStatus status);

    boolean existsByTable_IdAndReservationDateAndStatusIn(Long tableId, LocalDate reservationDate,
                                                           List<ReservationStatus> statuses);

    @Query("SELECT r FROM Reservation r WHERE r.table.id = :tableId AND r.reservationDate = :date AND r.timeSlot = :timeSlot AND r.status IN ('PENDING', 'CONFIRMED', 'ARRIVED')")
    List<Reservation> findActiveReservationsForTableAndSlot(@Param("tableId") Long tableId,
                                                           @Param("date") LocalDate date,
                                                           @Param("timeSlot") String timeSlot);

    @Query("SELECT DISTINCT r FROM Reservation r " +
           "JOIN FETCH r.table " +
           "LEFT JOIN FETCH r.customer " +
           "WHERE (:date IS NULL OR r.reservationDate = :date) " +
           "AND (:timeSlot IS NULL OR r.timeSlot = :timeSlot) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "ORDER BY r.reservationDate DESC, r.timeSlot ASC, r.createdAt DESC")
    List<Reservation> findReservationsWithFilters(@Param("date") LocalDate date,
                                                 @Param("timeSlot") String timeSlot,
                                                 @Param("status") ReservationStatus status);

    long countByReservationDate(LocalDate date);

    long countByReservationDateAndStatus(LocalDate date, ReservationStatus status);
}
