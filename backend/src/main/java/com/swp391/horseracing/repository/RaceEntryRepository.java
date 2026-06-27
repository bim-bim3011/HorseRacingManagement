package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.tournament.RaceEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RaceEntryRepository extends JpaRepository<RaceEntry , Integer> {

    boolean existsByRaceIdAndHorseId(Integer raceId, Integer horseId);

    List<RaceEntry> findByRaceId(Integer raceId);

    List<RaceEntry> findByHorseId(Integer horseId);

    List<RaceEntry> findByStatus(RaceEntry.EntryStatus status);

    int countByRaceIdAndStatus(Integer raceId, RaceEntry.EntryStatus status);

    List<RaceEntry> findByRaceIdAndStatus(Integer raceId, RaceEntry.EntryStatus status);

    Optional<RaceEntry> findByRaceIdAndHorseId(Integer raceId, Integer horseId);



}
