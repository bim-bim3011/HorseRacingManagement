package com.swp391.horseracing.module.race.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ViolationRequest {
    
    @NotNull(message = "Entry ID is required")
    Integer entryId;

    @NotEmpty(message = "At least one Penalty Rule ID is required")
    List<Integer> penaltyRuleIds;

    @NotBlank(message = "Description is required")
    String description;
}
