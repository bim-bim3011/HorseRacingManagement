package com.swp391.horseracing.module.horse.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class RaceHistoryDto {
    private Integer raceId;
    private String tournamentName;
    private String raceName;
    private LocalDateTime raceDate;
    private String jockeyName;
    private Integer laneNumber;
    private Integer rank;
    private String status;
}
