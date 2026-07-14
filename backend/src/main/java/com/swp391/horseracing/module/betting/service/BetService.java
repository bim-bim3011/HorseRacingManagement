package com.swp391.horseracing.module.betting.service;

import com.swp391.horseracing.module.betting.dto.request.PlaceBetRequest;
import com.swp391.horseracing.module.betting.dto.response.BetResponse;

import java.util.List;

public interface BetService {
    BetResponse placeBet(PlaceBetRequest request);
    List<BetResponse> getMyBets();
    void settleBetsForRace(Integer raceId);
}
