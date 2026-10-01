package com.restaurant.repository;

import com.restaurant.entity.ProductRecipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRecipeRepository extends JpaRepository<ProductRecipe, Long> {

    @Query("SELECT r FROM ProductRecipe r JOIN FETCH r.product JOIN FETCH r.ingredientDetail WHERE r.product.id = :productId")
    List<ProductRecipe> findByProductId(Long productId);

    @Query("SELECT r FROM ProductRecipe r JOIN FETCH r.product JOIN FETCH r.ingredientDetail")
    List<ProductRecipe> findAllWithDetails();

    boolean existsByProductIdAndIngredientDetailId(Long productId, Long ingredientDetailId);
}
