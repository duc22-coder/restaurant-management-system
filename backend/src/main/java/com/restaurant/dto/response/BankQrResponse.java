package com.restaurant.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankQrResponse {

    private String orderCode;
    private BigDecimal amount;
    private String bankBin;
    private String accountNumber;
    private String accountName;
    private String transferContent;   // Nội dung chuyển khoản - dùng để đối soát đơn hàng nào đã được thanh toán
    private String qrImageUrl;        // Ảnh QR chuẩn VietQR - quét bằng app ngân hàng bất kỳ để chuyển khoản
}
