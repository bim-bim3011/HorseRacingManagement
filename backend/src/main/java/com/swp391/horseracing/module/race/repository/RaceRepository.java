package com.swp391.horseracing.module.race.repository;

import com.swp391.horseracing.module.race.entity.tournament.Race;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RaceRepository extends JpaRepository<Race,Integer> {
    List<Race> findByTournamentId(Integer tournamentId);

    List<Race> findByStatusAndRaceDatetimeBefore(
            Race.RaceStatus status, LocalDateTime dateTime
    );
    Optional<Race> findByTournamentIdAndRoundOrder(Integer tournamentId, Integer roundOrder);
}
