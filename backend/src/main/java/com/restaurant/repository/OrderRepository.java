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

    long countByStatus(OrderStatus status);

    // Các truy vấn danh sách bên dưới dùng LEFT JOIN FETCH để nạp sẵn table/customer/orderItems/menuItem
    // trong CÙNG 1 câu SQL, tránh vấn đề N+1 query (mỗi đơn hàng lại phải query riêng lẻ).
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.table " +
           "LEFT JOIN FETCH o.customer " +
           "LEFT JOIN FETCH o.orderItems oi " +
           "LEFT JOIN FETCH oi.menuItem " +
           "WHERE o.status = :status " +
           "ORDER BY o.createdAt DESC")
    List<Order> findByStatus(OrderStatus status);

    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.table " +
           "LEFT JOIN FETCH o.customer " +
           "LEFT JOIN FETCH o.orderItems oi " +
           "LEFT JOIN FETCH oi.menuItem " +
           "WHERE o.table.id = :tableId AND o.status NOT IN ('COMPLETED', 'PAID', 'CANCELLED') " +
           "ORDER BY o.createdAt DESC")
    List<Order> findActiveOrdersByTableId(Long tableId);

    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.table " +
           "LEFT JOIN FETCH o.customer " +
           "LEFT JOIN FETCH o.orderItems oi " +
           "LEFT JOIN FETCH oi.menuItem " +
           "WHERE o.customer.id = :customerId " +
           "ORDER BY o.createdAt DESC")
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    // Dùng cho danh sách toàn bộ đơn hàng (Admin/Staff) - vẫn nạp sẵn quan hệ liên quan trong 1 query
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.table " +
           "LEFT JOIN FETCH o.customer " +
           "LEFT JOIN FETCH o.orderItems oi " +
           "LEFT JOIN FETCH oi.menuItem " +
           "ORDER BY o.createdAt DESC")
    List<Order> findAllWithDetails();

}
