package com.restaurant.repository;

import com.restaurant.entity.PurchaseOrder;
import com.restaurant.enums.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Optional<PurchaseOrder> findByCode(String code);

    boolean existsByCode(String code);

    @Query("SELECT po FROM PurchaseOrder po JOIN FETCH po.creator ORDER BY po.createdAt DESC")
    List<PurchaseOrder> findAllWithCreator();

    @Query("SELECT po FROM PurchaseOrder po JOIN FETCH po.creator WHERE po.status = :status ORDER BY po.createdAt DESC")
    List<PurchaseOrder> findByStatusWithCreator(PurchaseOrderStatus status);
}
