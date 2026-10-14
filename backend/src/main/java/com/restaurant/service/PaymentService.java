package com.restaurant.service;

import com.restaurant.dto.request.PaymentRequest;
import com.restaurant.dto.response.BankQrResponse;
import com.restaurant.dto.response.PaymentResponse;

public interface PaymentService {
    void requestCustomerPayment(Long tableId, Long customerId);
    PaymentResponse processStaffPayment(PaymentRequest request);
    PaymentResponse getPaymentByOrderId(Long orderId);
    BankQrResponse generateBankQr(String orderCode, Long customerId);
    BankQrResponse generateBankQrByOrderId(Long orderId, String voucherCode);
}
