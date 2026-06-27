package com.swp391.horseracing.service;


import com.swp391.horseracing.dto.response.RaceEntryResponse;
import com.swp391.horseracing.entity.tournament.Race;
import com.swp391.horseracing.entity.tournament.TournamentRegistration;

import java.util.List;

public interface RaceEntryService {
    void createEntryForRegistration(Race race, TournamentRegistration registration);
    List<RaceEntryResponse> getMyHorseEntries();
    void replaceWithReserve(Integer mainEntryId);
    //void advanceToNextRound(Integer currentRaceId);
    List<RaceEntryResponse> getEntriesByRace(Integer raceId);
}
