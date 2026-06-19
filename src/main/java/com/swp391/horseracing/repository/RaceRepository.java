package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.tournament.Race;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface RaceRepository extends JpaRepository<Race,Integer> {
    List<Race> findByTournamentId(Integer tournamentId);

    List<Race> findByStatusAndRaceDatetimeBefore(
            Race.RaceStatus status, LocalDateTime dateTime
    );
}
