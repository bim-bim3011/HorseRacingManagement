package com.swp391.horseracing.controller;


import com.swp391.horseracing.dto.request.TournamentRegistrationRequest;
import com.swp391.horseracing.dto.response.ApiResponse;
import com.swp391.horseracing.dto.response.TournamentRegistrationResponse;
import com.swp391.horseracing.service.TournamentRegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments/{tournamentId}/registrations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Tournament Registration", description = "Tournament Registration Management API")
public class TournamentRegistrationController {

    TournamentRegistrationService tournamentRegistrationService;

    @PostMapping
    @PreAuthorize("hasAuthority('SCOPE_ROLE_HORSE_OWNER')")
    @Operation(summary = "Register Horse to Tournament",
            description = "Horse Owner register horse into an ongoing tournament")
    public ApiResponse<TournamentRegistrationResponse> register(@PathVariable Integer tournamentId,
                                                                @RequestBody TournamentRegistrationRequest request) {
        return ApiResponse.success(tournamentRegistrationService.register(tournamentId, request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Get Registrations by Tournament",
            description = "Only ADMIN can view all registrations of a tournament")
    public ApiResponse<List<TournamentRegistrationResponse>> getByTournament(@PathVariable Integer tournamentId) {
        return ApiResponse.success(tournamentRegistrationService.getByTournament(tournamentId));
    }

    @GetMapping("/my-registrations")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_HORSE_OWNER')")
    @Operation(summary = "Get My Registrations",
            description = "Horse Owner view their own tournament registrations")
    public ApiResponse<List<TournamentRegistrationResponse>> getMyRegistrations(@PathVariable Integer tournamentId) {
        return ApiResponse.success(tournamentRegistrationService.getMyRegistrations());
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Approve Registration",
            description = "Only ADMIN can approve a registration, which auto-creates a race entry in round 1")
    public ApiResponse<String> approve(@PathVariable Integer tournamentId, @PathVariable Integer id) {
        tournamentRegistrationService.approveRegistration(id);
        return ApiResponse.success("Registration approved!");
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Reject Registration",
            description = "Only ADMIN can reject a registration")
    public ApiResponse<String> reject(@PathVariable Integer tournamentId, @PathVariable Integer id) {
        tournamentRegistrationService.rejectRegistration(id);
        return ApiResponse.success("Registration rejected!");
    }
}
