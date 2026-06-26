package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.RaceEntryRequest;
import com.swp391.horseracing.dto.response.RaceEntryResponse;

import java.util.List;

public interface RaceEntryService {
    RaceEntryResponse registerHorse(Integer raceId, RaceEntryRequest request);
    List<RaceEntryResponse> getEntriesByRace(Integer raceId);
    List<RaceEntryResponse> getMyHorseEntries();
    void approveEntry(Integer id);
    void rejectEntry(Integer id);
    List<RaceEntryResponse> getApprovedEntries(Integer raceId);
}
