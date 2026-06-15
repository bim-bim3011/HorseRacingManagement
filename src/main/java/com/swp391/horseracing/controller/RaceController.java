package com.swp391.horseracing.controller;


import com.swp391.horseracing.dto.request.RaceRequest;
import com.swp391.horseracing.dto.response.ApiResponse;
import com.swp391.horseracing.dto.response.RaceResponse;
import com.swp391.horseracing.service.RaceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments/{tournamentId}/races")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RaceController {
    RaceService raceService;

    @PostMapping
    //@PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<RaceResponse> create(@PathVariable Integer tournamentId,
                                            @RequestBody RaceRequest request) {
        return ApiResponse.success(raceService.createRace(tournamentId, request));
    }

    @GetMapping
    public ApiResponse<List<RaceResponse>> getAll(@PathVariable Integer tournamentId) {
        return ApiResponse.success(raceService.getAllRaces(tournamentId));
    }

    @GetMapping("/{id}")
    public ApiResponse<RaceResponse> getOne(@PathVariable Integer tournamentId,
                                            @PathVariable Integer id) {
        return ApiResponse.success(raceService.getRace(tournamentId, id));
    }

    @PutMapping("/{id}")
    //@PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<RaceResponse> update(@PathVariable Integer tournamentId,
                                            @PathVariable Integer id,
                                            @RequestBody RaceRequest request) {
        return ApiResponse.success(raceService.updateRace(tournamentId, id, request));
    }

    @DeleteMapping("/{id}")
    //@PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> delete(@PathVariable Integer tournamentId,
                                      @PathVariable Integer id) {
        raceService.deleteRace(tournamentId, id);
        return ApiResponse.success("Delete successfully!");
    }

    @PatchMapping("/{id}/activate")
    //@PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> activate(@PathVariable Integer tournamentId,
                                        @PathVariable Integer id) {
        raceService.activateRace(tournamentId, id);
        return ApiResponse.success("Race activated!");
    }
}
