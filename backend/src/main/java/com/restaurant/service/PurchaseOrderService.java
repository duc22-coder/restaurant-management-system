package com.restaurant.service;

import com.restaurant.dto.request.PurchaseOrderRequest;
import com.restaurant.dto.response.PurchaseOrderResponse;
import com.restaurant.enums.PurchaseOrderStatus;

import java.util.List;

public interface PurchaseOrderService {

    List<PurchaseOrderResponse> getAllPurchaseOrders();

    List<PurchaseOrderResponse> getPurchaseOrdersByStatus(PurchaseOrderStatus status);

    PurchaseOrderResponse getPurchaseOrderById(Long id);

    PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request, Long creatorId);

    PurchaseOrderResponse completePurchaseOrder(Long id);

    PurchaseOrderResponse cancelPurchaseOrder(Long id);
}
