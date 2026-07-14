package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.betting.BetOdds;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BetOddsRepository extends JpaRepository<BetOdds, Integer> {
    Optional<BetOdds> findByEntryIdAndBetType(Integer entryId, BetOdds.BetType betType);
    List<BetOdds> findByEntryId(Integer entryId);
    List<BetOdds> findByEntry_Race_Id(Integer raceId);

}
