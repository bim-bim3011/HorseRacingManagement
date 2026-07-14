package com.swp391.horseracing.service;


import com.swp391.horseracing.dto.response.RaceEntryResponse;
import com.swp391.horseracing.entity.profile.Jockey;
import com.swp391.horseracing.entity.tournament.Race;
import com.swp391.horseracing.entity.tournament.TournamentRegistration;

import java.util.List;

public interface RaceEntryService {
    void createEntryForRegistration(Race race, TournamentRegistration registration);
    List<RaceEntryResponse> getMyHorseEntries();
    List<RaceEntryResponse> getMyJockeyEntries();
    void replaceWithReserve(Integer mainEntryId);
    //void advanceToNextRound(Integer currentRaceId);
    List<RaceEntryResponse> getEntriesByRace(Integer raceId);
    void assignJockey(Integer raceId, Integer horseId, Jockey jockey);
    RaceEntryResponse manuallyAssignHorse(Integer raceId, Integer horseId);
    RaceEntryResponse rejectEntry(Integer entryId, com.swp391.horseracing.dto.request.RejectEntryRequest request);
}
