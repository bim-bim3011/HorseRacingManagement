package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.TournamentRequest;
import com.swp391.horseracing.dto.response.TournamentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TournamentService {
    TournamentResponse createTournament(TournamentRequest request, MultipartFile banner);
    TournamentResponse getTournament(Integer id);
    TournamentResponse updateTournament(Integer id, TournamentRequest request, MultipartFile banner);
    void deleteTournament(Integer id);
    List<TournamentResponse> getAllTournaments();
}
