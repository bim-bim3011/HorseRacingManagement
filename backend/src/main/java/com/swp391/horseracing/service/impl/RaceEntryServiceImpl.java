package com.swp391.horseracing.service.impl;


import com.swp391.horseracing.dto.response.RaceEntryResponse;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.horse.Horse;
import com.swp391.horseracing.entity.profile.HorseOwner;
import com.swp391.horseracing.entity.profile.Jockey;
import com.swp391.horseracing.entity.tournament.Race;

import com.swp391.horseracing.entity.tournament.RaceEntry;
import com.swp391.horseracing.entity.tournament.TournamentRegistration;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.*;
import com.swp391.horseracing.service.BetOddsService;
import com.swp391.horseracing.service.RaceEntryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RaceEntryServiceImpl implements RaceEntryService {
    RaceEntryRepository raceEntryRepository;
    HorseRepository horseRepository;
    HorseOwnerRepository horseOwnerRepository;
    UserRepository userRepository;
    TournamentRegistrationRepository tournamentRegistrationRepository;
    BetOddsService betOddsService;
    @Override
    public void createEntryForRegistration(Race race, TournamentRegistration registration) {
        if (raceEntryRepository.existsByRaceIdAndHorseId(race.getId(), registration.getHorse().getId())) {
            return;
        }

        List<Integer> usedLanes = raceEntryRepository.findByRaceId(race.getId())
                .stream()
                .map(RaceEntry::getLaneNumber)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(ArrayList::new));

        Integer lane = assignRandomLane(race.getMaxEntries(), usedLanes);

        RaceEntry entry = RaceEntry.builder()
                .race(race)
                .horse(registration.getHorse())
                .laneNumber(lane)
                .status(RaceEntry.EntryStatus.approved)
                .build();

        raceEntryRepository.save(entry);
    }

    @Override
    public List<RaceEntryResponse> getMyHorseEntries() {
        HorseOwner owner = getCurrentOwner();
        List<Horse> horses = horseRepository.findByOwnerId(owner.getId());

        return horses.stream()
                .flatMap(horse -> raceEntryRepository.findByHorseId(horse.getId()).stream())
                .map(this::mapToResponse)
                .toList();
    }
    // 3. Thay ngựa chính bị sự cố bằng ngựa dự bị tiếp theo (chỉ áp dụng round 1, trước khi đua)
    @Override
    public void replaceWithReserve(Integer mainEntryId) {
        RaceEntry mainEntry = raceEntryRepository.findById(mainEntryId)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_ENTRY_NOT_FOUND));

        Integer tournamentId = mainEntry.getRace().getTournament().getId();

        // Tìm ngựa dự bị có reserveOrder nhỏ nhất, đang approved, isReserve=true
        TournamentRegistration reserveReg = tournamentRegistrationRepository.findFirstByTournamentIdAndStatusAndIsReserveOrderByReserveOrderAsc(
                        tournamentId, TournamentRegistration.RegistrationStatus.approved, true)
                .orElseThrow(() -> new AppException(ErrorCode.NO_RESERVE_AVAILABLE));

        Integer laneNumber = mainEntry.getLaneNumber();
        Jockey jockey = mainEntry.getJockey();

        // Loại ngựa chính bị sự cố
        mainEntry.setStatus(RaceEntry.EntryStatus.rejected);
        mainEntry.setLaneNumber(null);
        raceEntryRepository.save(mainEntry);

        // Ngựa dự bị chính thức trở thành ngựa chính, nhận lại lane cũ
        reserveReg.setIsReserve(false);
        reserveReg.setReserveOrder(null);
        tournamentRegistrationRepository.save(reserveReg);

        RaceEntry newEntry = RaceEntry.builder()
                .race(mainEntry.getRace())
                .horse(reserveReg.getHorse())
                .laneNumber(laneNumber)
                .jockey(jockey)
                .build();
        raceEntryRepository.save(newEntry);
    }

    @Override
    public List<RaceEntryResponse> getEntriesByRace(Integer raceId) {
        return raceEntryRepository.findByRaceId(raceId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void assignJockey(Integer raceId, Integer horseId, Jockey jockey) {
        RaceEntry entry = raceEntryRepository.findByRaceIdAndHorseId(raceId, horseId)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_ENTRY_NOT_FOUND));

        entry.setJockey(jockey);
        raceEntryRepository.save(entry);
        betOddsService.generateOddsForRace(entry.getRace());
    }


    private Integer assignRandomLane(Integer maxLane, List<Integer> usedLanes) {
        if (maxLane == null) {
            throw new AppException(ErrorCode.RACE_MISSING_STANDARDS);
        }

        List<Integer> availableLanes = IntStream.rangeClosed(1, maxLane)
                .boxed()
                .filter(lane -> !usedLanes.contains(lane))
                .toList();

        if (availableLanes.isEmpty()) {
            throw new AppException(ErrorCode.RACE_FULL);
        }

        return availableLanes.get(new Random().nextInt(availableLanes.size()));
    }
    private HorseOwner getCurrentOwner() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return horseOwnerRepository.findById(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_HORSE_OWNER));
    }

    private RaceEntryResponse mapToResponse(RaceEntry entry) {
        return RaceEntryResponse.builder()
                .id(entry.getId())
                .raceId(entry.getRace().getId())
                .raceName(entry.getRace().getName())
                .tournamentName(entry.getRace().getTournament().getName())
                .horseId(entry.getHorse().getId())
                .horseName(entry.getHorse().getName())
                .jockeyName(entry.getJockey() != null ? entry.getJockey().getFullName() : null)
                .laneNumber(entry.getLaneNumber())
                .status(entry.getStatus().name())
                .build();
    }
}
