package com.swp391.horseracing.controller;


import com.swp391.horseracing.dto.response.ApiResponse;
import com.swp391.horseracing.dto.response.BetOddsResponse;
import com.swp391.horseracing.service.BetOddsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
