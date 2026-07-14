package com.swp391.horseracing.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RaceEntryResponse {
    private Integer id;
    private Integer raceId;
    private String raceName;
    private String tournamentName;
    private Integer horseId;
    private String horseName;
    private String jockeyName;
    private Integer laneNumber;
    private String status;
    private String rejectionReason;
}
