package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.betting.Bet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BetRepository extends JpaRepository<Bet, Integer> {
    List<Bet> findByUserId(Integer userId);
    List<Bet> findByEntry_Race_Id(Integer raceId);
    List<Bet> findByEntry_Race_IdAndStatus(Integer raceId, Bet.BetStatus status);

}
