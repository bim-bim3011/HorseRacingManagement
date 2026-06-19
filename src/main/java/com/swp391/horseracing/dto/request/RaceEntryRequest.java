package com.swp391.horseracing.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RaceEntryRequest {
    @NotNull(message = "Horse ID is required")
    private Integer horseId;
}
