package com.restaurant.service.impl;

import com.restaurant.dto.request.PaymentRequest;
import com.restaurant.dto.response.BankQrResponse;
import com.restaurant.dto.response.OrderItemResponse;
import com.restaurant.dto.response.PaymentResponse;
import com.restaurant.entity.Order;
import com.restaurant.entity.OrderItem;
import com.restaurant.entity.Payment;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.PaymentStatus;
import com.restaurant.enums.TableStatus;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.PaymentRepository;
import com.restaurant.repository.RestaurantTableRepository;
import com.restaurant.service.PaymentService;
import com.restaurant.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriUtils;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;
    private final VoucherService voucherService;

    // Thông tin tài khoản ngân hàng nhận thanh toán - cấu hình trong application.yml (restaurant.bank.*)
    @Value("${restaurant.bank.bin}")
    private String bankBin;

    @Value("${restaurant.bank.account-number}")
    private String bankAccountNumber;

    @Value("${restaurant.bank.account-name}")
    private String bankAccountName;

    @Override
    @Transactional
    public void requestCustomerPayment(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn với ID: " + tableId));

        table.setStatus(TableStatus.PAYING);
        tableRepository.save(table);
    }

    @Override
    @Transactional
    public PaymentResponse processStaffPayment(PaymentRequest request) {
        // 1. Tìm Đơn hàng
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + request.getOrderId()));

        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new RuntimeException("Đơn hàng này đã được thanh toán trước đó!");
        }

        // 2. Tính toán số tiền giảm giá
        BigDecimal discount;
        if (request.getVoucherCode() != null && !request.getVoucherCode().isBlank()) {
            // Có mã voucher -> BẮT BUỘC xác thực qua VoucherService (điều kiện, hạn dùng, số lượt còn lại...)
            // KHÔNG tin số tiền discountAmount mà client tự gửi lên, tránh gian lận giảm giá tùy ý.
            discount = voucherService.applyVoucherAndIncrementUsage(request.getVoucherCode(), order.getTotalAmount());
        } else {
            // Không có mã voucher -> cho phép Staff/Quản lý tự nhập số tiền giảm thủ công (giảm giá thiện chí)
            discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
            if (discount.compareTo(order.getTotalAmount()) > 0) {
                throw new RuntimeException("Số tiền giảm giá không được lớn hơn tổng tiền đơn hàng!");
            }
        }
        BigDecimal finalAmount = order.getTotalAmount().subtract(discount);

        // 3. Tạo hoặc Cập nhật bản ghi Thanh toán
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElse(Payment.builder().order(order).build());

        payment.setAmount(finalAmount);
        payment.setVoucherCode(request.getVoucherCode());
        payment.setDiscountAmount(discount);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        // 4. Đánh dấu Đơn hàng thành COMPLETED
        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        // 5. Giải phóng bàn ăn về AVAILABLE nếu không còn đơn chưa hoàn thành nào (chỉ áp dụng cho đơn DINE_IN có bàn)
        RestaurantTable table = order.getTable();
        if (table != null) {
            List<Order> remainingActive = orderRepository.findActiveOrdersByTableId(table.getId());
            if (remainingActive.isEmpty()) {
                table.setStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);
            }
        }


        return mapToResponse(savedPayment, order);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));

        Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);

        if (payment != null) {
            return mapToResponse(payment, order);
        }

        // Tạo dữ liệu xem trước Hóa đơn khi chưa bấm thanh toán
        return PaymentResponse.builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .tableId(order.getTable() != null ? order.getTable().getId() : null)
                .tableNumber(order.getTable() != null ? order.getTable().getTableNumber() : null)
                .amount(order.getTotalAmount())
                .discountAmount(BigDecimal.ZERO)
                .status(PaymentStatus.PENDING)
                .items(mapOrderItems(order))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public BankQrResponse generateBankQr(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + orderCode));

        if (order.getStatus() == OrderStatus.COMPLETED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Đơn hàng này đã hoàn tất hoặc đã hủy, không thể tạo mã thanh toán!");
        }

        // Nội dung chuyển khoản = mã đơn hàng, dùng để nhân viên đối soát trên sao kê ngân hàng xem đơn nào đã được thanh toán
        String transferContent = order.getOrderCode();

        // Dùng dịch vụ công khai img.vietqr.io (chuẩn VietQR, không cần đăng ký/API key) để sinh ảnh QR
        // Khách quét bằng BẤT KỲ app ngân hàng nào hỗ trợ VietQR đều chuyển khoản được ngay.
        // Lưu ý: đây là tạo QR chuyển khoản thủ công - việc xác nhận "đã nhận tiền" vẫn cần nhân viên
        // kiểm tra sao kê rồi bấm xác nhận thanh toán (vì tích hợp webhook realtime cần hợp đồng riêng với ngân hàng/cổng thanh toán).
        String qrImageUrl = String.format(
                "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%s&addInfo=%s&accountName=%s",
                bankBin,
                bankAccountNumber,
                order.getTotalAmount().toBigInteger().toString(),
                UriUtils.encode(transferContent, StandardCharsets.UTF_8),
                UriUtils.encode(bankAccountName, StandardCharsets.UTF_8)
        );

        return BankQrResponse.builder()
                .orderCode(order.getOrderCode())
                .amount(order.getTotalAmount())
                .bankBin(bankBin)
                .accountNumber(bankAccountNumber)
                .accountName(bankAccountName)
                .transferContent(transferContent)
                .qrImageUrl(qrImageUrl)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public BankQrResponse generateBankQrByOrderId(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));
        return generateBankQr(order.getOrderCode());
    }

    private PaymentResponse mapToResponse(Payment payment, Order order) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .tableId(order.getTable() != null ? order.getTable().getId() : null)
                .tableNumber(order.getTable() != null ? order.getTable().getTableNumber() : null)
                .amount(payment.getAmount())
                .voucherCode(payment.getVoucherCode())
                .discountAmount(payment.getDiscountAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .paidAt(payment.getPaidAt())
                .items(mapOrderItems(order))
                .build();
    }

    private List<OrderItemResponse> mapOrderItems(Order order) {
        List<OrderItemResponse> itemResponses = new ArrayList<>();
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                BigDecimal subtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                itemResponses.add(OrderItemResponse.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItem().getId())
                        .menuItemName(item.getMenuItem().getName())
                        .menuItemImage(item.getMenuItem().getImage())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subtotal(subtotal)
                        .note(item.getNote())
                        .status(item.getStatus())
                        .build());
            }
        }
        return itemResponses;
    }
}
