package com.swp391.horseracing.service.impl;


import com.swp391.horseracing.dto.request.PlaceBetRequest;
import com.swp391.horseracing.dto.response.BetResponse;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.betting.Bet;
import com.swp391.horseracing.entity.betting.BetOdds;
import com.swp391.horseracing.entity.betting.WalletTransaction;
import com.swp391.horseracing.entity.tournament.Race;
import com.swp391.horseracing.entity.tournament.RaceEntry;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.BetOddsRepository;
import com.swp391.horseracing.repository.BetRepository;
import com.swp391.horseracing.repository.RaceEntryRepository;
import com.swp391.horseracing.repository.UserRepository;
import com.swp391.horseracing.service.BetService;
import com.swp391.horseracing.service.WalletService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BetServiceImpl implements BetService {

    BetRepository betRepository;
    BetOddsRepository betOddsRepository;
    RaceEntryRepository raceEntryRepository;
   // RaceResultRepository raceResultRepository;
    UserRepository userRepository;
    WalletService walletService;
    @Override
    @Transactional
    public BetResponse placeBet(PlaceBetRequest request) {
        User user = getCurrentUser();

        RaceEntry entry = raceEntryRepository.findById(request.getEntryId())
                .orElseThrow(() -> new AppException(ErrorCode.RACE_ENTRY_NOT_FOUND));

        Race race = entry.getRace();
        if (race.getStatus() != Race.RaceStatus.checking) {
            throw new AppException(ErrorCode.RACE_NOT_AVAILABLE);
        }

        BetOdds.BetType betType;
        try {
            betType = BetOdds.BetType.valueOf(request.getBetType().toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_BET_TYPE);
        }

        BetOdds betOdds = betOddsRepository.findByEntryIdAndBetType(entry.getId(), betType)
                .orElseThrow(() -> new AppException(ErrorCode.BET_ODDS_NOT_FOUND));

        BigDecimal amount = request.getAmount();
        BigDecimal oddsSnapshot = betOdds.getOdds();
        BigDecimal potentialPayout = amount.multiply(oddsSnapshot);


        Bet bet = Bet.builder()
                .user(user)
                .entry(entry)
                .betType(betType)
                .amount(amount)
                .oddsSnapshot(oddsSnapshot)
                .potentialPayout(potentialPayout)
                .build();

        betRepository.save(bet);
        walletService.deduct(user.getId(), amount, WalletTransaction.TransactionType.bet_place,
                "bet", bet.getId(), "Place a bet " + entry.getHorse().getName() + " - " + betType.name());
        return mapToResponse(bet);
    }

    @Override
    public List<BetResponse> getMyBets() {
        User user = getCurrentUser();
        return betRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void settleBetsForRace(Integer raceId) {

    }
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private BetResponse mapToResponse(Bet bet) {
        return BetResponse.builder()
                .id(bet.getId())
                .horseName(bet.getEntry().getHorse().getName())
                .raceName(bet.getEntry().getRace().getName())
                .betType(bet.getBetType().name())
                .amount(bet.getAmount())
                .oddsSnapshot(bet.getOddsSnapshot())
                .potentialPayout(bet.getPotentialPayout())
                .actualPayout(bet.getActualPayout())
                .status(bet.getStatus().name())
                .placedAt(bet.getPlacedAt())
                .settledAt(bet.getSettledAt())
                .build();
    }
}
