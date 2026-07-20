package com.swp391.horseracing.module.jockey.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class JockeyInvitationRequest {
    @NotNull(message = "Race ID is required")
    private Integer raceId;

    @NotNull(message = "Horse ID is required")
    private Integer horseId;

    @NotNull(message = "Jockey ID is required")
    private Integer jockeyId;

}
