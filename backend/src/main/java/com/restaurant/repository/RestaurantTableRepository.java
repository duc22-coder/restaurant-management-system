package com.restaurant.repository;

import com.restaurant.entity.RestaurantTable;
import com.restaurant.enums.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    Optional<RestaurantTable> findByTableNumber(String tableNumber);

    List<RestaurantTable> findByStatus(TableStatus status);

    Boolean existsByTableNumber(String tableNumber);

    long countByStatusIn(List<TableStatus> statuses);
}
