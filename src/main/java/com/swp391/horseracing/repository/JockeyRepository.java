package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.profile.Jockey;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JockeyRepository extends JpaRepository<Jockey,Integer> {
}
