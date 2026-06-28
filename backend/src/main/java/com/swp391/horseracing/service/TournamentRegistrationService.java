package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.TournamentRegistrationRequest;
import com.swp391.horseracing.dto.response.TournamentRegistrationResponse;

import java.util.List;

public interface TournamentRegistrationService {
    TournamentRegistrationResponse register(Integer tournamentId, TournamentRegistrationRequest request);
    List<TournamentRegistrationResponse> getByTournament(Integer tournamentId);
    List<TournamentRegistrationResponse> getMyRegistrations();
    void approveRegistration(Integer id);
    void rejectRegistration(Integer id);


}
