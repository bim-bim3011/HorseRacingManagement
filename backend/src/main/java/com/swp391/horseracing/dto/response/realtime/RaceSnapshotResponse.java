package com.swp391.horseracing.dto.response.realtime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RaceSnapshotResponse {
    private Integer raceId;
    private String status; // RUNNING, FINISHED, PAUSED
    private double distance;
    private long tick;
    private List<HorseTickState> horses;
}
