package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.PlaceBetRequest;
import com.swp391.horseracing.dto.response.BetResponse;

import java.util.List;

public interface BetService {
    BetResponse placeBet(PlaceBetRequest request);
    List<BetResponse> getMyBets();
    void settleBetsForRace(Integer raceId);
}
