package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.RaceRequest;
import com.swp391.horseracing.dto.response.RaceResponse;

import java.util.List;

public interface RaceService {
    RaceResponse createRace(Integer tournamentId, RaceRequest request);
    RaceResponse getRace(Integer tournamentId, Integer id);
    RaceResponse updateRace(Integer tournamentId, Integer id, RaceRequest request);
    void deleteRace(Integer tournamentId, Integer id);
    List<RaceResponse> getAllRaces(Integer tournamentId);
    void activateRace(Integer tournamentId, Integer raceId);
}
