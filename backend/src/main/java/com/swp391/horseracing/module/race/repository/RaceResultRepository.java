package com.swp391.horseracing.module.race.repository;

import com.swp391.horseracing.module.race.entity.result.RaceResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import com.swp391.horseracing.module.horse.dto.response.HorseStatsDto;

@Repository
public interface RaceResultRepository extends JpaRepository<RaceResult, Integer> {

    @Query("SELECT COUNT(rr) FROM RaceResult rr WHERE rr.entry.horse.owner.id = :ownerId AND rr.position = 1")
    Integer countFirstPlacesByOwnerId(@Param("ownerId") Integer ownerId);

    @Query("SELECT new com.swp391.horseracing.module.horse.dto.response.HorseStatsDto(h.id, h.name, COUNT(rr)) " +
           "FROM RaceResult rr JOIN rr.entry.horse h " +
           "WHERE h.owner.id = :ownerId AND rr.position = 1 " +
           "GROUP BY h.id, h.name " +
           "ORDER BY COUNT(rr) DESC")
    List<HorseStatsDto> findTopHorsesByOwnerId(@Param("ownerId") Integer ownerId, Pageable pageable);
}
