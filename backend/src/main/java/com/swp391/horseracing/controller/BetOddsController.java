package com.swp391.horseracing.controller;


import com.swp391.horseracing.dto.ApiResponse;
import com.swp391.horseracing.dto.request.BetOddsRequest;
import com.swp391.horseracing.dto.response.BetOddsResponse;
import com.swp391.horseracing.service.BetOddsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.swp391.horseracing.entity.tournament.Race;

@RestController
@RequestMapping("/api/races/{raceId}/bet-odds")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Bet Odds", description = "View betting odds for a race")
public class BetOddsController {

    BetOddsService betOddsService;

    @GetMapping
    @Operation(summary = "Get Odds by Race",
            description = "Anyone can view current WIN/PLACE/SHOW odds for all horses in a race")
    public ApiResponse<List<BetOddsResponse>> getOdds(@PathVariable Integer raceId) {
        return ApiResponse.success(betOddsService.getOddsByRace(raceId));
    }
    @PutMapping("/entry/{entryId}")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Set Odds for Entry",
            description = "Only ADMIN can set WIN/PLACE/SHOW odds for a specific horse entry")
    public ApiResponse<String> updateOdds(@PathVariable Integer raceId,
                                          @PathVariable Integer entryId,
                                          @Valid @RequestBody BetOddsRequest request) {
        betOddsService.updateOdds(entryId, request);
        return ApiResponse.success("Odds updated!");
    }

    @PutMapping("/batch")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Set Odds for All Entries in a Race",
            description = "ADMIN can set odds for multiple horses at once")
    public ApiResponse<String> updateBatchOdds(@PathVariable Integer raceId,
                                               @Valid @RequestBody List<com.swp391.horseracing.dto.request.EntryBetOddsRequest> requests) {
        betOddsService.updateBatchOdds(raceId, requests);
        return ApiResponse.success("Batch odds updated successfully!");
    }

    @PostMapping("/init")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Initialize Odds for Race",
               description = "Create default 0.00 odds for all entries in a race for WIN/PLACE/SHOW")
    public ApiResponse<String> initOddsForRace(@PathVariable Integer raceId) {
        betOddsService.initOddsForRace(raceId);
        return ApiResponse.success("Odds initialized successfully for the race!");
    }

    @PatchMapping("/status")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Toggle Betting Status",
               description = "Open or Close betting for the race (status: open, closed, suspended)")
    public ApiResponse<String> toggleBettingStatus(@PathVariable Integer raceId,
                                                   @RequestParam String status) {
        Race.BettingStatus bettingStatus;
        try {
            bettingStatus = Race.BettingStatus.valueOf(status.toLowerCase());
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(com.swp391.horseracing.exception.ErrorCode.UNCATEGORIZED_EXCEPTION, "Invalid status. Allowed: open, closed, suspended, pending");
        }
        betOddsService.toggleBettingStatus(raceId, bettingStatus);
        return ApiResponse.success("Betting status updated to: " + status);
    }

    @GetMapping("/entry/{entryId}")
    @Operation(summary = "Get Odds for specific Entry",
               description = "Get WIN/PLACE/SHOW odds for a specific horse entry")
    public ApiResponse<List<BetOddsResponse>> getOddsByEntry(@PathVariable Integer raceId,
                                                             @PathVariable Integer entryId) {
        return ApiResponse.success(betOddsService.getOddsByEntry(entryId));
    }
}
