package com.restaurant.service.impl;

import com.restaurant.entity.Order;
import com.restaurant.entity.Payment;
import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.PaymentMethod;
import com.restaurant.enums.PaymentStatus;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.PaymentRepository;
import com.restaurant.repository.RestaurantTableRepository;
import com.restaurant.service.VoucherService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplSePayTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private RestaurantTableRepository tableRepository;
    @Mock
    private VoucherService voucherService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    @Test
    void confirmsOnlyIncomingTransferWithMatchingOrderAndAmount() {
        Order order = mock(Order.class);
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(PaymentMethod.BANK_TRANSFER)
                .amount(new BigDecimal("250.00"))
                .discountAmount(BigDecimal.ZERO)
                .status(PaymentStatus.PENDING)
                .build();
        when(paymentRepository.findBySepayTransactionId("77")).thenReturn(Optional.empty());
        when(orderRepository.findByOrderCodeForUpdate("ORD-TEST-1")).thenReturn(Optional.of(order));
        when(order.getId()).thenReturn(15L);
        when(order.getStatus()).thenReturn(OrderStatus.PENDING);
        when(order.getTotalAmount()).thenReturn(new BigDecimal("250.00"));
        when(order.getTable()).thenReturn(null);
        when(paymentRepository.findByOrderId(15L)).thenReturn(Optional.of(payment));

        paymentService.processSePayWebhook("77", "ORD-TEST-1", new BigDecimal("250.00"));

        assertEquals(PaymentStatus.COMPLETED, payment.getStatus());
        assertEquals("77", payment.getSepayTransactionId());
        verify(order).setStatus(OrderStatus.COMPLETED);
        verify(orderRepository).save(order);
        verify(paymentRepository).save(payment);
    }

    @Test
    void rejectsTransferWhenAmountDoesNotMatch() {
        Order order = mock(Order.class);
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(PaymentMethod.BANK_TRANSFER)
                .amount(new BigDecimal("250.00"))
                .discountAmount(BigDecimal.ZERO)
                .status(PaymentStatus.PENDING)
                .build();
        when(paymentRepository.findBySepayTransactionId("78")).thenReturn(Optional.empty());
        when(orderRepository.findByOrderCodeForUpdate("ORD-TEST-2")).thenReturn(Optional.of(order));
        when(order.getId()).thenReturn(16L);
        when(order.getStatus()).thenReturn(OrderStatus.PENDING);
        when(order.getTotalAmount()).thenReturn(new BigDecimal("250.00"));
        when(paymentRepository.findByOrderId(16L)).thenReturn(Optional.of(payment));

        assertThrows(IllegalArgumentException.class,
                () -> paymentService.processSePayWebhook("78", "ORD-TEST-2", new BigDecimal("200.00")));

        verify(paymentRepository, never()).save(any());
        verify(orderRepository, never()).save(any());
    }

    @Test
    void acknowledgesDuplicateSePayTransactionWithoutApplyingItAgain() {
        when(paymentRepository.findBySepayTransactionId("79"))
                .thenReturn(Optional.of(Payment.builder().build()));

        paymentService.processSePayWebhook("79", "ORD-TEST-3", new BigDecimal("100.00"));

        verifyNoInteractions(orderRepository);
        verify(paymentRepository, never()).save(any());
    }
}
