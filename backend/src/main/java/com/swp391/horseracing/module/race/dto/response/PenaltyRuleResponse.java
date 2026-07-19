package com.swp391.horseracing.module.race.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
@Getter
@Builder
public class PenaltyRuleResponse {
    private Integer id;
    private String violationType;
    private Integer pointDeduction;
    private BigDecimal fineAmount;
    private Integer banDays;
    private String description;
    private Boolean isDisqualification;
}
