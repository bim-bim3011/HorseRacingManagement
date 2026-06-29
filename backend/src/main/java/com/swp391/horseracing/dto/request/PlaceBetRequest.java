package com.swp391.horseracing.dto.request;


import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PlaceBetRequest {
    @NotNull(message = "Entry ID is required")
    private Integer entryId;

    @NotNull(message = "Bet type is required")
    private String betType; // "win", "place", "show"

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1000", message = "Amount must be at least 1000")
    private BigDecimal amount;
}
