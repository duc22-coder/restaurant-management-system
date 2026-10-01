package com.restaurant.service.impl;

import com.restaurant.dto.request.ProductRecipeRequest;
import com.restaurant.dto.response.ProductRecipeResponse;
import com.restaurant.entity.MenuItem;
import com.restaurant.entity.ProductDetail;
import com.restaurant.entity.ProductRecipe;
import com.restaurant.repository.MenuItemRepository;
import com.restaurant.repository.ProductDetailRepository;
import com.restaurant.repository.ProductRecipeRepository;
import com.restaurant.service.ProductRecipeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductRecipeServiceImpl implements ProductRecipeService {

    private final ProductRecipeRepository recipeRepository;
    private final MenuItemRepository menuItemRepository;
    private final ProductDetailRepository productDetailRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductRecipeResponse> getAllRecipes() {
        return recipeRepository.findAllWithDetails().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductRecipeResponse> getRecipesByProductId(Long productId) {
        return recipeRepository.findByProductId(productId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductRecipeResponse createRecipe(ProductRecipeRequest request) {
        if (recipeRepository.existsByProductIdAndIngredientDetailId(request.getProductId(), request.getIngredientDetailId())) {
            throw new IllegalArgumentException("Nguyên liệu này đã có trong công thức của món ăn! Vui lòng chỉnh sửa số lượng.");
        }

        MenuItem product = menuItemRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy món ăn với ID: " + request.getProductId()));

        ProductDetail ingredientDetail = productDetailRepository.findById(request.getIngredientDetailId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nguyên liệu SPCT với ID: " + request.getIngredientDetailId()));

        ProductRecipe recipe = ProductRecipe.builder()
                .product(product)
                .ingredientDetail(ingredientDetail)
                .quantity(request.getQuantity())
                .unit(request.getUnit().trim())
                .note(request.getNote())
                .build();

        return mapToResponse(recipeRepository.save(recipe));
    }

    @Override
    @Transactional
    public ProductRecipeResponse updateRecipe(Long id, ProductRecipeRequest request) {
        ProductRecipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy định lượng công thức với ID: " + id));

        if (!recipe.getProduct().getId().equals(request.getProductId())) {
            MenuItem product = menuItemRepository.findById(request.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy món ăn với ID: " + request.getProductId()));
            recipe.setProduct(product);
        }

        if (!recipe.getIngredientDetail().getId().equals(request.getIngredientDetailId())) {
            ProductDetail ingredientDetail = productDetailRepository.findById(request.getIngredientDetailId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nguyên liệu SPCT với ID: " + request.getIngredientDetailId()));
            recipe.setIngredientDetail(ingredientDetail);
        }

        recipe.setQuantity(request.getQuantity());
        recipe.setUnit(request.getUnit().trim());
        recipe.setNote(request.getNote());

        return mapToResponse(recipeRepository.save(recipe));
    }

    @Override
    @Transactional
    public void deleteRecipe(Long id) {
        if (!recipeRepository.existsById(id)) {
            throw new IllegalArgumentException("Không tìm thấy định lượng công thức với ID: " + id);
        }
        recipeRepository.deleteById(id);
    }

    private ProductRecipeResponse mapToResponse(ProductRecipe recipe) {
        return ProductRecipeResponse.builder()
                .id(recipe.getId())
                .productId(recipe.getProduct() != null ? recipe.getProduct().getId() : null)
                .productName(recipe.getProduct() != null ? recipe.getProduct().getName() : null)
                .ingredientDetailId(recipe.getIngredientDetail() != null ? recipe.getIngredientDetail().getId() : null)
                .ingredientName(recipe.getIngredientDetail() != null && recipe.getIngredientDetail().getMenuItem() != null
                        ? recipe.getIngredientDetail().getMenuItem().getName() + " (" + recipe.getIngredientDetail().getVariantName() + ")"
                        : "N/A")
                .ingredientSku(recipe.getIngredientDetail() != null ? recipe.getIngredientDetail().getSku() : null)
                .currentStock(recipe.getIngredientDetail() != null ? recipe.getIngredientDetail().getStockQuantity() : 0.0)
                .quantity(recipe.getQuantity())
                .unit(recipe.getUnit())
                .note(recipe.getNote())
                .createdAt(recipe.getCreatedAt())
                .build();
    }
}
