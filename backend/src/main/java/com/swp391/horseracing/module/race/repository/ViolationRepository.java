package com.swp391.horseracing.module.race.repository;

import com.swp391.horseracing.module.common.entity.result.Violation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ViolationRepository extends JpaRepository<Violation, Integer> {
    List<Violation> findByRaceId(Integer raceId);
}
