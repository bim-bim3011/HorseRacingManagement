package com.swp391.horseracing.module.race.repository;

import com.swp391.horseracing.module.race.entity.tournament.PenaltyRule;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;

public interface PenaltyRuleRepository extends JpaRepository<PenaltyRule, Integer> {
    List<PenaltyRule> findByTournamentId(Integer tournamentId);

}
