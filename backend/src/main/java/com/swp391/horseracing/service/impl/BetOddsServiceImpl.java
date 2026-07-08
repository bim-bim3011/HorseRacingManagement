package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.request.BetOddsRequest;
import com.swp391.horseracing.dto.response.BetOddsResponse;
import com.swp391.horseracing.entity.betting.BetOdds;
import com.swp391.horseracing.entity.tournament.Race;
import com.swp391.horseracing.entity.tournament.RaceEntry;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.BetOddsRepository;
import com.swp391.horseracing.repository.RaceEntryRepository;
import com.swp391.horseracing.service.BetOddsService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BetOddsServiceImpl implements BetOddsService {
    BetOddsRepository betOddsRepository;
    RaceEntryRepository raceEntryRepository;


    @Override
    public void initOddsForEntry(RaceEntry entry) {
        for (BetOdds.BetType type : BetOdds.BetType.values()) {
            boolean exists = betOddsRepository.findByEntryIdAndBetType(entry.getId(), type).isPresent();
            if (!exists) {
                BetOdds betOdds = BetOdds.builder()
                        .entry(entry)
                        .betType(type)
                        .odds(BigDecimal.ZERO)
                        .build();
                betOddsRepository.save(betOdds);
            }
        }
    }

    @Override
    public void updateOdds(Integer entryId, BetOddsRequest request) {
        RaceEntry entry = raceEntryRepository.findById(entryId)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_ENTRY_NOT_FOUND));

        setOdds(entry, BetOdds.BetType.win, request.getWinOdds());
        setOdds(entry, BetOdds.BetType.place, request.getPlaceOdds());
        setOdds(entry, BetOdds.BetType.show, request.getShowOdds());
    }

    private void setOdds(RaceEntry entry, BetOdds.BetType type, BigDecimal odds) {
        BetOdds betOdds = betOddsRepository.findByEntryIdAndBetType(entry.getId(), type)
                .orElse(BetOdds.builder()
                        .entry(entry)
                        .betType(type)
                        .build());
        betOdds.setOdds(odds);
        betOddsRepository.save(betOdds);
    }


    @Override
    public List<BetOddsResponse> getOddsByRace(Integer raceId) {
        return betOddsRepository.findByEntry_Race_Id(raceId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    private BetOddsResponse mapToResponse(BetOdds betOdds) {
        return BetOddsResponse.builder()
                .entryId(betOdds.getEntry().getId())
                .horseName(betOdds.getEntry().getHorse().getName())
                .betType(betOdds.getBetType().name())
                .odds(betOdds.getOdds())
                .build();
    }
}
