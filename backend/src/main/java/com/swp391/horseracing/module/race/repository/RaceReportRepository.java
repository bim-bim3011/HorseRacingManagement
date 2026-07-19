package com.swp391.horseracing.module.race.repository;

import com.swp391.horseracing.module.race.entity.result.RaceReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RaceReportRepository extends JpaRepository<RaceReport, Integer> {
    Optional<RaceReport> findByRaceId(Integer raceId);
}
