package com.swp391.horseracing.module.race.controller;

import com.swp391.horseracing.module.common.dto.ApiResponse;
import com.swp391.horseracing.module.race.dto.request.ViolationRequest;
import com.swp391.horseracing.module.race.dto.response.ViolationResponse;
import com.swp391.horseracing.module.race.service.ViolationService;
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
@RequestMapping("/api/tournaments/{tournamentId}/races/{raceId}/violations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Violation", description = "Violation management APIs")
public class ViolationController {

    ViolationService violationService;

    @PostMapping
    @Operation(summary = "Create a new violation", description = "Only REFEREE can create a violation")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_REFEREE')")
    public ApiResponse<List<ViolationResponse>> createViolation(
            @PathVariable Integer tournamentId,
            @PathVariable Integer raceId,
            @Valid @RequestBody ViolationRequest request) {
        return ApiResponse.success(violationService.createViolation(raceId, request));
    }

    @GetMapping
    @Operation(summary = "Get all violations of a race", description = "ADMIN and REFEREE can view")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN') or hasAuthority('SCOPE_ROLE_REFEREE')")
    public ApiResponse<List<ViolationResponse>> getViolations(
            @PathVariable Integer tournamentId,
            @PathVariable Integer raceId) {
        return ApiResponse.success(violationService.getViolationsByRace(raceId));
    }

    @DeleteMapping("/{violationId}")
    @Operation(summary = "Delete a violation", description = "Only REFEREE can delete a violation")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_REFEREE')")
    public ApiResponse<String> deleteViolation(
            @PathVariable Integer tournamentId,
            @PathVariable Integer raceId,
            @PathVariable Integer violationId) {
        violationService.deleteViolation(raceId, violationId);
        return ApiResponse.success("Delete successfully!");
    }
}
