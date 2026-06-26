package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.RaceEntryRequest;
import com.swp391.horseracing.dto.response.RaceEntryResponse;

import java.util.List;

public interface RaceEntryService {
    RaceEntryResponse registerHorse(Integer tournamentId, RaceEntryRequest request);
    List<RaceEntryResponse> getEntriesByTournament(Integer tournamentId);
    List<RaceEntryResponse> getMyHorseEntries();
    void approveEntry(Integer id);
    void rejectEntry(Integer id);
    List<RaceEntryResponse> getApprovedEntriesByTournament(Integer tournamentId);
    void replaceWithReserve(Integer mainEntryId);
}
