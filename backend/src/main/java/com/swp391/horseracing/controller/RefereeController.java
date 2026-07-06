package com.swp391.horseracing.controller;


import com.swp391.horseracing.dto.request.RefereeCreationRequest;
import com.swp391.horseracing.dto.request.RefereeAssignmentRequest;
import com.swp391.horseracing.dto.request.UpdateRefereeRequest;
import com.swp391.horseracing.dto.ApiResponse;
import com.swp391.horseracing.dto.response.RefereeAssignmentResponse;
import com.swp391.horseracing.dto.response.RefereeResponse;
import com.swp391.horseracing.service.RefereeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/referee")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Referee", description = "Referee assignment API")
public class RefereeController {
    RefereeService refereeService;

    @PostMapping
    @Operation(summary = "Create referee account", description = "Only ADMIN can create referee account")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<RefereeResponse> createReferee(@Valid @RequestBody RefereeCreationRequest request) {
        return ApiResponse.success(refereeService.createReferee(request));
    }

    @GetMapping
    @Operation(summary = "Get all referees", description = "Only ADMIN can view referee accounts")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<List<RefereeResponse>> getAllReferees() {
        return ApiResponse.success(refereeService.getAllReferees());
    }

    @GetMapping("/active")
    @Operation(summary = "Get active referees", description = "Only ADMIN can view active referees for assignment")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<List<RefereeResponse>> getActiveReferees() {
        return ApiResponse.success(refereeService.getActiveReferees());
    }

    @GetMapping("/{refereeId}")
    @Operation(summary = "Get referee by id", description = "Only ADMIN can view referee detail")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<RefereeResponse> getReferee(@PathVariable Integer refereeId) {
        return ApiResponse.success(refereeService.getReferee(refereeId));
    }

    @PutMapping("/{refereeId}")
    @Operation(summary = "Update referee account", description = "Only ADMIN can update referee account")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<RefereeResponse> updateReferee(@PathVariable Integer refereeId,
                                                      @Valid @RequestBody UpdateRefereeRequest request) {
        return ApiResponse.success(refereeService.updateReferee(refereeId, request));
    }

    @DeleteMapping("/{refereeId}")
    @Operation(summary = "Delete referee account", description = "Only ADMIN can deactivate referee account")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<String> deleteReferee(@PathVariable Integer refereeId) {
        refereeService.deleteReferee(refereeId);
        return ApiResponse.success("Referee deactivated successfully!");
    }

    @GetMapping("/{refereeId}/assignments")
    @Operation(summary = "Get referee assignments", description = "Only ADMIN can view assignments by referee")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<List<RefereeAssignmentResponse>> getAssignmentsByReferee(@PathVariable Integer refereeId) {
        return ApiResponse.success(refereeService.getAssignmentsByReferee(refereeId));
    }

    @GetMapping("/races/{raceId}/assignments")
    @Operation(summary = "Get race referee assignments", description = "Only ADMIN can view assigned referees of a race")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<List<RefereeAssignmentResponse>> getAssignmentsByRace(@PathVariable Integer raceId) {
        return ApiResponse.success(refereeService.getAssignmentsByRace(raceId));
    }

    @PostMapping("/races/{raceId}/assignments")
    @Operation(summary = "Assign referee to race", description = "Only ADMIN can assign referee to race")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<RefereeAssignmentResponse> assignToRace(@PathVariable Integer raceId,
                                                               @Valid @RequestBody RefereeAssignmentRequest request) {
        return ApiResponse.success(refereeService.assignToRace(raceId, request));
    }

    @DeleteMapping("/races/{raceId}/assignments/{refereeId}")
    @Operation(summary = "Unassign referee from race", description = "Only ADMIN can remove referee assignment")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<String> unassignFromRace(@PathVariable Integer raceId,
                                                @PathVariable Integer refereeId) {
        refereeService.unassignFromRace(raceId, refereeId);
        return ApiResponse.success("Referee unassigned successfully!");
    }
}
