package com.swp391.horseracing.module.jockey.controller;

import com.swp391.horseracing.module.jockey.dto.request.JockeyInvitationRequest;
import com.swp391.horseracing.module.common.dto.ApiResponse;
import com.swp391.horseracing.module.jockey.dto.response.JockeyInvitationResponse;
import com.swp391.horseracing.module.jockey.dto.response.JockeyResponse;
import com.swp391.horseracing.module.jockey.service.JockeyInvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Jockey Invitation", description = "Jockey Invitation Management API")
public class JockeyInvitationController {
    JockeyInvitationService jockeyInvitationService;

    @GetMapping("/available-jockeys")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_HORSE_OWNER')")
    @Operation(
            summary = "Get Available Jockeys",
            description = "Only Horse Owner can view list of approved jockeys")
    public ApiResponse<List<JockeyResponse>> getAvailableJockeys() {
        return ApiResponse.success(jockeyInvitationService.getAvailableJockeys());
    }

    @GetMapping("/available-jockeys/paginated")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_HORSE_OWNER')")
    @Operation(
            summary = "Get Available Jockeys Paginated",
            description = "Only Horse Owner can view list of approved jockeys with pagination")
    public ApiResponse<org.springframework.data.domain.Page<JockeyResponse>> getAvailableJockeysPaginated(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) Float maxWeight,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ApiResponse.success(jockeyInvitationService.getAvailableJockeysPaginated(keyword, gender, minExperience, maxWeight, sortBy, sortDir, page, size));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SCOPE_ROLE_HORSE_OWNER')")
    @Operation(
            summary = "Send Invitation",
            description = "Horse Owner send invitation to a jockey")
    public ApiResponse<JockeyInvitationResponse> sendInvitation(@RequestBody JockeyInvitationRequest request) {
        return ApiResponse.success(jockeyInvitationService.sendInvitation(request));
    }

    @GetMapping("/horse/{horseId}")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_HORSE_OWNER')")
    @Operation(
            summary = "Get Invitations by Horse",
            description = "Horse Owner view invitations sent for a specific horse")
    public ApiResponse<List<JockeyInvitationResponse>> getByHorse(@PathVariable Integer horseId) {
        return ApiResponse.success(jockeyInvitationService.getInvitationsByHorse(horseId));
    }

    @GetMapping("/my-invitations")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_JOCKEY')")
    @Operation(
            summary = "Get My Invitations",
            description = "Jockey view invitations received")
    public ApiResponse<List<JockeyInvitationResponse>> getMyInvitations() {
        return ApiResponse.success(jockeyInvitationService.getMyInvitations());
    }

    @PatchMapping("/{id}/accept")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_JOCKEY')")
    @Operation(
            summary = "Accept Invitation",
            description = "Jockey accept the invitation")
    public ApiResponse<String> accept(@PathVariable Integer id) {
        jockeyInvitationService.acceptInvitation(id);
        return ApiResponse.success("Invitation accepted!");
    }

    @PatchMapping("/{id}/decline")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_JOCKEY')")
    @Operation(
            summary = "Decline Invitation",
            description = "Jockey decline the invitation")
    public ApiResponse<String> decline(@PathVariable Integer id) {
        jockeyInvitationService.declineInvitation(id);
        return ApiResponse.success("Invitation declined!");
    }
}
