package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.request.RaceEntryRequest;
import com.swp391.horseracing.dto.response.RaceEntryResponse;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.horse.Horse;
import com.swp391.horseracing.entity.profile.HorseOwner;
import com.swp391.horseracing.entity.tournament.Race;

import com.swp391.horseracing.entity.tournament.RaceEntry;
import com.swp391.horseracing.entity.tournament.Tournament;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.*;
import com.swp391.horseracing.service.RaceEntryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Random;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RaceEntryServiceImpl implements RaceEntryService {
    RaceEntryRepository raceEntryRepository;
    RaceRepository raceRepository;
    HorseRepository horseRepository;
    HorseOwnerRepository horseOwnerRepository;
    UserRepository userRepository;
    @Override
    public RaceEntryResponse registerHorse(Integer tournamentId, RaceEntryRequest request) {

        HorseOwner owner = getCurrentOwner();


        Race race = raceRepository.findByTournamentIdAndRoundOrder(tournamentId, 1)
                .orElseThrow(() -> new AppException(ErrorCode.FIRST_ROUND_NOT_FOUND));

        if (race.getStatus() != Race.RaceStatus.checking) {
            throw new AppException(ErrorCode.RACE_NOT_AVAILABLE);
        }


        Horse horse = horseRepository.findById(request.getHorseId())
                .orElseThrow(() -> new AppException(ErrorCode.HORSE_NOT_FOUND));

        if (!horse.getOwner().getId().equals(owner.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        if (horse.getStatus() != Horse.HorseStatus.active) {
            throw new AppException(ErrorCode.HORSE_NOT_ACTIVE);
        }
        Tournament tournament = race.getTournament();
        if (tournament.getMinHorseAge() != null && horse.getAge() < tournament.getMinHorseAge()) {
            throw new AppException(ErrorCode.HORSE_AGE_NOT_QUALIFIED);
        }
        if (tournament.getMaxHorseAge() != null && horse.getAge() > tournament.getMaxHorseAge()) {
            throw new AppException(ErrorCode.HORSE_AGE_NOT_QUALIFIED);
        }
        if (tournament.getAllowedBreed() != null
                && !horse.getBreed().equalsIgnoreCase(tournament.getAllowedBreed())) {
            throw new AppException(ErrorCode.HORSE_BREED_NOT_QUALIFIED);
        }

        if (raceEntryRepository.existsByRaceIdAndHorseId(race.getId(), horse.getId())) {
            throw new AppException(ErrorCode.HORSE_ALREADY_REGISTERED);
        }

        boolean isReserve = false;
        Integer reserveOrder = null;

        if (tournament.getMaxMainEntries() != null ) {
            int approvedCount = raceEntryRepository.countByRaceIdAndStatus(
                    race.getId(), RaceEntry.EntryStatus.approved);
            if (approvedCount >= tournament.getMaxMainEntries()) {
                int reserveCount = raceEntryRepository.countByRaceIdAndIsReserve(race.getId(), true);
                if (tournament.getMaxReserveEntries() != null && reserveCount >= tournament.getMaxReserveEntries()) {
                    throw new AppException(ErrorCode.RACE_FULL);
                }
                isReserve = true;
                reserveOrder = reserveCount + 1;
            }
        }

        RaceEntry entry = RaceEntry.builder()
                .race(race)
                .horse(horse)
                .isReserve(isReserve)
                .reserveOrder(reserveOrder)
                .build();

        raceEntryRepository.save(entry);
        return mapToResponse(entry);
    }

    @Override
    public List<RaceEntryResponse> getEntriesByTournament(Integer tournamentId) {

        Race race = raceRepository.findByTournamentIdAndRoundOrder(tournamentId, 1)
                .orElseThrow(() -> new AppException(ErrorCode.FIRST_ROUND_NOT_FOUND));
        return raceEntryRepository.findByRaceId(race.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
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

    @Override
    public void approveEntry(Integer id) {
        RaceEntry entry = raceEntryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_ENTRY_NOT_FOUND));
        assignRandomLane(entry);
        entry.setStatus(RaceEntry.EntryStatus.approved);
        raceEntryRepository.save(entry);
    }

    @Override
    public void rejectEntry(Integer id) {
        RaceEntry entry = raceEntryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_ENTRY_NOT_FOUND));
        entry.setStatus(RaceEntry.EntryStatus.rejected);
        raceEntryRepository.save(entry);
    }

    @Override
    public List<RaceEntryResponse> getApprovedEntriesByTournament(Integer tournamentId) {
        Race race = raceRepository.findByTournamentIdAndRoundOrder(tournamentId, 1)
                .orElseThrow(() -> new AppException(ErrorCode.FIRST_ROUND_NOT_FOUND));
        return raceEntryRepository.findByRaceIdAndStatus(race.getId(), RaceEntry.EntryStatus.approved)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    @Override
    public void replaceWithReserve(Integer mainEntryId) {
        RaceEntry mainEntry = raceEntryRepository.findById(mainEntryId)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_ENTRY_NOT_FOUND));

        if (Boolean.TRUE.equals(mainEntry.getIsReserve())) {
            throw new AppException(ErrorCode.ENTRY_IS_NOT_MAIN);
        }

        RaceEntry reserveEntry = raceEntryRepository
                .findFirstByRaceIdAndIsReserveOrderByReserveOrderAsc(mainEntry.getRace().getId(), true)
                .orElseThrow(() -> new AppException(ErrorCode.NO_RESERVE_AVAILABLE));

        Integer laneNumber = mainEntry.getLaneNumber();

        mainEntry.setStatus(RaceEntry.EntryStatus.rejected);
        mainEntry.setLaneNumber(null);

        reserveEntry.setIsReserve(false);
        reserveEntry.setReserveOrder(null);
        reserveEntry.setLaneNumber(laneNumber);

        raceEntryRepository.save(mainEntry);
        raceEntryRepository.save(reserveEntry);
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
                .isReserve(entry.getIsReserve())
                .reserveOrder(entry.getReserveOrder())
                .build();
    }
    private void assignRandomLane(RaceEntry entry) {
        Race race = entry.getRace();
        Tournament tournament = race.getTournament();

        Integer maxLane = race.getMaxEntries() != null ? race.getMaxEntries() : tournament.getMaxMainEntries();

        if (maxLane == null) {
            throw new AppException(ErrorCode.RACE_MISSING_STANDARDS);
        }

        List<Integer> usedLanes = raceEntryRepository
                .findByRaceIdAndStatus(race.getId(), RaceEntry.EntryStatus.approved)
                .stream()
                .map(RaceEntry::getLaneNumber)
                .filter(Objects::nonNull)
                .toList();

        List<Integer> availableLanes = IntStream.rangeClosed(1, maxLane)
                .boxed()
                .filter(lane -> !usedLanes.contains(lane))
                .toList();

        if (availableLanes.isEmpty()) {
            throw new AppException(ErrorCode.RACE_FULL);
        }

        int randomLane = availableLanes.get(new Random().nextInt(availableLanes.size()));
        entry.setLaneNumber(randomLane);
    }
}
