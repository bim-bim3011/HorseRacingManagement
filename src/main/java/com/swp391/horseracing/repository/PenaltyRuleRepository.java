package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.tournament.PenaltyRule;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;

public interface PenaltyRuleRepository extends JpaRepository<PenaltyRule, Integer> {
    List<PenaltyRule> findByTournamentId(Integer tournamentId);
    //trước khi có ma trận vi phạm cũng cần bắt buộc nó thuộc về giải đấu nào
}
