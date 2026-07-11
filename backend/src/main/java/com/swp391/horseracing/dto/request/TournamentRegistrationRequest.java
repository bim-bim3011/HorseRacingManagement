package com.swp391.horseracing.dto.request;


import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class TournamentRegistrationRequest {
    @NotEmpty(message = "Horse list cannot be empty")
    private List<Integer> horseIds;
}
