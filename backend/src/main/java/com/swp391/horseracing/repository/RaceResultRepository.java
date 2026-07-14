package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.result.RaceResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RaceResultRepository extends JpaRepository<RaceResult, Integer> {
}
