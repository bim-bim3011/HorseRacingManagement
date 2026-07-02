package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.request.TournamentRegistrationRequest;
import com.swp391.horseracing.dto.response.TournamentRegistrationResponse;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.horse.Horse;
import com.swp391.horseracing.entity.profile.HorseOwner;
import com.swp391.horseracing.entity.tournament.Race;
import com.swp391.horseracing.entity.tournament.Tournament;
import com.swp391.horseracing.entity.tournament.TournamentRegistration;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.*;
import com.swp391.horseracing.service.RaceEntryService;
import com.swp391.horseracing.service.TournamentRegistrationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TournamentRegistrationServiceImpl implements TournamentRegistrationService {


    TournamentRegistrationRepository tournamentRegistrationRepository;
    TournamentRepository tournamentRepository;
    HorseRepository horseRepository;
    HorseOwnerRepository horseOwnerRepository;
    UserRepository userRepository;
    RaceRepository raceRepository;
    RaceEntryRepository raceEntryRepository;
    RaceEntryService raceEntryService;
    @Override
    public TournamentRegistrationResponse register(Integer tournamentId, TournamentRegistrationRequest request) {
        HorseOwner owner = getCurrentOwner();

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.TOURNAMENT_NOT_FOUND));
        raceRepository.findByTournamentIdAndRoundOrder(tournamentId, 1)
                .orElseThrow(() -> new AppException(ErrorCode.FIRST_ROUND_NOT_FOUND));

        Horse horse = horseRepository.findById(request.getHorseId())
                .orElseThrow(() -> new AppException(ErrorCode.HORSE_NOT_FOUND));

        if (!horse.getOwner().getId().equals(owner.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        if (horse.getStatus() != Horse.HorseStatus.active) {
            throw new AppException(ErrorCode.HORSE_NOT_ACTIVE);
        }

        if (horse.getAge() < tournament.getMinHorseAge() || horse.getAge() > tournament.getMaxHorseAge()) {
            throw new AppException(ErrorCode.HORSE_AGE_NOT_QUALIFIED);
        }

        if (!horse.getBreed().equalsIgnoreCase(tournament.getAllowedBreed())) {
            throw new AppException(ErrorCode.HORSE_BREED_NOT_QUALIFIED);
        }

        if (tournamentRegistrationRepository.existsByTournamentIdAndHorseId(tournamentId, horse.getId())) {
            throw new AppException(ErrorCode.HORSE_ALREADY_REGISTERED);
        }
        boolean isReserve = false;
        Integer reserveOrder = null;

        TournamentRegistration registration = TournamentRegistration.builder()
                .tournament(tournament)
                .owner(owner)
                .horse(horse)
                .isReserve(isReserve)
                .reserveOrder(reserveOrder)
                .build();

        tournamentRegistrationRepository.save(registration);
        return mapToResponse(registration);
    }

    @Override
    public List<TournamentRegistrationResponse> getByTournament(Integer tournamentId) {
        tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.TOURNAMENT_NOT_FOUND));

        return tournamentRegistrationRepository.findByTournamentId(tournamentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<TournamentRegistrationResponse> getMyRegistrations() {
        HorseOwner owner = getCurrentOwner();
        List<Horse> horses = horseRepository.findByOwnerId(owner.getId());

        return horses.stream()
                .flatMap(horse -> tournamentRegistrationRepository.findByHorseId(horse.getId()).stream())
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void approveRegistration(Integer id) {
        TournamentRegistration registration = tournamentRegistrationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_FOUND));

        registration.setStatus(TournamentRegistration.RegistrationStatus.approved);
        tournamentRegistrationRepository.save(registration);
        if (!Boolean.TRUE.equals(registration.getIsReserve())) {
            Race firstRound = raceRepository.findByTournamentIdAndRoundOrder(
                            registration.getTournament().getId(), 1)
                    .orElseThrow(() -> new AppException(ErrorCode.FIRST_ROUND_NOT_FOUND));

            raceEntryService.createEntryForRegistration(firstRound, registration);
        }
    }

    @Override
    public void rejectRegistration(Integer id) {
        TournamentRegistration registration = tournamentRegistrationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_FOUND));

        registration.setStatus(TournamentRegistration.RegistrationStatus.rejected);
        tournamentRegistrationRepository.save(registration);
    }

    private HorseOwner getCurrentOwner() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return horseOwnerRepository.findById(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_HORSE_OWNER));
    }

    private TournamentRegistrationResponse mapToResponse(TournamentRegistration registration) {
        return TournamentRegistrationResponse.builder()
                .id(registration.getId())
                .tournamentName(registration.getTournament().getName())
                .horseId(registration.getHorse().getId())
                .horseName(registration.getHorse().getName())
                .status(registration.getStatus().name())
                .isReserve(registration.getIsReserve())
                .reserveOrder(registration.getReserveOrder())
                .build();
    }
}
