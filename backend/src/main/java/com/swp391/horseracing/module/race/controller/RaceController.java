package com.swp391.horseracing.module.race.controller;


import com.swp391.horseracing.module.race.dto.request.RaceRequest;
import com.swp391.horseracing.module.common.dto.ApiResponse;
import com.swp391.horseracing.module.race.dto.response.RaceResponse;
import com.swp391.horseracing.module.race.service.RaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name= "Race",description= "Race Management API")
public class RaceController {
    RaceService raceService;

    @PostMapping
    @Operation(summary = "Create Race", description = "Tournament must exist. Only ADMIN can create race")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<RaceResponse> create(@PathVariable Integer tournamentId,
                                            @RequestBody RaceRequest request) {
        return ApiResponse.success(raceService.createRace(tournamentId, request));
    }

    @GetMapping
    @Operation(summary = "Get All Races", description = "Get all races of tournament")
    public ApiResponse<List<RaceResponse>> getAll(@PathVariable Integer tournamentId) {
        return ApiResponse.success(raceService.getAllRaces(tournamentId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Race by ID", description = "Get race detail by ID")
    public ApiResponse<RaceResponse> getOne(@PathVariable Integer tournamentId,
                                            @PathVariable Integer id) {
        return ApiResponse.success(raceService.getRace(tournamentId, id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Race", description = "Only ADMIN can update race")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<RaceResponse> update(@PathVariable Integer tournamentId,
                                            @PathVariable Integer id,
                                            @RequestBody RaceRequest request) {
        return ApiResponse.success(raceService.updateRace(tournamentId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Race", description = "Only ADMIN can delete race")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<String> delete(@PathVariable Integer tournamentId,
                                      @PathVariable Integer id) {
        raceService.deleteRace(tournamentId, id);
        return ApiResponse.success("Delete successfully!");
    }

    @PatchMapping("/{id}/activate")
    @Operation(
            summary = "Activate Race",
            description = "Tournament must have penalty rules and standards (weight, age, breed). Race must have round order, max entries, qualify count, and at least 1 referee assigned"
    )
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<String> activate(@PathVariable Integer tournamentId,
                                        @PathVariable Integer id) {
        raceService.activateRace(tournamentId, id);
        return ApiResponse.success("Race activated!");
    }

    @PatchMapping("/{id}/ready")
    @Operation(summary = "Mark Ready for Race", description = "Referee marks checking phase as completed")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_REFEREE') or hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<String> markReadyForRace(@PathVariable Integer tournamentId,
                                        @PathVariable Integer id) {
        raceService.markReadyForRace(tournamentId, id);
        return ApiResponse.success("Race marked as ready to run!");
    }

}
