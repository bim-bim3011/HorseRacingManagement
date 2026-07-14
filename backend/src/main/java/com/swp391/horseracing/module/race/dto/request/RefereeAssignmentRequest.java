package com.swp391.horseracing.module.race.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RefereeAssignmentRequest {
    @NotNull(message = "Referee id is required")
    private Integer refereeId;
}
