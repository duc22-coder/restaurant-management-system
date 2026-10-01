package com.restaurant.service.impl;

import com.restaurant.dto.request.ProductDetailRequest;
import com.restaurant.dto.response.ProductDetailResponse;
import com.restaurant.entity.MenuItem;
import com.restaurant.entity.ProductDetail;
import com.restaurant.enums.ProductDetailStatus;
import com.restaurant.repository.MenuItemRepository;
import com.restaurant.repository.ProductDetailRepository;
import com.restaurant.service.ProductDetailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductDetailServiceImpl implements ProductDetailService {

    private final ProductDetailRepository productDetailRepository;
    private final MenuItemRepository menuItemRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductDetailResponse> getAllProductDetails() {
        return productDetailRepository.findAllWithMenuItem().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDetailResponse> getProductDetailsByMenuItemId(Long menuItemId) {
        return productDetailRepository.findByMenuItemId(menuItemId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDetailResponse> getLowStockAlerts() {
        return productDetailRepository.findLowStockAlerts().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailResponse getProductDetailById(Long id) {
        ProductDetail detail = productDetailRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm chi tiết với ID: " + id));
        return mapToResponse(detail);
    }

    @Override
    @Transactional
    public ProductDetailResponse createProductDetail(ProductDetailRequest request) {
        if (productDetailRepository.existsBySku(request.getSku())) {
            throw new IllegalArgumentException("Mã SKU/Barcode '" + request.getSku() + "' đã tồn tại!");
        }

        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy món ăn với ID: " + request.getMenuItemId()));

        ProductDetail detail = ProductDetail.builder()
                .menuItem(menuItem)
                .sku(request.getSku().trim().toUpperCase())
                .variantName(request.getVariantName().trim())
                .unit(request.getUnit().trim())
                .stockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0.0)
                .minStockAlert(request.getMinStockAlert() != null ? request.getMinStockAlert() : 5.0)
                .costPrice(request.getCostPrice() != null ? request.getCostPrice() : BigDecimal.ZERO)
                .sellingPrice(request.getSellingPrice() != null ? request.getSellingPrice() : menuItem.getPrice())
                .status(request.getStatus() != null ? request.getStatus() : ProductDetailStatus.ACTIVE)
                .build();

        ProductDetail saved = productDetailRepository.save(detail);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ProductDetailResponse updateProductDetail(Long id, ProductDetailRequest request) {
        ProductDetail detail = productDetailRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm chi tiết với ID: " + id));

        if (!detail.getSku().equalsIgnoreCase(request.getSku().trim()) &&
                productDetailRepository.existsBySku(request.getSku().trim().toUpperCase())) {
            throw new IllegalArgumentException("Mã SKU/Barcode '" + request.getSku() + "' đã tồn tại!");
        }

        if (!detail.getMenuItem().getId().equals(request.getMenuItemId())) {
            MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy món ăn với ID: " + request.getMenuItemId()));
            detail.setMenuItem(menuItem);
        }

        detail.setSku(request.getSku().trim().toUpperCase());
        detail.setVariantName(request.getVariantName().trim());
        detail.setUnit(request.getUnit().trim());
        if (request.getStockQuantity() != null) detail.setStockQuantity(request.getStockQuantity());
        if (request.getMinStockAlert() != null) detail.setMinStockAlert(request.getMinStockAlert());
        if (request.getCostPrice() != null) detail.setCostPrice(request.getCostPrice());
        if (request.getSellingPrice() != null) detail.setSellingPrice(request.getSellingPrice());
        if (request.getStatus() != null) detail.setStatus(request.getStatus());

        ProductDetail updated = productDetailRepository.save(detail);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public ProductDetailResponse updateStock(Long id, Double quantityChange) {
        ProductDetail detail = productDetailRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm chi tiết với ID: " + id));

        double newQuantity = (detail.getStockQuantity() != null ? detail.getStockQuantity() : 0.0) + quantityChange;
        if (newQuantity < 0) {
            newQuantity = 0.0;
        }
        detail.setStockQuantity(newQuantity);
        if (newQuantity <= 0) {
            detail.setStatus(ProductDetailStatus.OUT_OF_STOCK);
        } else if (detail.getStatus() == ProductDetailStatus.OUT_OF_STOCK) {
            detail.setStatus(ProductDetailStatus.ACTIVE);
        }

        return mapToResponse(productDetailRepository.save(detail));
    }

    @Override
    @Transactional
    public void deleteProductDetail(Long id) {
        if (!productDetailRepository.existsById(id)) {
            throw new IllegalArgumentException("Không tìm thấy sản phẩm chi tiết với ID: " + id);
        }
        productDetailRepository.deleteById(id);
    }

    private ProductDetailResponse mapToResponse(ProductDetail detail) {
        boolean isLow = detail.getStockQuantity() != null && detail.getMinStockAlert() != null
                && detail.getStockQuantity() <= detail.getMinStockAlert();

        return ProductDetailResponse.builder()
                .id(detail.getId())
                .menuItemId(detail.getMenuItem() != null ? detail.getMenuItem().getId() : null)
                .menuItemName(detail.getMenuItem() != null ? detail.getMenuItem().getName() : null)
                .sku(detail.getSku())
                .variantName(detail.getVariantName())
                .unit(detail.getUnit())
                .stockQuantity(detail.getStockQuantity())
                .minStockAlert(detail.getMinStockAlert())
                .costPrice(detail.getCostPrice())
                .sellingPrice(detail.getSellingPrice())
                .status(detail.getStatus())
                .isLowStock(isLow)
                .createdAt(detail.getCreatedAt())
                .updatedAt(detail.getUpdatedAt())
                .build();
    }
}
