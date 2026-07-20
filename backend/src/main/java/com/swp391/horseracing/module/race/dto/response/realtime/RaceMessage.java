package com.swp391.horseracing.module.race.dto.response.realtime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RaceMessage<T> {
    private String type; // TICK, FINISHED, INCIDENT, PAUSED
    private T data;
}
