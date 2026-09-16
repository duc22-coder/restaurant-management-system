package com.restaurant.service.impl;

import com.restaurant.dto.request.VoucherRequest;
import com.restaurant.dto.response.VoucherApplyResponse;
import com.restaurant.dto.response.VoucherResponse;
import com.restaurant.entity.Voucher;
import com.restaurant.enums.DiscountType;
import com.restaurant.repository.VoucherRepository;
import com.restaurant.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponse> getAllVouchers() {
        return voucherRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VoucherResponse createVoucher(VoucherRequest request) {
        if (Boolean.TRUE.equals(voucherRepository.existsByCode(request.getCode()))) {
            throw new RuntimeException("Mã voucher '" + request.getCode() + "' đã tồn tại!");
        }
        validateDiscountValue(request);

        Voucher voucher = Voucher.builder()
                .code(request.getCode().trim().toUpperCase())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .usageLimit(request.getUsageLimit())
                .usedCount(0)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        return mapToResponse(voucherRepository.save(voucher));
    }

    @Override
    @Transactional
    public VoucherResponse updateVoucher(Long id, VoucherRequest request) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher với ID: " + id));

        if (!voucher.getCode().equalsIgnoreCase(request.getCode())
                && Boolean.TRUE.equals(voucherRepository.existsByCode(request.getCode()))) {
            throw new RuntimeException("Mã voucher '" + request.getCode() + "' đã tồn tại!");
        }
        validateDiscountValue(request);

        voucher.setCode(request.getCode().trim().toUpperCase());
        voucher.setDescription(request.getDescription());
        voucher.setDiscountType(request.getDiscountType());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        voucher.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO);
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
        voucher.setUsageLimit(request.getUsageLimit());
        if (request.getActive() != null) {
            voucher.setActive(request.getActive());
        }

        return mapToResponse(voucherRepository.save(voucher));
    }

    @Override
    @Transactional
    public void deleteVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher với ID: " + id));
        voucherRepository.delete(voucher);
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherApplyResponse validateVoucher(String code, BigDecimal orderAmount) {
        Voucher voucher = getValidVoucherOrThrow(code, orderAmount);
        BigDecimal discountAmount = computeDiscount(voucher, orderAmount);

        return VoucherApplyResponse.builder()
                .code(voucher.getCode())
                .discountAmount(discountAmount)
                .finalAmount(orderAmount.subtract(discountAmount))
                .build();
    }

    @Override
    @Transactional
    public BigDecimal applyVoucherAndIncrementUsage(String code, BigDecimal orderAmount) {
        Voucher voucher = getValidVoucherOrThrow(code, orderAmount);
        BigDecimal discountAmount = computeDiscount(voucher, orderAmount);

        voucher.setUsedCount(voucher.getUsedCount() + 1);
        voucherRepository.save(voucher);

        return discountAmount;
    }

    // ================= Private Helpers =================

    private Voucher getValidVoucherOrThrow(String code, BigDecimal orderAmount) {
        Voucher voucher = voucherRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Mã voucher '" + code + "' không tồn tại!"));

        if (!Boolean.TRUE.equals(voucher.getActive())) {
            throw new RuntimeException("Voucher này hiện không còn hoạt động!");
        }

        LocalDateTime now = LocalDateTime.now();
        if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
            throw new RuntimeException("Voucher chưa đến thời gian áp dụng!");
        }
        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
            throw new RuntimeException("Voucher đã hết hạn sử dụng!");
        }

        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new RuntimeException("Voucher đã hết lượt sử dụng!");
        }

        BigDecimal minOrder = voucher.getMinOrderAmount() != null ? voucher.getMinOrderAmount() : BigDecimal.ZERO;
        if (orderAmount.compareTo(minOrder) < 0) {
            throw new RuntimeException("Đơn hàng cần tối thiểu " + minOrder + "đ để áp dụng voucher này!");
        }

        return voucher;
    }

    private BigDecimal computeDiscount(Voucher voucher, BigDecimal orderAmount) {
        BigDecimal discount;
        if (voucher.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderAmount.multiply(voucher.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
            if (voucher.getMaxDiscountAmount() != null && discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discount = voucher.getMaxDiscountAmount();
            }
        } else {
            discount = voucher.getDiscountValue();
        }

        // Số tiền giảm không bao giờ được vượt quá tổng tiền đơn hàng
        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }
        return discount;
    }

    private void validateDiscountValue(VoucherRequest request) {
        if (request.getDiscountType() == DiscountType.PERCENTAGE
                && request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new RuntimeException("Giảm giá theo % không được vượt quá 100%!");
        }
    }

    private VoucherResponse mapToResponse(Voucher voucher) {
        return VoucherResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .description(voucher.getDescription())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .minOrderAmount(voucher.getMinOrderAmount())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .usageLimit(voucher.getUsageLimit())
                .usedCount(voucher.getUsedCount())
                .active(voucher.getActive())
                .createdAt(voucher.getCreatedAt())
                .build();
    }
}
