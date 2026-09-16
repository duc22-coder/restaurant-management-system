package com.restaurant.repository;

import com.restaurant.entity.MenuItem;
import com.restaurant.enums.MenuItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    // JOIN FETCH category để tránh N+1: đây là API được Customer gọi liên tục nhất trong hệ thống
    @Query("SELECT m FROM MenuItem m JOIN FETCH m.category WHERE m.category.id = :categoryId")
    List<MenuItem> findByCategoryId(Long categoryId);

    @Query("SELECT m FROM MenuItem m JOIN FETCH m.category WHERE m.status = :status")
    List<MenuItem> findByStatus(MenuItemStatus status);

    @Query("SELECT m FROM MenuItem m JOIN FETCH m.category WHERE m.category.id = :categoryId AND m.status = :status")
    List<MenuItem> findByCategoryIdAndStatus(Long categoryId, MenuItemStatus status);

    @Query("SELECT m FROM MenuItem m JOIN FETCH m.category WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%')) AND m.status = :status")
    List<MenuItem> searchByNameAndStatus(String keyword, MenuItemStatus status);

    @Query("SELECT m FROM MenuItem m JOIN FETCH m.category")
    List<MenuItem> findAllWithCategory();
}
