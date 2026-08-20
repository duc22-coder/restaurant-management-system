package com.restaurant.repository;

import com.restaurant.entity.Category;
import com.restaurant.enums.CategoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByStatus(CategoryStatus status);
}
