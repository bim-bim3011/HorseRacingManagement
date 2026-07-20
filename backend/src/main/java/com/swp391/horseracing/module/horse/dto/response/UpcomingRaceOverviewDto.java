package com.swp391.horseracing.module.horse.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpcomingRaceOverviewDto {
    private Integer raceId;
    private String raceName;
    private String tournamentName;
    private LocalDateTime raceDatetime;
    private String horseName;
    private String jockeyName;
}
