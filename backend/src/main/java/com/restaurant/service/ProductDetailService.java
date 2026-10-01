package com.restaurant.service;

import com.restaurant.dto.request.ProductDetailRequest;
import com.restaurant.dto.response.ProductDetailResponse;

import java.util.List;

public interface ProductDetailService {

    List<ProductDetailResponse> getAllProductDetails();

    List<ProductDetailResponse> getProductDetailsByMenuItemId(Long menuItemId);

    List<ProductDetailResponse> getLowStockAlerts();

    ProductDetailResponse getProductDetailById(Long id);

    ProductDetailResponse createProductDetail(ProductDetailRequest request);

    ProductDetailResponse updateProductDetail(Long id, ProductDetailRequest request);

    ProductDetailResponse updateStock(Long id, Double quantityChange);

    void deleteProductDetail(Long id);
}
