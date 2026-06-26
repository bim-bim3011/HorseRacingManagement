package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.tournament.RefereeAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefereeAssignmentRepository extends JpaRepository<RefereeAssignment, Integer> {
    boolean existsByRaceIdAndRefereeId(Integer raceId, Integer refereeId);

    Optional<RefereeAssignment> findByRaceIdAndRefereeId(Integer raceId, Integer refereeId);

    List<RefereeAssignment> findByRaceId(Integer raceId);

    List<RefereeAssignment> findByRefereeId(Integer refereeId);
}
