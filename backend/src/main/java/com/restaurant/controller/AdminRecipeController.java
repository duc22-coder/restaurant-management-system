package com.restaurant.controller;

import com.restaurant.dto.request.ProductRecipeRequest;
import com.restaurant.dto.response.ProductRecipeResponse;
import com.restaurant.service.ProductRecipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/recipes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class AdminRecipeController {

    private final ProductRecipeService recipeService;

    @GetMapping
    public ResponseEntity<List<ProductRecipeResponse>> getAll() {
        return ResponseEntity.ok(recipeService.getAllRecipes());
    }

    @GetMapping("/by-product/{productId}")
    public ResponseEntity<List<ProductRecipeResponse>> getByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(recipeService.getRecipesByProductId(productId));
    }

    @PostMapping
    public ResponseEntity<ProductRecipeResponse> create(@Valid @RequestBody ProductRecipeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recipeService.createRecipe(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductRecipeResponse> update(@PathVariable Long id, @Valid @RequestBody ProductRecipeRequest request) {
        return ResponseEntity.ok(recipeService.updateRecipe(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }
}
