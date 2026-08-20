package com.restaurant.repository;

import com.restaurant.entity.OrderItem;
import com.restaurant.enums.OrderItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    List<OrderItem> findByStatus(OrderItemStatus status);

    @Query("SELECT oi.menuItem, SUM(oi.quantity), SUM(oi.price * oi.quantity) FROM OrderItem oi WHERE oi.order.status = 'COMPLETED' GROUP BY oi.menuItem ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingItems();
}
