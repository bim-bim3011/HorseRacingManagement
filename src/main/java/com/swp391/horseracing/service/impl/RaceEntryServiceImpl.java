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
    public RaceEntryResponse registerHorse(Integer raceId, RaceEntryRequest request) {

        HorseOwner owner = getCurrentOwner();


        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_NOT_FOUND));

        if (race.getStatus() != Race.RaceStatus.checking) {
            throw new AppException(ErrorCode.RACE_NOT_AVAILABLE);
        }
        if (race.getRoundOrder() == null || race.getRoundOrder() != 1) {
            throw new AppException(ErrorCode.CAN_ONLY_REGISTER_FIRST_ROUND);
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

        if (raceEntryRepository.existsByRaceIdAndHorseId(raceId, horse.getId())) {
            throw new AppException(ErrorCode.HORSE_ALREADY_REGISTERED);
        }

        if (tournament.getMaxMainEntries() != null) {
            int count = raceEntryRepository.countByRaceIdAndStatus(
                    raceId, RaceEntry.EntryStatus.approved);
            if (count >= race.getMaxEntries()) {
                throw new AppException(ErrorCode.RACE_FULL);
            }
        }

        RaceEntry entry = RaceEntry.builder()
                .race(race)
                .horse(horse)
                .build();

        raceEntryRepository.save(entry);
        return mapToResponse(entry);
    }

    @Override
    public List<RaceEntryResponse> getEntriesByRace(Integer raceId) {

        raceRepository.findById(raceId)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_NOT_FOUND));
        return raceEntryRepository.findByRaceId(raceId)
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
    public List<RaceEntryResponse> getApprovedEntries(Integer raceId) {
        raceRepository.findById(raceId)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_NOT_FOUND));
        return raceEntryRepository.findByRaceIdAndStatus(raceId, RaceEntry.EntryStatus.approved)
                .stream()
                .map(this::mapToResponse)
                .toList();
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
                .horseId(entry.getHorse().getId())
                .horseName(entry.getHorse().getName())
                .jockeyName(entry.getJockey() != null ? entry.getJockey().getFullName() : null)
                .laneNumber(entry.getLaneNumber())
                .status(entry.getStatus().name())
                .build();
    }
}
