package com.swp391.horseracing.module.race.controller;


import com.swp391.horseracing.module.common.dto.ApiResponse;
import com.swp391.horseracing.module.common.dto.request.RejectEntryRequest;
import com.swp391.horseracing.module.race.dto.response.RaceEntryResponse;
import com.swp391.horseracing.module.race.service.RaceEntryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.swp391.horseracing.module.race.dto.request.RaceEntryRequest;
import java.util.List;

@RestController
@RequestMapping("/api/race-entries")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Race Entry", description = "Race Entry Management API")
public class RaceEntryController {
    RaceEntryService raceEntryService;


    @GetMapping("/my-entries")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_HORSE_OWNER')")
    @Operation(summary = "Get My Horse Entries",
            description = "Horse Owner view their horses' current race entries, including lane number")
    public ApiResponse<List<RaceEntryResponse>> getMyEntries() {
        return ApiResponse.success(raceEntryService.getMyHorseEntries());
    }

    @GetMapping("/jockey-entries")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_JOCKEY')")
    @Operation(summary = "Get My Jockey Entries",
            description = "Jockey view their assigned race entries")
    public ApiResponse<List<RaceEntryResponse>> getMyJockeyEntries() {
        return ApiResponse.success(raceEntryService.getMyJockeyEntries());
    }

    @PatchMapping("/{id}/replace-with-reserve")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Replace with Reserve", description = "Only ADMIN can replace a main entry with the next available reserve horse")
    public ApiResponse<String> replaceWithReserve(@PathVariable Integer id) {
        raceEntryService.replaceWithReserve(id);
        return ApiResponse.success("Replaced with reserve horse!");
    }
    @GetMapping("/race/{raceId}")
    @Operation(summary = "Get Entries by Race", description = "View all entries of a specific race")
    public ApiResponse<List<RaceEntryResponse>> getByRace(@PathVariable Integer raceId) {
        return ApiResponse.success(raceEntryService.getEntriesByRace(raceId));
    }

    @PostMapping("/race/{raceId}/assign")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Assign Horse to Race", description = "Only ADMIN can manually assign a horse to a scheduled race")
    public ApiResponse<RaceEntryResponse> manuallyAssignHorse(@PathVariable Integer raceId, @RequestBody RaceEntryRequest request) {
        return ApiResponse.success(raceEntryService.manuallyAssignHorse(raceId, request.getHorseId()));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_REFEREE')")
    @Operation(summary = "Reject Race Entry", description = "Referee can reject a horse during the checking phase")
    public ApiResponse<RaceEntryResponse> rejectEntry(@PathVariable Integer id, @jakarta.validation.Valid @RequestBody RejectEntryRequest request) {
        return ApiResponse.success(raceEntryService.rejectEntry(id, request));
    }
}
