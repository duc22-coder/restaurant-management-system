package com.restaurant.service.impl;

import com.restaurant.dto.request.ReservationRequest;
import com.restaurant.dto.response.ReservationResponse;
import com.restaurant.dto.response.TimeSlotAvailabilityResponse;
import com.restaurant.dto.response.TimeSlotAvailabilityResponse.TableSlotStatus;
import com.restaurant.entity.Reservation;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.entity.User;
import com.restaurant.enums.ReservationStatus;
import com.restaurant.enums.TableStatus;
import com.restaurant.repository.ReservationRepository;
import com.restaurant.repository.RestaurantTableRepository;
import com.restaurant.repository.UserRepository;
import com.restaurant.repository.OrderRepository;
import com.restaurant.service.ReservationService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationServiceImpl implements ReservationService {
    private static final ZoneId RESTAURANT_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Getter
    @AllArgsConstructor
    public static class TimeSlotDefinition {
        private final String slot;
        private final String label;
        private final String period;
    }

    public static final List<TimeSlotDefinition> TIME_SLOTS = List.of(
            new TimeSlotDefinition("09:00 - 10:30", "Buổi Sáng (09:00 - 10:30)", "MORNING"),
            new TimeSlotDefinition("11:00 - 12:30", "Buổi Trưa - Ca 1 (11:00 - 12:30)", "LUNCH"),
            new TimeSlotDefinition("12:30 - 14:00", "Buổi Trưa - Ca 2 (12:30 - 14:00)", "LUNCH"),
            new TimeSlotDefinition("17:30 - 19:00", "Buổi Tối - Ca 1 (17:30 - 19:00)", "DINNER"),
            new TimeSlotDefinition("19:00 - 20:30", "Buổi Tối - Ca 2 (19:00 - 20:30)", "DINNER"),
            new TimeSlotDefinition("20:30 - 22:00", "Buổi Tối - Ca 3 (20:30 - 22:00)", "DINNER")
    );

    @Override
    @Transactional
    public ReservationResponse createCustomerReservation(ReservationRequest request, Long customerId) {
        if (customerId == null) {
            throw new RuntimeException("Vui lòng đăng nhập để đặt bàn!");
        }
        userRepository.findByIdForUpdate(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản khách hàng!"));
        if (reservationRepository.existsByCustomerIdAndStatusIn(customerId, List.of(
                ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.ARRIVED))) {
            throw new RuntimeException("Mỗi tài khoản chỉ được có một lượt đặt bàn đang hoạt động. Vui lòng hủy hoặc hoàn tất lượt đặt hiện tại trước!");
        }
        return createReservationInternal(request, customerId, ReservationStatus.PENDING);
    }

    @Override
    @Transactional
    public ReservationResponse createStaffReservation(ReservationRequest request, Long staffId) {
        // Đặt bàn do nhân viên tạo (ví dụ khách gọi hotline) tự động ở trạng thái CONFIRMED
        return createReservationInternal(request, null, ReservationStatus.CONFIRMED);
    }

    private ReservationResponse createReservationInternal(ReservationRequest request, Long customerId, ReservationStatus defaultStatus) {
        if (request.getReservationDate() == null) {
            throw new RuntimeException("Vui lòng chọn ngày đặt bàn!");
        }
        LocalDate today = LocalDate.now(RESTAURANT_ZONE);
        if (request.getReservationDate().isBefore(today)) {
            throw new RuntimeException("Không thể đặt bàn cho ngày trong quá khứ!");
        }
        if (request.getTimeSlot() == null || request.getTimeSlot().isBlank()) {
            throw new RuntimeException("Vui lòng chọn khung giờ đặt bàn!");
        }
        String requestedSlot = request.getTimeSlot().trim();
        if (TIME_SLOTS.stream().noneMatch(slot -> slot.getSlot().equals(requestedSlot))) {
            throw new RuntimeException("Khung giờ đặt bàn không hợp lệ. Vui lòng chọn một khung giờ đang mở!");
        }
        if (request.getReservationDate().equals(today) && isSlotExpired(request.getReservationDate(), requestedSlot))
            throw new RuntimeException("Khung giờ này đã kết thúc, vui lòng chọn khung giờ khác!");
        if (request.getGuestCount() == null || request.getGuestCount() < 1) {
            throw new RuntimeException("Số lượng khách tối thiểu là 1 người!");
        }

        RestaurantTable table;
        if (request.getTableId() != null) {
            table = tableRepository.findByIdForUpdate(request.getTableId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn với ID: " + request.getTableId()));

            if (request.getReservationDate().equals(today)
                    && table.getStatus() != TableStatus.AVAILABLE) {
                throw new RuntimeException("Bàn " + table.getTableNumber() + " hiện đang có khách hoặc chờ thanh toán. Vui lòng chọn bàn trống!");
            }

            // Kiểm tra sức chứa
            if (table.getCapacity() != null && table.getCapacity() < request.getGuestCount()) {
                throw new RuntimeException("Bàn " + table.getTableNumber() + " có sức chứa " + table.getCapacity() +
                        " người, không đủ cho " + request.getGuestCount() + " khách. Vui lòng chọn bàn lớn hơn!");
            }

            // Kiểm tra xem bàn đã có ai đặt trong khung giờ này chưa
            List<Reservation> activeReservations = reservationRepository.findActiveReservationsForTableAndSlot(
                    table.getId(), request.getReservationDate(), request.getTimeSlot());
            if (!activeReservations.isEmpty()) {
                throw new RuntimeException("Bàn " + table.getTableNumber() + " đã có khách đặt trước trong khung giờ " +
                        request.getTimeSlot() + " ngày " + request.getReservationDate() + "! Vui lòng chọn bàn khác.");
            }
        } else {
            // Khách không chọn bàn cụ thể: tự động tìm bàn trống có sức chứa phù hợp nhất
            List<RestaurantTable> candidates = tableRepository.findAll().stream()
                    .filter(t -> t.getCapacity() == null || t.getCapacity() >= request.getGuestCount())
                    .sorted(Comparator.comparingInt(t -> t.getCapacity() != null ? t.getCapacity() : 999))
                    .toList();
            table = null;
            for (RestaurantTable candidate : candidates) {
                RestaurantTable locked = tableRepository.findByIdForUpdate(candidate.getId()).orElse(null);
                if (locked == null || (request.getReservationDate().equals(today) && locked.getStatus() != TableStatus.AVAILABLE)) continue;
                if (reservationRepository.findActiveReservationsForTableAndSlot(locked.getId(), request.getReservationDate(), requestedSlot).isEmpty()) {
                    table = locked;
                    break;
                }
            }
            if (table == null) throw new RuntimeException("Rất tiếc! Hiện không còn bàn trống đủ sức chứa " +
                    request.getGuestCount() + " khách trong khung giờ " + requestedSlot + " ngày " + request.getReservationDate() + ". Vui lòng chọn khung giờ khác!");
        }

        User customer = null;
        if (customerId != null) {
            customer = userRepository.findById(customerId).orElse(null);
        }

        String reservationCode = "RSV-" + (System.currentTimeMillis() / 1000) + "-" +
                String.format("%04d", (int) (Math.random() * 10_000));

        Reservation reservation = Reservation.builder()
                .reservationCode(reservationCode)
                .table(table)
                .customer(customer)
                .customerName(request.getCustomerName().trim())
                .customerPhone(request.getCustomerPhone().trim())
                .guestCount(request.getGuestCount())
                .reservationDate(request.getReservationDate())
                .timeSlot(request.getTimeSlot().trim())
                .status(defaultStatus)
                .note(request.getNote())
                .build();

        Reservation saved = reservationRepository.save(reservation);
        log.info("Created new table reservation: code={}, table={}, date={}, slot={}",
                saved.getReservationCode(), table.getTableNumber(), saved.getReservationDate(), saved.getTimeSlot());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeSlotAvailabilityResponse> getAvailabilityByDate(LocalDate date) {
        LocalDate queryDate = (date != null) ? date : LocalDate.now(RESTAURANT_ZONE);
        List<RestaurantTable> allTables = tableRepository.findAll();
        List<Reservation> reservationsOnDate = reservationRepository.findByReservationDate(queryDate);

        // Gom các reservation theo timeSlot
        Map<String, List<Reservation>> reservationsBySlot = reservationsOnDate.stream()
                .filter(r -> r.getStatus() == ReservationStatus.PENDING ||
                             r.getStatus() == ReservationStatus.CONFIRMED ||
                             r.getStatus() == ReservationStatus.ARRIVED)
                .collect(Collectors.groupingBy(Reservation::getTimeSlot));

        List<TimeSlotAvailabilityResponse> responses = new ArrayList<>();

        for (TimeSlotDefinition def : TIME_SLOTS) {
            List<Reservation> slotReservations = reservationsBySlot.getOrDefault(def.getSlot(), Collections.emptyList());
            Map<Long, Reservation> tableReservationMap = slotReservations.stream()
                    .collect(Collectors.toMap(r -> r.getTable().getId(), r -> r, (r1, r2) -> r1));

            List<TableSlotStatus> tableStatuses = new ArrayList<>();
            int availableCount = 0;

            for (RestaurantTable t : allTables) {
                Reservation res = tableReservationMap.get(t.getId());
                boolean isBooked = (res != null);
                boolean expired = isSlotExpired(queryDate, def.getSlot());
                boolean isFutureReservation = queryDate.isAfter(LocalDate.now(RESTAURANT_ZONE));
                boolean isAvailable = !expired && !isBooked && (isFutureReservation || t.getStatus() == TableStatus.AVAILABLE);

                String statusStr = "AVAILABLE";
                String bookedBy = null;
                Long resId = null;
                String resCode = null;

                if (isBooked) {
                    statusStr = "RESERVED";
                    bookedBy = res.getCustomerName() + " (" + res.getGuestCount() + " khách)";
                    resId = res.getId();
                    resCode = res.getReservationCode();
                } else if (!isAvailable) {
                    statusStr = expired ? "CLOSED" : t.getStatus().name();
                } else {
                    availableCount++;
                }

                tableStatuses.add(TableSlotStatus.builder()
                        .tableId(t.getId())
                        .tableNumber(t.getTableNumber())
                        .capacity(t.getCapacity())
                        .isAvailable(isAvailable)
                        .bookedBy(bookedBy)
                        .reservationId(resId)
                        .reservationCode(resCode)
                        .status(statusStr)
                        .build());
            }

            responses.add(TimeSlotAvailabilityResponse.builder()
                    .timeSlot(def.getSlot())
                    .label(def.getLabel())
                    .period(def.getPeriod())
                    .totalTablesCount(allTables.size())
                    .availableTablesCount(availableCount)
                    .tables(tableStatuses)
                    .build());
        }

        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getReservations(LocalDate date, String timeSlot, ReservationStatus status) {
        return reservationRepository.findReservationsWithFilters(date, timeSlot, status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getMyReservations(Long customerId) {
        return reservationRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin đặt bàn với ID: " + id));
        return mapToResponse(reservation);
    }

    @Override
    @Transactional
    public ReservationResponse updateReservationStatus(Long id, ReservationStatus status) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin đặt bàn với ID: " + id));

        ReservationStatus previous = reservation.getStatus();
        boolean valid = previous == status
                || (previous == ReservationStatus.PENDING && (status == ReservationStatus.CONFIRMED || status == ReservationStatus.CANCELLED))
                || (previous == ReservationStatus.CONFIRMED && (status == ReservationStatus.ARRIVED || status == ReservationStatus.CANCELLED))
                || (previous == ReservationStatus.ARRIVED && status == ReservationStatus.COMPLETED);
        if (!valid) throw new RuntimeException("Không thể chuyển đặt bàn từ " + previous + " sang " + status + "!");
        reservation.setStatus(status);

        // Khi khách đã đến nhận bàn (ARRIVED) -> Tự động chuyển trạng thái bàn sang OCCUPIED (Đang có khách)
        if (status == ReservationStatus.ARRIVED && reservation.getTable() != null) {
            if (!reservation.getReservationDate().equals(LocalDate.now(RESTAURANT_ZONE))) {
                throw new RuntimeException("Chỉ có thể check-in đặt bàn trong ngày đặt!");
            }
            RestaurantTable table = reservation.getTable();
            List<com.restaurant.entity.Order> activeOrders = orderRepository.findActiveOrdersByTableId(table.getId());
            boolean belongsToReservationCustomer = reservation.getCustomer() != null && !activeOrders.isEmpty()
                    && activeOrders.stream().allMatch(order -> order.getCustomer() != null
                    && order.getCustomer().getId().equals(reservation.getCustomer().getId()));
            if (table.getStatus() != TableStatus.AVAILABLE && !belongsToReservationCustomer) {
                throw new RuntimeException("Bàn đang có khách hoặc chờ thanh toán, không thể check-in lượt đặt này!");
            }
            table.setStatus(TableStatus.OCCUPIED);
            tableRepository.save(table);
            log.info("Table {} status updated to OCCUPIED via reservation check-in {}",
                    table.getTableNumber(), reservation.getReservationCode());
        }

        // Khi đặt bàn hoàn tất (COMPLETED) -> Giải phóng bàn nếu không còn đơn hàng nào đang chạy
        if (status == ReservationStatus.COMPLETED && reservation.getTable() != null) {
            RestaurantTable table = reservation.getTable();
            if (table.getStatus() == TableStatus.OCCUPIED
                    && orderRepository.findActiveOrdersByTableId(table.getId()).isEmpty()) {
                table.setStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);
            }
        }

        Reservation updated = reservationRepository.save(reservation);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void cancelCustomerReservation(Long id, Long customerId) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin đặt bàn với ID: " + id));

        if (reservation.getCustomer() == null || !reservation.getCustomer().getId().equals(customerId)) {
            throw new RuntimeException("Bạn không có quyền hủy lượt đặt bàn này!");
        }

        if (reservation.getStatus() == ReservationStatus.ARRIVED || reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new RuntimeException("Không thể hủy lượt đặt bàn đã nhận bàn hoặc đã hoàn tất!");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
        log.info("Reservation {} cancelled by customer {}", reservation.getReservationCode(), customerId);
    }

    @Override
    @Transactional
    public void deleteReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin đặt bàn với ID: " + id));
        reservationRepository.delete(reservation);
    }

    private ReservationResponse mapToResponse(Reservation r) {
        return ReservationResponse.builder()
                .id(r.getId())
                .reservationCode(r.getReservationCode())
                .tableId(r.getTable() != null ? r.getTable().getId() : null)
                .tableNumber(r.getTable() != null ? r.getTable().getTableNumber() : null)
                .tableCapacity(r.getTable() != null ? r.getTable().getCapacity() : null)
                .customerId(r.getCustomer() != null ? r.getCustomer().getId() : null)
                .customerUsername(r.getCustomer() != null ? r.getCustomer().getUsername() : null)
                .customerName(r.getCustomerName())
                .customerPhone(r.getCustomerPhone())
                .guestCount(r.getGuestCount())
                .reservationDate(r.getReservationDate())
                .timeSlot(r.getTimeSlot())
                .status(r.getStatus())
                .note(r.getNote())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private boolean isSlotExpired(LocalDate date, String slot) {
        if (!date.equals(LocalDate.now(RESTAURANT_ZONE))) return false;
        String[] bounds = slot.split("-");
        LocalTime end = LocalTime.parse(bounds[1].trim());
        return !LocalTime.now(RESTAURANT_ZONE).isBefore(end);
    }
}
