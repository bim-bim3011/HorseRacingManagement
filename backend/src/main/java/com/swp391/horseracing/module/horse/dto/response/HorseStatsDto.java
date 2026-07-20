package com.swp391.horseracing.module.horse.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HorseStatsDto {
    private Integer horseId;
    private String horseName;
    private Long firstPlaces;
}
