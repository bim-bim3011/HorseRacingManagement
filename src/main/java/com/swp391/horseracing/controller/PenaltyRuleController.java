package com.swp391.horseracing.controller;

import com.swp391.horseracing.dto.request.PenaltyRuleRequest;
import com.swp391.horseracing.dto.response.ApiResponse;
import com.swp391.horseracing.dto.response.PenaltyRuleResponse;
import com.swp391.horseracing.service.PenaltyRuleService;
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
public class PenaltyRuleController {
    PenaltyRuleService penaltyRuleService;
    //Giải đấu tồn tại  → tạo penalty_rule được điều kiện cần
    @PostMapping
    //@PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PenaltyRuleResponse> create(@PathVariable Integer tournamentId,
                                                   @RequestBody PenaltyRuleRequest request) {
        return ApiResponse.success(penaltyRuleService.createPenaltyRule(tournamentId, request));
    }

    @GetMapping
    public ApiResponse<List<PenaltyRuleResponse>> getAll(@PathVariable Integer tournamentId) {
        return ApiResponse.success(penaltyRuleService.getPenaltyRules(tournamentId));
    }

    @PutMapping("/{id}")
    //@PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PenaltyRuleResponse> update(@PathVariable("tournamentId") Integer tournamentId,@PathVariable ("id")Integer id,@RequestBody PenaltyRuleRequest request) {
        return ApiResponse.success(penaltyRuleService.updatePenaltyRule(tournamentId,id, request));
    }

    @DeleteMapping("/{id}")
    //@PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> delete(@PathVariable Integer tournamentId, @PathVariable("id") Integer id) {
        penaltyRuleService.deletePenaltyRule(tournamentId,id);
        return ApiResponse.success("Delete successfully!");
    }
}
