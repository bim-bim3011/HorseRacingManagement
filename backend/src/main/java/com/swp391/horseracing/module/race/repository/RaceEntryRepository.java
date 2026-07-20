package com.swp391.horseracing.module.race.repository;

import com.swp391.horseracing.module.horse.dto.response.UpcomingRaceOverviewDto;
import com.swp391.horseracing.module.race.entity.tournament.RaceEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RaceEntryRepository extends JpaRepository<RaceEntry , Integer> {

    boolean existsByRaceIdAndHorseId(Integer raceId, Integer horseId);

    List<RaceEntry> findByRaceId(Integer raceId);

    List<RaceEntry> findByHorseId(Integer horseId);

    List<RaceEntry> findByJockeyId(Integer jockeyId);

    List<RaceEntry> findByStatus(RaceEntry.EntryStatus status);

    int countByRaceIdAndStatus(Integer raceId, RaceEntry.EntryStatus status);

    List<RaceEntry> findByRaceIdAndStatus(Integer raceId, RaceEntry.EntryStatus status);

    Optional<RaceEntry> findByRaceIdAndHorseId(Integer raceId, Integer horseId);

    @Query("SELECT COUNT(re) FROM RaceEntry re WHERE re.horse.owner.id = :ownerId AND re.race.raceDatetime > CURRENT_TIMESTAMP")
    Integer countUpcomingRacesByOwnerId(@Param("ownerId") Integer ownerId);

    @Query("SELECT new com.swp391.horseracing.module.horse.dto.response.UpcomingRaceOverviewDto(re.race.id, re.race.name, re.race.tournament.name, re.race.raceDatetime, re.horse.name, re.jockey.fullName) " +
           "FROM RaceEntry re WHERE re.horse.owner.id = :ownerId AND re.race.raceDatetime > CURRENT_TIMESTAMP ORDER BY re.race.raceDatetime ASC")
    List<UpcomingRaceOverviewDto> findUpcomingRacesByOwnerId(@Param("ownerId") Integer ownerId, org.springframework.data.domain.Pageable pageable);

}
