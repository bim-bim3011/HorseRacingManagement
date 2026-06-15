package com.swp391.horseracing.controller;

import com.swp391.horseracing.dto.request.TournamentRequest;
import com.swp391.horseracing.dto.response.ApiResponse;
import com.swp391.horseracing.dto.response.TournamentResponse;
import com.swp391.horseracing.service.TournamentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TournamentController {
    TournamentService tournamentService;
    @PostMapping
    //@PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<TournamentResponse> create(@RequestBody TournamentRequest request) {
        return ApiResponse.success(tournamentService.createTournament(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<TournamentResponse> getOne(@PathVariable Integer id) {
        return ApiResponse.success(tournamentService.getTournament(id));
    }

    @PutMapping("/{id}")
    //@PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<TournamentResponse> update(@PathVariable Integer id,
                                                  @RequestBody TournamentRequest request) {
        return ApiResponse.success(tournamentService.updateTournament(id, request));
    }

    @DeleteMapping("/{id}")
    //@PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> delete(@PathVariable Integer id) {
        tournamentService.deleteTournament(id);
        return ApiResponse.success("Delete successfully!");
    }
    @GetMapping
    public ApiResponse<List<TournamentResponse>> getAll() {
        return ApiResponse.success(tournamentService.getAllTournaments());
    }
}
