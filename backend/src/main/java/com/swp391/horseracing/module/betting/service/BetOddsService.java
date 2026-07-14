package com.swp391.horseracing.module.betting.service;

import com.swp391.horseracing.module.betting.dto.request.BetOddsRequest;
import com.swp391.horseracing.module.betting.dto.request.EntryBetOddsRequest;
import com.swp391.horseracing.module.betting.dto.response.BetOddsResponse;
import com.swp391.horseracing.module.race.entity.tournament.Race;
import com.swp391.horseracing.module.race.entity.tournament.RaceEntry;

import java.util.List;

public interface BetOddsService {
    void initOddsForEntry(RaceEntry entry);
    void updateOdds(Integer entryId, BetOddsRequest request);
    void updateBatchOdds(Integer raceId, List<EntryBetOddsRequest> requests);
    List<BetOddsResponse> getOddsByRace(Integer raceId);
    void initOddsForRace(Integer raceId);
    void toggleBettingStatus(Integer raceId, Race.BettingStatus status);
    List<BetOddsResponse> getOddsByEntry(Integer entryId);
}
