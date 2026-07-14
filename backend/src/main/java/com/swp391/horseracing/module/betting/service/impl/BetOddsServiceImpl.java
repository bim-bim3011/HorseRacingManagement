package com.swp391.horseracing.module.betting.service.impl;

import com.swp391.horseracing.module.betting.dto.request.BetOddsRequest;
import com.swp391.horseracing.module.betting.dto.request.EntryBetOddsRequest;
import com.swp391.horseracing.module.betting.dto.response.BetOddsResponse;
import com.swp391.horseracing.module.betting.entity.betting.BetOdds;
import com.swp391.horseracing.module.race.entity.tournament.Race;
import com.swp391.horseracing.module.race.entity.tournament.RaceEntry;
import com.swp391.horseracing.core.exception.AppException;
import com.swp391.horseracing.core.exception.ErrorCode;
import com.swp391.horseracing.module.betting.repository.BetOddsRepository;
import com.swp391.horseracing.module.race.repository.RaceEntryRepository;
import com.swp391.horseracing.module.race.repository.RaceRepository;
import com.swp391.horseracing.module.betting.service.BetOddsService;
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
    RaceRepository raceRepository;


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

    @Override
    public void updateBatchOdds(Integer raceId, List<EntryBetOddsRequest> requests) {
        for (var req : requests) {
            RaceEntry entry = raceEntryRepository.findById(req.getEntryId())
                    .orElseThrow(() -> new AppException(ErrorCode.RACE_ENTRY_NOT_FOUND));

            if (!entry.getRace().getId().equals(raceId)) {
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION); // Assuming we don't have a specific error for this, we can use generic or just skip
            }

            setOdds(entry, BetOdds.BetType.win, req.getWinOdds());
            setOdds(entry, BetOdds.BetType.place, req.getPlaceOdds());
            setOdds(entry, BetOdds.BetType.show, req.getShowOdds());
        }
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

    @Override
    public void initOddsForRace(Integer raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION)); // Or a RACE_NOT_FOUND if exists
        
        List<RaceEntry> entries = raceEntryRepository.findByRaceId(raceId);
        for (RaceEntry entry : entries) {
            initOddsForEntry(entry);
        }
    }

    @Override
    public void toggleBettingStatus(Integer raceId, Race.BettingStatus status) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
        
        race.setBettingStatus(status);
        raceRepository.save(race);
    }

    @Override
    public List<BetOddsResponse> getOddsByEntry(Integer entryId) {
        return betOddsRepository.findByEntryId(entryId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
}
