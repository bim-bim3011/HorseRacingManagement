package com.swp391.horseracing.module.jockey.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class JockeyInvitationResponse {
    private Integer id;
    private String raceName;
    private String horseName;
    private String jockeyName;
    private String status;
    
    private LocalDateTime raceDatetime;
    private Integer raceDistance;
    private String tournamentName;
    private String raceRound;
    
    private String ownerName;
    private String horseBreed;
    private String horseGender;
    private Integer horseAge;
    private String horseHealthStatus;
}
