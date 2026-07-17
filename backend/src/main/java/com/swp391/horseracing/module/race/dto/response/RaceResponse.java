package com.swp391.horseracing.module.race.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
@Getter
@Builder
public class RaceResponse {
    private Integer id;
    private String name;
    private LocalDateTime raceDatetime;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String status;
    private String bettingStatus;
    private Integer roundOrder;
    private Boolean isFinal;
    private Integer maxEntries;
    private Integer qualifyCount;
    private Integer distance;
    private Integer tournamentId;
}
