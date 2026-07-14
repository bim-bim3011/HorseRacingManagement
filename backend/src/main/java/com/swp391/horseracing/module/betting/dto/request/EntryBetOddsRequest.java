package com.swp391.horseracing.module.betting.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class EntryBetOddsRequest {
    @NotNull(message = "Entry ID is required")
    private Integer entryId;

    @NotNull(message = "Win odds is required")
    private BigDecimal winOdds;

    @NotNull(message = "Place odds is required")
    private BigDecimal placeOdds;

    @NotNull(message = "Show odds is required")
    private BigDecimal showOdds;
}
