package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.response.BetOddsResponse;
import com.swp391.horseracing.entity.betting.BetOdds;
import com.swp391.horseracing.entity.tournament.Race;
import com.swp391.horseracing.entity.tournament.RaceEntry;
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
    public void generateOddsForRace(Race race) {
        List<RaceEntry> entries = raceEntryRepository.findByRaceId(race.getId());
        int n = entries.size();

        if (n == 0) {
            return;
        }

        BigDecimal winOdds = BigDecimal.valueOf(n);
        BigDecimal placeOdds = BigDecimal.valueOf(n).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
        BigDecimal showOdds = BigDecimal.valueOf(n).divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);

        for (RaceEntry entry : entries) {
            saveOrUpdateOdds(entry, BetOdds.BetType.win, winOdds);
            saveOrUpdateOdds(entry, BetOdds.BetType.place, placeOdds);
            saveOrUpdateOdds(entry, BetOdds.BetType.show, showOdds);
        }
    }
    private void saveOrUpdateOdds(RaceEntry entry, BetOdds.BetType type, BigDecimal odds) {
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
