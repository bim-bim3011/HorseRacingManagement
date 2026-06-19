package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.request.PenaltyRuleRequest;
import com.swp391.horseracing.dto.response.PenaltyRuleResponse;
import com.swp391.horseracing.entity.tournament.PenaltyRule;
import com.swp391.horseracing.entity.tournament.Tournament;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.PenaltyRuleRepository;
import com.swp391.horseracing.repository.TournamentRepository;
import com.swp391.horseracing.service.PenaltyRuleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PenaltyRuleServiceImpl implements PenaltyRuleService {
    PenaltyRuleRepository penaltyRuleRepository;
    TournamentRepository tournamentRepository;
    @Override
    public PenaltyRuleResponse createPenaltyRule(Integer tournamentId, PenaltyRuleRequest request) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.TOURNAMENT_NOT_FOUND));

        PenaltyRule penaltyRule = PenaltyRule.builder()
                .tournament(tournament)
                .violationType(request.getViolationType())
                .pointDeduction(request.getPointDeduction())
                .fineAmount(request.getFineAmount())
                .banDays(request.getBanDays())
                .description(request.getDescription())
                .build();

        penaltyRuleRepository.save(penaltyRule);
        return mapToResponse(penaltyRule);
    }

    @Override
    public List<PenaltyRuleResponse> getPenaltyRules(Integer tournamentId) {
        tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.TOURNAMENT_NOT_FOUND));
        return penaltyRuleRepository.findByTournamentId(tournamentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public PenaltyRuleResponse updatePenaltyRule(Integer tournamentId,Integer id, PenaltyRuleRequest request) {
        tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.TOURNAMENT_NOT_FOUND));
        PenaltyRule penaltyRule = penaltyRuleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PENALTY_RULE_NOT_FOUND));
        if (!penaltyRule.getTournament().getId().equals(tournamentId))
            throw new AppException(ErrorCode.PENALTY_RULE_NOT_BELONG_TO_TOURNAMENT);
        penaltyRule.setViolationType(request.getViolationType());
        penaltyRule.setPointDeduction(request.getPointDeduction());
        penaltyRule.setFineAmount(request.getFineAmount());
        penaltyRule.setBanDays(request.getBanDays());
        penaltyRule.setDescription(request.getDescription());

        penaltyRuleRepository.save(penaltyRule);
        return mapToResponse(penaltyRule);
    }

    @Override
    public void deletePenaltyRule(Integer tournamentId,Integer id) {
        tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.TOURNAMENT_NOT_FOUND));
        PenaltyRule penaltyRule = penaltyRuleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PENALTY_RULE_NOT_FOUND));


        if (!penaltyRule.getTournament().getId().equals(tournamentId))
            throw new AppException(ErrorCode.PENALTY_RULE_NOT_BELONG_TO_TOURNAMENT);
        penaltyRuleRepository.delete(penaltyRule);
    }
    private PenaltyRuleResponse mapToResponse(PenaltyRule penaltyRule) {
        return PenaltyRuleResponse.builder()
                .id(penaltyRule.getId())
                .violationType(penaltyRule.getViolationType())
                .pointDeduction(penaltyRule.getPointDeduction())
                .fineAmount(penaltyRule.getFineAmount())
                .banDays(penaltyRule.getBanDays())
                .description(penaltyRule.getDescription())
                .build();
    }
}
