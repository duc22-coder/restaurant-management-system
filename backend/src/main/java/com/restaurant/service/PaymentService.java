package com.restaurant.service;

import com.restaurant.dto.request.PaymentRequest;
import com.restaurant.dto.response.BankQrResponse;
import com.restaurant.dto.response.PaymentResponse;

public interface PaymentService {
    void requestCustomerPayment(Long tableId);
    PaymentResponse processStaffPayment(PaymentRequest request);
    PaymentResponse getPaymentByOrderId(Long orderId);
    BankQrResponse generateBankQr(String orderCode);
    BankQrResponse generateBankQrByOrderId(Long orderId);
}
