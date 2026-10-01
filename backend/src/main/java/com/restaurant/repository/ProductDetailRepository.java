package com.restaurant.repository;

import com.restaurant.entity.ProductDetail;
import com.restaurant.enums.ProductDetailStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductDetailRepository extends JpaRepository<ProductDetail, Long> {

    Optional<ProductDetail> findBySku(String sku);

    boolean existsBySku(String sku);

    @Query("SELECT p FROM ProductDetail p JOIN FETCH p.menuItem WHERE p.menuItem.id = :menuItemId")
    List<ProductDetail> findByMenuItemId(Long menuItemId);

    @Query("SELECT p FROM ProductDetail p JOIN FETCH p.menuItem")
    List<ProductDetail> findAllWithMenuItem();

    @Query("SELECT p FROM ProductDetail p JOIN FETCH p.menuItem WHERE p.stockQuantity <= p.minStockAlert")
    List<ProductDetail> findLowStockAlerts();

    List<ProductDetail> findByStatus(ProductDetailStatus status);
}
