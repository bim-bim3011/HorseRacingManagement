package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.TournamentRegistrationRequest;
import com.swp391.horseracing.dto.response.TournamentRegistrationResponse;

import java.util.List;

public interface TournamentRegistrationService {
    List<TournamentRegistrationResponse> register(Integer tournamentId, TournamentRegistrationRequest request);
    List<TournamentRegistrationResponse> getByTournament(Integer tournamentId);
    List<TournamentRegistrationResponse> getMyRegistrations(Integer tournamentId);
    void approveRegistration(Integer tournamentId, Integer id);
    void rejectRegistration(Integer tournamentId, Integer id);


}
