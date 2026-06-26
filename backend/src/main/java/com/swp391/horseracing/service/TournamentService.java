package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.TournamentRequest;
import com.swp391.horseracing.dto.response.TournamentResponse;

import java.util.List;

public interface TournamentService {
    TournamentResponse createTournament(TournamentRequest request);
    TournamentResponse getTournament(Integer id);
    TournamentResponse updateTournament(Integer id, TournamentRequest request);
    void deleteTournament(Integer id);
    List<TournamentResponse> getAllTournaments();
}
