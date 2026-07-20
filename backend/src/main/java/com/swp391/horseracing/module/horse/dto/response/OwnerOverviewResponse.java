package com.swp391.horseracing.module.horse.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class OwnerOverviewResponse {
    private Integer totalHorses;
    private Integer hiredJockeys;
    private Integer upcomingRaces;
    private Integer totalFirstPlaces;
    private List<HorseStatsDto> topHorses;
    private List<UpcomingRaceOverviewDto> upcomingSchedule;
}
