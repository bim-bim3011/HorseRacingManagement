package com.swp391.horseracing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TournamentRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Distance is required")
    private Integer distance;

    @NotNull(message = "Weight limit is required")
    private Float weightLimit;

    @NotNull(message = "Min horse age is required")
    private Integer minHorseAge;

    @NotNull(message = "Max horse age is required")
    private Integer maxHorseAge;

    @NotBlank(message = "Allowed breed is required")
    private String allowedBreed;

    @NotNull(message = "Max main entries is required")
    private Integer maxMainEntries;
    @NotNull(message = "Max reserve entries is required")
    private Integer maxReserveEntries;
}
