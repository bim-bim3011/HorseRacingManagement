package com.swp391.horseracing.module.race.service.impl;


//import com.swp391.horseracing.module.race.dto.response.RaceEntryResponse;
import com.swp391.horseracing.module.common.dto.request.RejectEntryRequest;
import com.swp391.horseracing.module.horse.repository.HorseOwnerRepository;
import com.swp391.horseracing.module.horse.repository.HorseRepository;
import com.swp391.horseracing.module.race.dto.response.RaceEntryResponse;
import com.swp391.horseracing.module.race.repository.RaceEntryRepository;
import com.swp391.horseracing.module.tournament.repository.TournamentRegistrationRepository;
import com.swp391.horseracing.module.user.entity.User;
import com.swp391.horseracing.module.horse.entity.horse.Horse;
import com.swp391.horseracing.module.horse.entity.profile.HorseOwner;
import com.swp391.horseracing.module.jockey.entity.profile.Jockey;
import com.swp391.horseracing.module.race.entity.tournament.Race;

import com.swp391.horseracing.module.race.entity.tournament.RaceEntry;
import com.swp391.horseracing.module.tournament.entity.tournament.TournamentRegistration;
import com.swp391.horseracing.core.exception.AppException;
import com.swp391.horseracing.core.exception.ErrorCode;
import com.swp391.horseracing.module.user.repository.UserRepository;
import com.swp391.horseracing.module.betting.service.BetOddsService;
import com.swp391.horseracing.module.notification.service.NotificationService;
import com.swp391.horseracing.module.notification.entity.Notification;
import com.swp391.horseracing.module.race.service.RaceEntryService;
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
    RaceEntryRepository raceRepository;
    NotificationService notificationService;
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

    @Override
    public List<RaceEntryResponse> getMyJockeyEntries() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return raceEntryRepository.findByJockeyId(user.getId())
                .stream()
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
        betOddsService.initOddsForEntry(entry);
    }

    @Override
    public RaceEntryResponse manuallyAssignHorse(Integer raceId, Integer horseId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_NOT_FOUND)).getRace();

        if (race.getStatus() != Race.RaceStatus.scheduled) {
            throw new AppException(ErrorCode.RACE_NOT_AVAILABLE);
        }

        Integer currentEntriesCount = raceEntryRepository.findByRaceId(raceId).size();
        if (race.getMaxEntries() != null && currentEntriesCount >= race.getMaxEntries()) {
            throw new AppException(ErrorCode.RACE_FULL);
        }

        if (raceEntryRepository.existsByRaceIdAndHorseId(raceId, horseId)) {
            throw new AppException(ErrorCode.HORSE_ALREADY_REGISTERED);
        }

        TournamentRegistration registration = tournamentRegistrationRepository
                .findByTournamentIdAndHorseIdAndStatus(race.getTournament().getId(), horseId, TournamentRegistration.RegistrationStatus.approved)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_FOUND));

        List<Integer> usedLanes = raceEntryRepository.findByRaceId(raceId)
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

        RaceEntry saved = raceEntryRepository.save(entry);
        betOddsService.initOddsForEntry(saved);
        
        return mapToResponse(saved);
    }


    @Override
    public RaceEntryResponse rejectEntry(Integer entryId, RejectEntryRequest request) {
        RaceEntry entry = raceEntryRepository.findById(entryId)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_ENTRY_NOT_FOUND));

        entry.setStatus(RaceEntry.EntryStatus.rejected);
        entry.setRejectionReason(request.getRejectionReason());
        
        RaceEntry saved = raceEntryRepository.save(entry);
        
        // Gửi thông báo cho chủ ngựa
        if (entry.getHorse() != null && entry.getHorse().getOwner() != null) {
            String title = "Ngựa bị loại khỏi cuộc đua";
            String content = String.format("Ngựa %s của bạn đã bị Trọng tài loại khỏi cuộc đua %s. Lý do: %s", 
                entry.getHorse().getName(), entry.getRace().getName(), request.getRejectionReason());
            notificationService.sendNotification(entry.getHorse().getOwner(), Notification.NotificationType.HORSE_REJECTED, title, content);
        }

        return mapToResponse(saved);
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
                .rejectionReason(entry.getRejectionReason())
                .build();
    }
}
