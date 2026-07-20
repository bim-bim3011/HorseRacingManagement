package com.swp391.horseracing.module.race.controller;


import com.swp391.horseracing.module.common.dto.ApiResponse;
import com.swp391.horseracing.module.race.dto.request.RaceReportRequest;
import com.swp391.horseracing.module.race.dto.response.RaceResultResponse;
import com.swp391.horseracing.module.race.service.RaceReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments/{tournamentId}/races/{raceId}")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Race Report & Results", description = "Endpoints for managing race results and referee reports")
public class RaceReportController {

    RaceReportService raceReportService;

    @GetMapping("/results")
    @Operation(summary = "Get final race results", description = "Get the official standings of a finished race")
    public ApiResponse<List<RaceResultResponse>> getRaceResults(
            @PathVariable Integer tournamentId,
            @PathVariable Integer raceId) {
        return ApiResponse.success(raceReportService.getRaceResults(tournamentId, raceId));
    }

    @PostMapping("/reports")
    @Operation(summary = "Confirm results and submit steward's report", description = "Only REFEREE can submit report to finalize race results")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_REFEREE')")
    public ApiResponse<String> confirmRaceResults(
            @PathVariable Integer tournamentId,
            @PathVariable Integer raceId,
            @Valid @RequestBody RaceReportRequest request) {
        raceReportService.confirmRaceResults(tournamentId, raceId, request);
        return ApiResponse.success("Race results confirmed and report submitted successfully");
    }
}
