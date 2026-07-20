package com.swp391.horseracing.module.race.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
@Data
public class RaceRequest {
    @NotBlank(message = "Name is required")
    private String name;
    @NotNull(message = "Race datetime is required")
    private LocalDateTime raceDatetime;
    private Integer roundOrder;
    private Boolean isFinal;
    private Integer maxEntries;
    private Integer qualifyCount;
    @NotNull(message = "Distance is required")
    private Integer distance;
}
