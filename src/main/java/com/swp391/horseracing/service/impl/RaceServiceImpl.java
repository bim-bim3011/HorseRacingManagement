package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.request.RaceRequest;
import com.swp391.horseracing.dto.response.RaceResponse;
import com.swp391.horseracing.entity.tournament.Race;
import com.swp391.horseracing.entity.tournament.Tournament;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.RaceRepository;
import com.swp391.horseracing.repository.TournamentRepository;
import com.swp391.horseracing.service.RaceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RaceServiceImpl implements RaceService {
    RaceRepository raceRepository;
    TournamentRepository tournamentRepository;
    @Override
    public RaceResponse createRace(Integer tournamentId, RaceRequest request) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        Race race = Race.builder()
                .tournament(tournament)
                .name(request.getName())
                .raceDatetime(request.getRaceDatetime())
                .distance(request.getDistance())
                .weightLimit(request.getWeightLimit())
                .minHorseAge(request.getMinHorseAge())
                .maxHorseAge(request.getMaxHorseAge())
                .build();

        raceRepository.save(race);
        return mapToResponse(race);
    }

    @Override
    public RaceResponse getRace(Integer tournamentId, Integer id) {
        tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        Race race = raceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (!race.getTournament().getId().equals(tournamentId))
            throw new AppException(ErrorCode.NOT_FOUND);

        return mapToResponse(race);
    }

    @Override
    public RaceResponse updateRace(Integer tournamentId, Integer id, RaceRequest request) {
        tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        Race race = raceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (!race.getTournament().getId().equals(tournamentId))
            throw new AppException(ErrorCode.NOT_FOUND);

        race.setName(request.getName());
        race.setRaceDatetime(request.getRaceDatetime());
        race.setDistance(request.getDistance());
        race.setWeightLimit(request.getWeightLimit());
        race.setMinHorseAge(request.getMinHorseAge());
        race.setMaxHorseAge(request.getMaxHorseAge());


        return mapToResponse(raceRepository.save(race));
    }

    @Override
    public void deleteRace(Integer tournamentId, Integer id) {
        tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        Race race = raceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (!race.getTournament().getId().equals(tournamentId))
            throw new AppException(ErrorCode.NOT_FOUND);

        raceRepository.delete(race);
    }

    @Override
    public List<RaceResponse> getAllRaces(Integer tournamentId) {
        tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        return raceRepository.findByTournamentId(tournamentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void activateRace(Integer tournamentId, Integer raceId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (!race.getTournament().getId().equals(tournamentId))
            throw new AppException(ErrorCode.NOT_FOUND);

        // Kiểm tra Tournament
        if (tournament.getRegulations() == null)
            throw new AppException(ErrorCode.TOURNAMENT_MISSING_REGULATIONS);

        if (tournament.getPenaltyRules().isEmpty())
            throw new AppException(ErrorCode.TOURNAMENT_MISSING_PENALTY_RULES);

        // Kiểm tra Race
        if (race.getDistance() == null || race.getWeightLimit() == null
                || race.getMinHorseAge() == null || race.getMaxHorseAge() == null)
            throw new AppException(ErrorCode.RACE_MISSING_STANDARDS);

        // Đủ điều kiện → cập nhật cả 2
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
                .status(race.getStatus().name())
                .distance(race.getDistance())
                .weightLimit(race.getWeightLimit())
                .minHorseAge(race.getMinHorseAge())
                .maxHorseAge(race.getMaxHorseAge())
                .tournamentId(race.getTournament().getId())
                .build();
    }
}
