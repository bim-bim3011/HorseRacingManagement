package com.swp391.horseracing.module.horse.dto.response.realtime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HorseTickState {
    private Long horseId;
    private double progress;
    private double speed;
    private double stamina;
    private int rank;
    private boolean finished;
    private String effect; // Optional: STUMBLED, SPRINTING, etc.
    private boolean isFlagged;
}
