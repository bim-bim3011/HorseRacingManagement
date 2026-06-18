package com.swp391.horseracing.controller;

import com.swp391.horseracing.dto.request.RaceEntryRequest;
import com.swp391.horseracing.dto.response.ApiResponse;
import com.swp391.horseracing.dto.response.RaceEntryResponse;
import com.swp391.horseracing.service.RaceEntryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/races/{raceId}/entries")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Race Entry", description = "Race Entry Management API")
public class RaceEntryController {
    RaceEntryService raceEntryService;

    @PostMapping
    @Operation(
            summary = "Register Horse",
            description = "Horse Owner register horse into race"
    )
    public ApiResponse<RaceEntryResponse> register(@PathVariable Integer raceId,
                                                   @RequestBody RaceEntryRequest request) {
        return ApiResponse.success(raceEntryService.registerHorse(raceId, request));
    }
    // Chỉ Admin xem đơn đăng ký
    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(
            summary = "Get Entries by Race",
            description = "Only ADMIN can view all entries"
    )
    public ApiResponse<List<RaceEntryResponse>> getByRace(@PathVariable Integer raceId) {
        return ApiResponse.success(raceEntryService.getEntriesByRace(raceId));
    }
    //khán giả xem ds ngựa đã đc duyệt trong vòng đấu nào
    @GetMapping("/approved")
    @Operation(
            summary = "Get Approved Entries",
            description = "Anyone can view approved entries"
    )
    public ApiResponse<List<RaceEntryResponse>> getApproved(@PathVariable Integer raceId) {
        return ApiResponse.success(raceEntryService.getApprovedEntries(raceId));
    }
    //chủ ngựa xem những con ngựa của mình đã đki
    @GetMapping("/my-entries")
    @Operation(
            summary = "Get My Horse Entries",
            description = "Horse Owner view their horse entries"
    )
    public ApiResponse<List<RaceEntryResponse>> getMyEntries() {
        return ApiResponse.success(raceEntryService.getMyHorseEntries());
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Approve Entry", description = "Only ADMIN can approve race entry")
    public ApiResponse<String> approve(@PathVariable Integer id) {
        raceEntryService.approveEntry(id);
        return ApiResponse.success("Entry approved!");
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Reject Entry", description = "Only ADMIN can reject race entry")
    public ApiResponse<String> reject(@PathVariable Integer id) {
        raceEntryService.rejectEntry(id);
        return ApiResponse.success("Entry rejected!");
    }

}
