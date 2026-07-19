package com.swp391.horseracing.module.race.service.impl;

import com.swp391.horseracing.core.exception.AppException;
import com.swp391.horseracing.core.exception.ErrorCode;
import com.swp391.horseracing.module.race.dto.request.RaceReportRequest;
import com.swp391.horseracing.module.race.dto.response.RaceResultResponse;
import com.swp391.horseracing.module.race.entity.profile.Referee;
import com.swp391.horseracing.module.race.entity.result.RaceReport;
import com.swp391.horseracing.module.race.entity.result.RaceResult;
import com.swp391.horseracing.module.race.entity.tournament.Race;
import com.swp391.horseracing.module.race.repository.RaceReportRepository;
import com.swp391.horseracing.module.race.repository.RaceRepository;
import com.swp391.horseracing.module.race.repository.RaceResultRepository;
import com.swp391.horseracing.module.race.repository.RefereeRepository;
import com.swp391.horseracing.module.race.repository.ViolationRepository;
import com.swp391.horseracing.module.race.service.RaceReportService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RaceReportServiceImpl implements RaceReportService {

    RaceRepository raceRepository;
    RaceReportRepository raceReportRepository;
    RaceResultRepository raceResultRepository;
    RefereeRepository refereeRepository;
    ViolationRepository violationRepository;

    @Override
    @Transactional
    public void confirmRaceResults(Integer tournamentId, Integer raceId, RaceReportRequest request) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_NOT_FOUND));

        if (!race.getTournament().getId().equals(tournamentId)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Referee referee = refereeRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.REFEREE_NOT_FOUND));

        // Create Report
        RaceReport report = RaceReport.builder()
                .race(race)
                .referee(referee)
                .content(request.getContent())
                .build();
        
        raceReportRepository.save(report);

        // TODO: Here we could trigger BetOddsService or Betting payouts if needed

    }

    @Override
    public List<RaceResultResponse> getRaceResults(Integer tournamentId, Integer raceId) {
        List<RaceResult> results = raceResultRepository.findByEntry_Race_Id(raceId);
        
        List<RaceResultResponse> responses = results.stream().map(r -> {
            boolean isDSQ = violationRepository.findByRaceId(raceId).stream()
                    .anyMatch(v -> v.getEntry().getId().equals(r.getEntry().getId()) && Boolean.TRUE.equals(v.getPenaltyRule().getIsDisqualification()));

            return RaceResultResponse.builder()
                    .id(r.getId())
                    .raceId(raceId)
                    .horseId(r.getEntry().getHorse().getId())
                    .horseName(r.getEntry().getHorse().getName())
                    .jockeyName(r.getEntry().getJockey() != null ? r.getEntry().getJockey().getUsername() : "Unknown")
                    .laneNumber(r.getEntry().getLaneNumber())
                    .position(r.getPosition())
                    .finishTime(r.getFinishTime())
                    .isDisqualified(isDSQ)
                    .build();
        }).collect(Collectors.toList());

        // Shift positions for valid finishers
        List<RaceResultResponse> validFinishers = responses.stream()
                .filter(r -> r.getIsDisqualified() == null || !r.getIsDisqualified())
                .sorted(Comparator.comparingInt(RaceResultResponse::getPosition))
                .collect(Collectors.toList());

        for (int i = 0; i < validFinishers.size(); i++) {
            validFinishers.get(i).setPosition(i + 1);
        }

        // Set DSQ to 999
        responses.stream()
                .filter(r -> r.getIsDisqualified() != null && r.getIsDisqualified())
                .forEach(r -> r.setPosition(999));

        return responses;
    }
}
