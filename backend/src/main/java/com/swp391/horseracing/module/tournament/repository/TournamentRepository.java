package com.swp391.horseracing.module.tournament.repository;

import com.swp391.horseracing.module.tournament.entity.tournament.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TournamentRepository extends JpaRepository<Tournament,Integer> {
    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM Tournament t " +
            "WHERE t.startDate <= :endDate AND t.endDate >= :startDate")
    boolean existsOverlapping(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}