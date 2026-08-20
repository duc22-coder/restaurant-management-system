package com.restaurant.dto.response;

import com.restaurant.enums.TableStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableResponse {

    private Long id;
    private String tableNumber;
    private Integer capacity;
    private TableStatus status;
    private String qrCode;
    private Long activeOrderId;
    private String activeOrderCode;
}
