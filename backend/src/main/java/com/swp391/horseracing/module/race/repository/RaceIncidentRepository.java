package com.swp391.horseracing.module.race.repository;

import com.swp391.horseracing.module.race.entity.result.RaceIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RaceIncidentRepository extends JpaRepository<RaceIncident, Integer> {
    List<RaceIncident> findByEntry_Race_Id(Integer raceId);
}
