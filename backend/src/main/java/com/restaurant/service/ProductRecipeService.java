package com.restaurant.service;

import com.restaurant.dto.request.ProductRecipeRequest;
import com.restaurant.dto.response.ProductRecipeResponse;

import java.util.List;

public interface ProductRecipeService {

    List<ProductRecipeResponse> getAllRecipes();

    List<ProductRecipeResponse> getRecipesByProductId(Long productId);

    ProductRecipeResponse createRecipe(ProductRecipeRequest request);

    ProductRecipeResponse updateRecipe(Long id, ProductRecipeRequest request);

    void deleteRecipe(Long id);
}
