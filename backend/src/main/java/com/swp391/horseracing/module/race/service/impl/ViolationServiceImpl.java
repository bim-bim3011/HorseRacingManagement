package com.swp391.horseracing.module.race.service.impl;

import com.swp391.horseracing.core.exception.AppException;
import com.swp391.horseracing.core.exception.ErrorCode;
import com.swp391.horseracing.module.common.entity.result.Violation;
import com.swp391.horseracing.module.race.dto.request.ViolationRequest;
import com.swp391.horseracing.module.race.dto.response.ViolationResponse;
import com.swp391.horseracing.module.race.entity.profile.Referee;
import com.swp391.horseracing.module.race.entity.tournament.PenaltyRule;
import com.swp391.horseracing.module.race.entity.tournament.Race;
import com.swp391.horseracing.module.race.entity.tournament.RaceEntry;
import com.swp391.horseracing.module.race.repository.PenaltyRuleRepository;
import com.swp391.horseracing.module.race.repository.RaceEntryRepository;
import com.swp391.horseracing.module.race.repository.RaceRepository;
import com.swp391.horseracing.module.race.repository.RefereeRepository;
import com.swp391.horseracing.module.race.repository.ViolationRepository;
import com.swp391.horseracing.module.race.service.ViolationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ViolationServiceImpl implements ViolationService {

    ViolationRepository violationRepository;
    RaceRepository raceRepository;
    RaceEntryRepository raceEntryRepository;
    PenaltyRuleRepository penaltyRuleRepository;
    RefereeRepository refereeRepository;

    @Override
    @Transactional
    public List<ViolationResponse> createViolation(Integer raceId, ViolationRequest request) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_NOT_FOUND));

        RaceEntry entry = raceEntryRepository.findById(request.getEntryId())
                .orElseThrow(() -> new AppException(ErrorCode.RACE_ENTRY_NOT_FOUND));

        if (!entry.getRace().getId().equals(raceId)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Referee referee = refereeRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.REFEREE_NOT_FOUND));

        List<ViolationResponse> responses = new ArrayList<>();

        for (Integer ruleId : request.getPenaltyRuleIds()) {
            PenaltyRule penaltyRule = penaltyRuleRepository.findById(ruleId)
                    .orElseThrow(() -> new AppException(ErrorCode.PENALTY_RULE_NOT_FOUND));

            Violation violation = Violation.builder()
                    .race(race)
                    .entry(entry)
                    .referee(referee)
                    .penaltyRule(penaltyRule)
                    .description(request.getDescription())
                    .build();

            Violation savedViolation = violationRepository.save(violation);
            responses.add(mapToResponse(savedViolation));
        }

        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ViolationResponse> getViolationsByRace(Integer raceId) {
        if (!raceRepository.existsById(raceId)) {
            throw new AppException(ErrorCode.RACE_NOT_FOUND);
        }

        List<Violation> violations = violationRepository.findByRaceId(raceId);
        return violations.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteViolation(Integer raceId, Integer violationId) {
        Violation violation = violationRepository.findById(violationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (!violation.getRace().getId().equals(raceId)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        violationRepository.delete(violation);
    }

    private ViolationResponse mapToResponse(Violation violation) {
        return ViolationResponse.builder()
                .id(violation.getId())
                .raceId(violation.getRace().getId())
                .entryId(violation.getEntry().getId())
                .horseName(violation.getEntry().getHorse().getName())
                .laneNumber(violation.getEntry().getLaneNumber())
                .refereeUsername(violation.getReferee().getUsername())
                .penaltyRuleId(violation.getPenaltyRule() != null ? violation.getPenaltyRule().getId() : null)
                .violationType(violation.getPenaltyRule() != null ? violation.getPenaltyRule().getViolationType() : null)
                .pointDeduction(violation.getPenaltyRule() != null ? violation.getPenaltyRule().getPointDeduction() : null)
                .fineAmount(violation.getPenaltyRule() != null ? violation.getPenaltyRule().getFineAmount() : null)
                .banDays(violation.getPenaltyRule() != null ? violation.getPenaltyRule().getBanDays() : null)
                .description(violation.getDescription())
                .build();
    }
}
