package com.swp391.horseracing.module.tournament.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class TournamentResponse {
    private Integer id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Float weightLimit;
    private Integer minHorseAge;
    private Integer maxHorseAge;
    private String allowedBreed;
    private LocalDate registrationStart;
    private LocalDate registrationEnd;
    private BigDecimal prizePool;
    private BigDecimal registrationFee;
    private Integer maxParticipants;
    private String bannerUrl;
}
