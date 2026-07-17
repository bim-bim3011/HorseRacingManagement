package com.swp391.horseracing.module.horse.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class HorseProfileResponse {
    private Integer id;
    private String name;
    private String breed;
    private String horseCode;
    private String gender;
    private LocalDate dateOfBirth;
    private Double height;
    private Double weight;
    private String healthStatus;
    private String healthCertificateUrl;
    private String status;
    
    private String ownerName;

    // Statistics
    private Integer totalRaces;
    private Double winRate;
    private Double top3Rate;
    private Integer totalViolations;

    // History
    private List<RaceHistoryDto> raceHistory;
    private List<ViolationDto> violations;
}
