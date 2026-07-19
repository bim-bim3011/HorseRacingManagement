package com.swp391.horseracing.module.race.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
@Data
public class PenaltyRuleRequest {
    @NotBlank(message = "Violation type is required")
    private String violationType;

    @NotNull(message = "Point deduction is required")
    private Integer pointDeduction;

    @NotNull(message = "Fine amount is required")
    private BigDecimal fineAmount;

    @NotNull(message = "Ban days is required")
    private Integer banDays;
    private String description;
    
    private Boolean isDisqualification;
}
