package com.restaurant.controller;

import com.restaurant.dto.request.ProductDetailRequest;
import com.restaurant.dto.response.ProductDetailResponse;
import com.restaurant.service.ProductDetailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class AdminInventoryController {

    private final ProductDetailService productDetailService;

    @GetMapping
    public ResponseEntity<List<ProductDetailResponse>> getAllProductDetails() {
        return ResponseEntity.ok(productDetailService.getAllProductDetails());
    }

    @GetMapping("/by-product/{productId}")
    public ResponseEntity<List<ProductDetailResponse>> getByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(productDetailService.getProductDetailsByMenuItemId(productId));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductDetailResponse>> getLowStockAlerts() {
        return ResponseEntity.ok(productDetailService.getLowStockAlerts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productDetailService.getProductDetailById(id));
    }

    @PostMapping
    public ResponseEntity<ProductDetailResponse> create(@Valid @RequestBody ProductDetailRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productDetailService.createProductDetail(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> update(@PathVariable Long id, @Valid @RequestBody ProductDetailRequest request) {
        return ResponseEntity.ok(productDetailService.updateProductDetail(id, request));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<ProductDetailResponse> updateStock(@PathVariable Long id, @RequestBody Map<String, Double> payload) {
        Double change = payload.getOrDefault("change", 0.0);
        return ResponseEntity.ok(productDetailService.updateStock(id, change));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productDetailService.deleteProductDetail(id);
        return ResponseEntity.noContent().build();
    }
}
