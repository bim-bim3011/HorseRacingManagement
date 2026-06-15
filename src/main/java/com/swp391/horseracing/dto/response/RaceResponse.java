package com.swp391.horseracing.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
@Getter
@Builder
public class RaceResponse {
    private Integer id;
    private String name;
    private LocalDateTime raceDatetime;
    private String status;
    private Integer distance;
    private Float weightLimit;
    private Integer minHorseAge;
    private Integer maxHorseAge;
    private Integer tournamentId;
}
