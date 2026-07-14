package com.swp391.horseracing.module.betting.service.impl;


import com.swp391.horseracing.module.betting.dto.request.PlaceBetRequest;
import com.swp391.horseracing.module.betting.dto.response.BetResponse;
import com.swp391.horseracing.module.user.entity.User;
import com.swp391.horseracing.module.betting.entity.betting.Bet;
import com.swp391.horseracing.module.betting.entity.betting.BetOdds;
import com.swp391.horseracing.module.payment.entity.betting.WalletTransaction;
import com.swp391.horseracing.module.race.entity.tournament.Race;
import com.swp391.horseracing.module.race.entity.tournament.RaceEntry;
import com.swp391.horseracing.core.exception.AppException;
import com.swp391.horseracing.core.exception.ErrorCode;
import com.swp391.horseracing.module.betting.repository.BetOddsRepository;
import com.swp391.horseracing.module.betting.repository.BetRepository;
import com.swp391.horseracing.module.race.repository.RaceEntryRepository;
import com.swp391.horseracing.module.user.repository.UserRepository;
import com.swp391.horseracing.module.betting.service.BetService;
import com.swp391.horseracing.module.common.service.WalletService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.swp391.horseracing.module.race.entity.result.RaceResult;

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
        if (race.getBettingStatus() != Race.BettingStatus.open) {
            throw new AppException(ErrorCode.BETTING_NOT_OPEN);
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
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.INVALID_BET_AMOUNT);
        }
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
    @Transactional
    public void settleBetsForRace(Integer raceId) {
        List<Bet> pendingBets = betRepository.findByEntry_Race_IdAndStatus(raceId, Bet.BetStatus.pending);

        for (Bet bet : pendingBets) {
            RaceResult result = bet.getEntry().getResult();
            if (result == null) {
                throw new AppException(ErrorCode.RACE_RESULT_NOT_FOUND);
            }

            int position = result.getPosition();
            boolean isWon = false;

            switch (bet.getBetType()) {
                case win:
                    isWon = (position == 1);
                    break;
                case place:
                    isWon = (position <= 2);
                    break;
                case show:
                    isWon = (position <= 3);
                    break;
            }

            if (isWon) {
                bet.setStatus(Bet.BetStatus.won);
                bet.setActualPayout(bet.getPotentialPayout());
                 walletService.credit(bet.getUser().getId(), bet.getActualPayout(), WalletTransaction.TransactionType.bet_win, "bet", bet.getId(), "Won bet on " + bet.getEntry().getHorse().getName());
            } else {
                bet.setStatus(Bet.BetStatus.lost);
                bet.setActualPayout(BigDecimal.ZERO);
            }
            
            bet.setSettledAt(LocalDateTime.now());
            betRepository.save(bet);
        }
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
