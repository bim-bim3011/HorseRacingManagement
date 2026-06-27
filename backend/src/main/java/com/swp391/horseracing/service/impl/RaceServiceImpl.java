package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.request.RaceRequest;
import com.swp391.horseracing.dto.response.RaceResponse;
import com.swp391.horseracing.entity.tournament.Race;
import com.swp391.horseracing.entity.tournament.Tournament;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.*;
import com.swp391.horseracing.service.RaceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RaceServiceImpl implements RaceService {
    RaceRepository raceRepository;
    TournamentRepository tournamentRepository;
    RefereeAssignmentRepository refereeAssignmentRepository;
    @Override
    public RaceResponse createRace(Integer tournamentId, RaceRequest request) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.TOURNAMENT_NOT_FOUND));

        Race race = Race.builder()
                .tournament(tournament)
                .name(request.getName())
                .raceDatetime(request.getRaceDatetime())
                .roundOrder(request.getRoundOrder())
                .isFinal(request.getIsFinal())
                .maxEntries(request.getMaxEntries())
                .qualifyCount(request.getQualifyCount())
                .build();

        raceRepository.save(race);
        return mapToResponse(race);
    }

    @Override
    public RaceResponse getRace(Integer tournamentId, Integer id) {
        tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.TOURNAMENT_NOT_FOUND));

        Race race = raceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_NOT_FOUND));

        if (!race.getTournament().getId().equals(tournamentId))
            throw new AppException(ErrorCode.RACE_NOT_BELONG_TO_TOURNAMENT);

        return mapToResponse(race);
    }

    @Override
    public RaceResponse updateRace(Integer tournamentId, Integer id, RaceRequest request) {
        tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.TOURNAMENT_NOT_FOUND));

        Race race = raceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_NOT_FOUND));

        if (!race.getTournament().getId().equals(tournamentId))
            throw new AppException(ErrorCode.RACE_NOT_BELONG_TO_TOURNAMENT);

        race.setName(request.getName());
        race.setRaceDatetime(request.getRaceDatetime());
        race.setRoundOrder(request.getRoundOrder());
        race.setIsFinal(request.getIsFinal());
        race.setMaxEntries(request.getMaxEntries());
        race.setQualifyCount(request.getQualifyCount());


        return mapToResponse(raceRepository.save(race));
    }

    @Override
    public void deleteRace(Integer tournamentId, Integer id) {
        tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.TOURNAMENT_NOT_FOUND));

        Race race = raceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_NOT_FOUND));

        if (!race.getTournament().getId().equals(tournamentId))
            throw new AppException(ErrorCode.RACE_NOT_BELONG_TO_TOURNAMENT);

        raceRepository.delete(race);
    }

    @Override
    public List<RaceResponse> getAllRaces(Integer tournamentId) {
        tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.TOURNAMENT_NOT_FOUND));

        return raceRepository.findByTournamentId(tournamentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void activateRace(Integer tournamentId, Integer raceId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.TOURNAMENT_NOT_FOUND));

        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_NOT_FOUND));

        if (!race.getTournament().getId().equals(tournamentId))
            throw new AppException(ErrorCode.RACE_NOT_BELONG_TO_TOURNAMENT);

        if (tournament.getPenaltyRules().isEmpty())
            throw new AppException(ErrorCode.TOURNAMENT_MISSING_PENALTY_RULES);



        if (race.getMaxEntries() == null || race.getQualifyCount() == null || race.getRoundOrder() == null)
            throw new AppException(ErrorCode.RACE_MISSING_STANDARDS);

        int refereeCount = refereeAssignmentRepository.countByRaceId(raceId);
        if (refereeCount < 1)
            throw new AppException(ErrorCode.RACE_MISSING_REFEREES);
        race.setStatus(Race.RaceStatus.checking);
        tournament.setStatus(Tournament.TournamentStatus.ongoing);

        raceRepository.save(race);
        tournamentRepository.save(tournament);
    }


    private RaceResponse mapToResponse(Race race) {
        return RaceResponse.builder()
                .id(race.getId())
                .name(race.getName())
                .raceDatetime(race.getRaceDatetime())
                .startedAt(race.getStartedAt())
                .endedAt(race.getEndedAt())
                .status(race.getStatus().name())
                .roundOrder(race.getRoundOrder())
                .isFinal(race.getIsFinal())
                .maxEntries(race.getMaxEntries())
                .qualifyCount(race.getQualifyCount())
                .tournamentId(race.getTournament().getId())
                .build();
    }
}
