package com.swp391.horseracing.module.race.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RaceResultResponse {
    private Integer id;
    private Integer raceId;
    private Integer horseId;
    private String horseName;
    private String jockeyName;
    private Integer laneNumber;
    private Integer position;
    private LocalTime finishTime;
    private Boolean isDisqualified;
}
