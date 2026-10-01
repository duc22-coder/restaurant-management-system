package com.restaurant.service.impl;

import com.restaurant.dto.request.PurchaseOrderItemRequest;
import com.restaurant.dto.request.PurchaseOrderRequest;
import com.restaurant.dto.response.PurchaseOrderItemResponse;
import com.restaurant.dto.response.PurchaseOrderResponse;
import com.restaurant.entity.ProductDetail;
import com.restaurant.entity.PurchaseOrder;
import com.restaurant.entity.PurchaseOrderItem;
import com.restaurant.entity.User;
import com.restaurant.enums.ProductDetailStatus;
import com.restaurant.enums.PurchaseOrderStatus;
import com.restaurant.repository.ProductDetailRepository;
import com.restaurant.repository.PurchaseOrderItemRepository;
import com.restaurant.repository.PurchaseOrderRepository;
import com.restaurant.repository.UserRepository;
import com.restaurant.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final ProductDetailRepository productDetailRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAllWithCreator().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getPurchaseOrdersByStatus(PurchaseOrderStatus status) {
        return purchaseOrderRepository.findByStatusWithCreator(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPurchaseOrderById(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu nhập kho với ID: " + id));
        return mapToResponse(po);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request, Long creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản người tạo với ID: " + creatorId));

        String code = generateOrderCode();

        PurchaseOrder po = PurchaseOrder.builder()
                .code(code)
                .creator(creator)
                .supplierName(request.getSupplierName().trim())
                .supplierPhone(request.getSupplierPhone())
                .supplierAddress(request.getSupplierAddress())
                .note(request.getNote())
                .status(PurchaseOrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (PurchaseOrderItemRequest itemReq : request.getItems()) {
            ProductDetail detail = productDetailRepository.findById(itemReq.getProductDetailId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy SPCT với ID: " + itemReq.getProductDetailId()));

            BigDecimal lineTotal = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            total = total.add(lineTotal);

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(po)
                    .productDetail(detail)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(itemReq.getUnitPrice())
                    .totalPrice(lineTotal)
                    .note(itemReq.getNote())
                    .build();

            po.getItems().add(item);
        }

        po.setTotalAmount(total);
        PurchaseOrder saved = purchaseOrderRepository.save(po);
        log.info("Tạo phiếu nhập kho thành công: {}", saved.getCode());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse completePurchaseOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu nhập kho với ID: " + id));

        if (po.getStatus() == PurchaseOrderStatus.COMPLETED) {
            throw new IllegalStateException("Phiếu nhập kho này đã được duyệt và cộng tồn kho trước đó!");
        }
        if (po.getStatus() == PurchaseOrderStatus.CANCELLED) {
            throw new IllegalStateException("Không thể hoàn tất phiếu nhập đã bị hủy!");
        }

        // Tự động CỘNG TỒN KHO vào các SPCT tương ứng
        List<PurchaseOrderItem> items = purchaseOrderItemRepository.findByPurchaseOrderId(id);
        for (PurchaseOrderItem item : items) {
            ProductDetail detail = item.getProductDetail();
            double oldStock = detail.getStockQuantity() != null ? detail.getStockQuantity() : 0.0;
            double newStock = oldStock + item.getQuantity();

            detail.setStockQuantity(newStock);
            detail.setCostPrice(item.getUnitPrice()); // Cập nhật giá vốn mới nhất

            if (detail.getStatus() == ProductDetailStatus.OUT_OF_STOCK && newStock > 0) {
                detail.setStatus(ProductDetailStatus.ACTIVE);
            }
            productDetailRepository.save(detail);
            log.info("Cộng tồn kho SPCT [{} - {}]: {} -> {}", detail.getSku(), detail.getVariantName(), oldStock, newStock);
        }

        po.setStatus(PurchaseOrderStatus.COMPLETED);
        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse cancelPurchaseOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu nhập kho với ID: " + id));

        if (po.getStatus() == PurchaseOrderStatus.COMPLETED) {
            throw new IllegalStateException("Phiếu nhập đã hoàn tất không thể hủy! Nếu muốn hoàn hàng, vui lòng tạo phiếu xuất kho/nhập âm.");
        }

        po.setStatus(PurchaseOrderStatus.CANCELLED);
        return mapToResponse(purchaseOrderRepository.save(po));
    }

    private String generateOrderCode() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"));
        return "PN" + timestamp;
    }

    private PurchaseOrderResponse mapToResponse(PurchaseOrder po) {
        List<PurchaseOrderItemResponse> itemResponses = (po.getItems() != null)
                ? po.getItems().stream().map(this::mapItemToResponse).collect(Collectors.toList())
                : new ArrayList<>();

        return PurchaseOrderResponse.builder()
                .id(po.getId())
                .code(po.getCode())
                .creatorId(po.getCreator() != null ? po.getCreator().getId() : null)
                .creatorName(po.getCreator() != null ? po.getCreator().getFullName() : null)
                .supplierName(po.getSupplierName())
                .supplierPhone(po.getSupplierPhone())
                .supplierAddress(po.getSupplierAddress())
                .status(po.getStatus())
                .totalAmount(po.getTotalAmount())
                .note(po.getNote())
                .items(itemResponses)
                .createdAt(po.getCreatedAt())
                .updatedAt(po.getUpdatedAt())
                .build();
    }

    private PurchaseOrderItemResponse mapItemToResponse(PurchaseOrderItem item) {
        ProductDetail detail = item.getProductDetail();
        String detailName = (detail != null && detail.getMenuItem() != null)
                ? detail.getMenuItem().getName() + " (" + detail.getVariantName() + ")"
                : "N/A";

        return PurchaseOrderItemResponse.builder()
                .id(item.getId())
                .productDetailId(detail != null ? detail.getId() : null)
                .productDetailSku(detail != null ? detail.getSku() : null)
                .productDetailName(detailName)
                .unit(detail != null ? detail.getUnit() : null)
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .note(item.getNote())
                .build();
    }
}
