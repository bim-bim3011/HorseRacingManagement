package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.request.TournamentRegistrationRequest;
import com.swp391.horseracing.dto.response.TournamentRegistrationResponse;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.betting.Wallet;
import com.swp391.horseracing.entity.betting.WalletTransaction;
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
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
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
    WalletRepository walletRepository;
    WalletTransactionRepository walletTransactionRepository;

    @Override
    @Transactional
    public List<TournamentRegistrationResponse> register(Integer tournamentId, TournamentRegistrationRequest request) {
        HorseOwner owner = getCurrentOwner();

        // 1. Validate tournament exists
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new AppException(ErrorCode.TOURNAMENT_NOT_FOUND));

        // 2. Check registration period is open
        LocalDate today = LocalDate.now();
        if (tournament.getRegistrationStart() != null && tournament.getRegistrationEnd() != null) {
            if (today.isBefore(tournament.getRegistrationStart()) || today.isAfter(tournament.getRegistrationEnd())) {
                throw new AppException(ErrorCode.REGISTRATION_NOT_OPEN);
            }
        }

        // 3. Validate each horse
        List<Horse> validHorses = new ArrayList<>();
        for (Integer horseId : request.getHorseIds()) {
            Horse horse = horseRepository.findById(horseId)
                    .orElseThrow(() -> new AppException(ErrorCode.HORSE_NOT_FOUND));

            // Check ownership
            if (!horse.getOwner().getId().equals(owner.getId())) {
                throw new AppException(ErrorCode.ACCESS_DENIED);
            }

            // Check horse is active
            if (horse.getStatus() != Horse.HorseStatus.active) {
                throw new AppException(ErrorCode.HORSE_NOT_ACTIVE);
            }

            // Check horse age
            int horseAge = Period.between(horse.getDateOfBirth(), LocalDate.now()).getYears();
            if (horseAge < tournament.getMinHorseAge() || horseAge > tournament.getMaxHorseAge()) {
                throw new AppException(ErrorCode.HORSE_AGE_NOT_QUALIFIED);
            }

            // Check horse breed
            if (!horse.getBreed().equalsIgnoreCase(tournament.getAllowedBreed())) {
                throw new AppException(ErrorCode.HORSE_BREED_NOT_QUALIFIED);
            }

            // Check not already registered
            if (tournamentRegistrationRepository.existsByTournamentIdAndHorseId(tournamentId, horse.getId())) {
                throw new AppException(ErrorCode.HORSE_ALREADY_REGISTERED);
            }

            validHorses.add(horse);
        }

        // 4. Calculate total fee and deduct from wallet
        BigDecimal registrationFee = tournament.getRegistrationFee();
        if (registrationFee != null && registrationFee.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal totalFee = registrationFee.multiply(BigDecimal.valueOf(validHorses.size()));

            Wallet wallet = walletRepository.findByUserId(owner.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_FOUND));

            if (wallet.getBalance().compareTo(totalFee) < 0) {
                throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);
            }

            // Deduct balance
            wallet.setBalance(wallet.getBalance().subtract(totalFee));
            walletRepository.save(wallet);

            // Create wallet transaction record
            WalletTransaction transaction = WalletTransaction.builder()
                    .wallet(wallet)
                    .type(WalletTransaction.TransactionType.registration_fee)
                    .amount(totalFee.negate()) // negative = money going out
                    .balanceAfter(wallet.getBalance())
                    .refType("tournament_registration")
                    .refId(tournament.getId())
                    .note("Registration fee for " + validHorses.size() + " horse(s) in tournament: " + tournament.getName())
                    .build();
            walletTransactionRepository.save(transaction);
        }

        // 5. Determine current main entry count and create registrations
        int currentMainCount = tournamentRegistrationRepository
                .countByTournamentIdAndStatusAndIsReserve(tournamentId, TournamentRegistration.RegistrationStatus.pending, false)
                + tournamentRegistrationRepository
                .countByTournamentIdAndStatusAndIsReserve(tournamentId, TournamentRegistration.RegistrationStatus.approved, false);

        Integer maxParticipants = tournament.getMaxParticipants();

        List<TournamentRegistration> registrations = new ArrayList<>();
        for (Horse horse : validHorses) {
            boolean isReserve = false;
            Integer reserveOrder = null;

            if (maxParticipants != null && currentMainCount >= maxParticipants) {
                // This horse goes to reserve list
                isReserve = true;
                // Count existing reserves to determine order
                int currentReserveCount = tournamentRegistrationRepository
                        .countByTournamentIdAndStatusAndIsReserve(tournamentId, TournamentRegistration.RegistrationStatus.pending, true)
                        + tournamentRegistrationRepository
                        .countByTournamentIdAndStatusAndIsReserve(tournamentId, TournamentRegistration.RegistrationStatus.approved, true);
                reserveOrder = currentReserveCount + 1;
            } else {
                currentMainCount++;
            }

            TournamentRegistration registration = TournamentRegistration.builder()
                    .tournament(tournament)
                    .owner(owner)
                    .horse(horse)
                    .isReserve(isReserve)
                    .reserveOrder(reserveOrder)
                    .paymentStatus(TournamentRegistration.PaymentStatus.paid)
                    .build();

            registrations.add(tournamentRegistrationRepository.save(registration));
        }

        return registrations.stream()
                .map(this::mapToResponse)
                .toList();
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
    public List<TournamentRegistrationResponse> getMyRegistrations(Integer tournamentId) {
        HorseOwner owner = getCurrentOwner();

        return tournamentRegistrationRepository.findByTournamentIdAndOwnerId(tournamentId, owner.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void approveRegistration(Integer tournamentId, Integer id) {
        TournamentRegistration registration = tournamentRegistrationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_FOUND));

        if (!registration.getTournament().getId().equals(tournamentId)) {
            throw new AppException(ErrorCode.REGISTRATION_NOT_FOUND);
        }

        if (registration.getStatus() == TournamentRegistration.RegistrationStatus.approved) {
            return;
        }

        registration.setStatus(TournamentRegistration.RegistrationStatus.approved);
        tournamentRegistrationRepository.save(registration);
    }

    @Override
    @Transactional
    public void rejectRegistration(Integer tournamentId, Integer id) {
        TournamentRegistration registration = tournamentRegistrationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_FOUND));

        if (!registration.getTournament().getId().equals(tournamentId)) {
            throw new AppException(ErrorCode.REGISTRATION_NOT_FOUND);
        }

        if (registration.getStatus() == TournamentRegistration.RegistrationStatus.rejected) {
            return;
        }

        registration.setStatus(TournamentRegistration.RegistrationStatus.rejected);

        // Refund the registration fee to the owner's wallet
        Tournament tournament = registration.getTournament();
        BigDecimal registrationFee = tournament.getRegistrationFee();

        if (registrationFee != null && registrationFee.compareTo(BigDecimal.ZERO) > 0
                && registration.getPaymentStatus() == TournamentRegistration.PaymentStatus.paid) {

            Wallet wallet = walletRepository.findByUserId(registration.getOwner().getId())
                    .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_FOUND));

            wallet.setBalance(wallet.getBalance().add(registrationFee));
            walletRepository.save(wallet);

            WalletTransaction refundTx = WalletTransaction.builder()
                    .wallet(wallet)
                    .type(WalletTransaction.TransactionType.registration_refund)
                    .amount(registrationFee) // positive = money coming back
                    .balanceAfter(wallet.getBalance())
                    .refType("tournament_registration")
                    .refId(registration.getId())
                    .note("Refund registration fee for horse: " + registration.getHorse().getName()
                            + " in tournament: " + tournament.getName())
                    .build();
            walletTransactionRepository.save(refundTx);

            registration.setPaymentStatus(TournamentRegistration.PaymentStatus.refunded);
        }

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
                .paymentStatus(registration.getPaymentStatus().name())
                .isReserve(registration.getIsReserve())
                .reserveOrder(registration.getReserveOrder())
                .build();
    }
}
