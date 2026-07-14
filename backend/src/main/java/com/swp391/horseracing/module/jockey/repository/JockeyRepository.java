package com.swp391.horseracing.module.jockey.repository;

import com.swp391.horseracing.module.jockey.entity.profile.Jockey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JockeyRepository extends JpaRepository<Jockey,Integer> {
    List<Jockey> findByJockeyStatus(Jockey.JockeyStatus status);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByUsernameAndIdNot(String username, Integer id);
}
