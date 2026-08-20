package com.restaurant.repository;

import com.restaurant.entity.Order;
import com.restaurant.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);

    List<Order> findByTableId(Long tableId);

    List<Order> findByTableIdAndStatus(Long tableId, OrderStatus status);

    List<Order> findByStatus(OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.table.id = :tableId AND o.status NOT IN ('COMPLETED', 'PAID', 'CANCELLED') ORDER BY o.createdAt DESC")
    List<Order> findActiveOrdersByTableId(Long tableId);

}
