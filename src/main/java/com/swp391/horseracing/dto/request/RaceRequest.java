package com.swp391.horseracing.dto.request;

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
    private Integer distance;
    private Float weightLimit;
    private Integer minHorseAge;
    private Integer maxHorseAge;
}
