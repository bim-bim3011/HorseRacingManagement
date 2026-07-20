package com.swp391.horseracing.module.race.service;

import com.swp391.horseracing.module.race.dto.response.realtime.RaceSnapshotResponse;
import com.swp391.horseracing.module.race.dto.response.RaceIncidentResponse;
import java.util.List;

public interface RaceSimulationService {
    void startRace(Integer raceId);
    void pauseRace(Integer raceId);
    void resumeRace(Integer raceId);
    void stopRace(Integer raceId);
    void abortRace(Integer tournamentId, Integer raceId);
    RaceSnapshotResponse getRaceState(Integer raceId);
    void flagHorse(Integer raceId, Integer horseId, String refereeUsername);
    List<RaceIncidentResponse> getRaceIncidents(Integer raceId);
}
