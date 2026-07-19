package com.swp391.horseracing.module.race.service;

import com.swp391.horseracing.module.race.dto.request.RaceReportRequest;
import com.swp391.horseracing.module.race.dto.response.RaceResultResponse;

import java.util.List;

public interface RaceReportService {
    void confirmRaceResults(Integer tournamentId, Integer raceId, RaceReportRequest request);
    List<RaceResultResponse> getRaceResults(Integer tournamentId, Integer raceId);
}
