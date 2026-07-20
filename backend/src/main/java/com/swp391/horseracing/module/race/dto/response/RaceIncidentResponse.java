package com.swp391.horseracing.module.race.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RaceIncidentResponse {
    private Integer id;
    private Integer horseId;
    private String horseName;
    private Integer laneNumber;
    private String refereeUsername;
    private Long timestamp;
    private LocalDateTime createdAt;
}
