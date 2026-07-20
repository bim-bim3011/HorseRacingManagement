package com.swp391.horseracing.module.race.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ViolationResponse {
    Integer id;
    Integer raceId;
    Integer entryId;
    String horseName;
    Integer laneNumber;
    String refereeUsername;
    
    // Penalty Rule details
    Integer penaltyRuleId;
    String violationType;
    Integer pointDeduction;
    BigDecimal fineAmount;
    Integer banDays;
    
    String description;
}
