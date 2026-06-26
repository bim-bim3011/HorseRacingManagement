package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.PenaltyRuleRequest;
import com.swp391.horseracing.dto.response.PenaltyRuleResponse;

import java.util.List;

public interface PenaltyRuleService {
    PenaltyRuleResponse createPenaltyRule(Integer tournamentId, PenaltyRuleRequest request);
    List<PenaltyRuleResponse> getPenaltyRules(Integer tournamentId);
    PenaltyRuleResponse updatePenaltyRule(Integer tournamentId,Integer id, PenaltyRuleRequest request);
    void deletePenaltyRule(Integer tournamentId,Integer id);
}
