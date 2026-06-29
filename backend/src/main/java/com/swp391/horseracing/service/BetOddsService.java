package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.response.BetOddsResponse;
import com.swp391.horseracing.entity.tournament.Race;

import java.util.List;

public interface BetOddsService {
    void generateOddsForRace(Race race);
    List<BetOddsResponse> getOddsByRace(Integer raceId);
}
