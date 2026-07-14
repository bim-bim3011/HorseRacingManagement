package com.swp391.horseracing.controller;


import com.swp391.horseracing.dto.ApiResponse;
import com.swp391.horseracing.dto.request.PlaceBetRequest;
import com.swp391.horseracing.dto.response.BetResponse;
import com.swp391.horseracing.service.BetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/bets")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Betting", description = "Spectator betting API")
public class BetController {

    BetService betService;

    @PostMapping
    @Operation(summary = "Place Bet",
            description = "Authenticated user places a bet on a horse (win/place/show)")
    public ApiResponse<BetResponse> placeBet(@Valid @RequestBody PlaceBetRequest request) {
        return ApiResponse.success(betService.placeBet(request));
    }

    @GetMapping("/my-bets")
    @Operation(summary = "Get My Bets",
            description = "View my own betting history")
    public ApiResponse<List<BetResponse>> getMyBets() {
        return ApiResponse.success(betService.getMyBets());
    }

    @PostMapping("/settle/{raceId}")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Settle Bets",
            description = "Only ADMIN can settle all pending bets for a race after RaceResult is confirmed")
    public ApiResponse<String> settleBets(@PathVariable Integer raceId) {
        betService.settleBetsForRace(raceId);
        return ApiResponse.success("Bets settled!");
    }

}
