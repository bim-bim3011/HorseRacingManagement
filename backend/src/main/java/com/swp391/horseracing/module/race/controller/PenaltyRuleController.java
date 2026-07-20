package com.swp391.horseracing.module.race.controller;

import com.swp391.horseracing.module.race.dto.request.PenaltyRuleRequest;
import com.swp391.horseracing.module.common.dto.ApiResponse;
import com.swp391.horseracing.module.race.dto.response.PenaltyRuleResponse;
import com.swp391.horseracing.module.race.service.PenaltyRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments/{tournamentId}/penalty-rules")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Penalty Rule", description = "Penalty rule management APIs")
public class PenaltyRuleController {
    PenaltyRuleService penaltyRuleService;
    @PostMapping
    @Operation(
            summary = "Create Penalty Rule",
            description = "Tournament must exist first. Only ADMIN can create penalty rule for a tournament"
    )
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<PenaltyRuleResponse> create(@PathVariable Integer tournamentId,
                                                   @RequestBody PenaltyRuleRequest request) {
        return ApiResponse.success(penaltyRuleService.createPenaltyRule(tournamentId, request));
    }

    @GetMapping
    @Operation(summary = "Get All Penalty Rules", description = "Get all penalty rules of tournament")
    public ApiResponse<List<PenaltyRuleResponse>> getAll(@PathVariable Integer tournamentId) {
        return ApiResponse.success(penaltyRuleService.getPenaltyRules(tournamentId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Penalty Rule", description = "Only ADMIN can update penalty rule")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<PenaltyRuleResponse> update(@PathVariable("tournamentId") Integer tournamentId,@PathVariable ("id")Integer id,@RequestBody PenaltyRuleRequest request) {
        return ApiResponse.success(penaltyRuleService.updatePenaltyRule(tournamentId,id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Penalty Rule", description = "Only ADMIN can delete penalty rule")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<String> delete(@PathVariable Integer tournamentId, @PathVariable("id") Integer id) {
        penaltyRuleService.deletePenaltyRule(tournamentId,id);
        return ApiResponse.success("Delete successfully!");
    }
}
