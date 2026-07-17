package com.swp391.horseracing.module.race.service;


import com.swp391.horseracing.module.common.dto.request.RejectEntryRequest;
import com.swp391.horseracing.module.race.dto.response.RaceEntryResponse;
import com.swp391.horseracing.module.jockey.entity.profile.Jockey;
import com.swp391.horseracing.module.race.entity.tournament.Race;
import com.swp391.horseracing.module.tournament.entity.tournament.TournamentRegistration;

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
    RaceEntryResponse rejectEntry(Integer entryId, RejectEntryRequest request);
}
