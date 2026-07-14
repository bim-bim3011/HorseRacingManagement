package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.BetOddsRequest;
import com.swp391.horseracing.dto.response.BetOddsResponse;
import com.swp391.horseracing.entity.tournament.RaceEntry;

import java.util.List;

public interface BetOddsService {
    void initOddsForEntry(RaceEntry entry);
    void updateOdds(Integer entryId, BetOddsRequest request);
    void updateBatchOdds(Integer raceId, List<com.swp391.horseracing.dto.request.EntryBetOddsRequest> requests);
    List<BetOddsResponse> getOddsByRace(Integer raceId);
    void initOddsForRace(Integer raceId);
    void toggleBettingStatus(Integer raceId, com.swp391.horseracing.entity.tournament.Race.BettingStatus status);
    List<BetOddsResponse> getOddsByEntry(Integer entryId);
}
