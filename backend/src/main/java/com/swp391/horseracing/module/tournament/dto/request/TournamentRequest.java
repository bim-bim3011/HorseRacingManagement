package com.swp391.horseracing.module.tournament.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TournamentRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Start date is required")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate registrationStart;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate registrationEnd;

    private BigDecimal prizePool;

    @NotNull(message = "Registration fee is required")
    private BigDecimal registrationFee;

    @NotNull(message = "Max participants is required")
    private Integer maxParticipants;
    @NotNull(message = "Weight limit is required")
    private Float weightLimit;

    @NotNull(message = "Min horse age is required")
    private Integer minHorseAge;

    @NotNull(message = "Max horse age is required")
    private Integer maxHorseAge;

    @NotBlank(message = "Allowed breed is required")
    private String allowedBreed;


}
