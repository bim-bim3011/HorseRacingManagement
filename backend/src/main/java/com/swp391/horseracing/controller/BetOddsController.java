package com.swp391.horseracing.controller;


import com.swp391.horseracing.dto.request.BetOddsRequest;
import com.swp391.horseracing.dto.response.ApiResponse;
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
}
