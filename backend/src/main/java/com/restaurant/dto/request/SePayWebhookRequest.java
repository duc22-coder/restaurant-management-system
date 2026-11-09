package com.restaurant.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SePayWebhookRequest(
        Long id,
        String transferType,
        BigDecimal transferAmount,
        String content
) {}
