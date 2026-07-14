package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.response.realtime.RaceSnapshotResponse;

public interface RaceSimulationService {
    void startRace(Integer raceId);
    void pauseRace(Integer raceId);
    void resumeRace(Integer raceId);
    void stopRace(Integer raceId);
    RaceSnapshotResponse getRaceState(Integer raceId);
    void flagHorse(Integer raceId, Integer horseId, String refereeUsername);
}
