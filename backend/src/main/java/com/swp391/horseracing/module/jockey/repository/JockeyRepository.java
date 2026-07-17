package com.swp391.horseracing.module.jockey.repository;

import com.swp391.horseracing.module.jockey.entity.profile.Jockey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JockeyRepository extends JpaRepository<Jockey,Integer> {
    List<Jockey> findByJockeyStatus(Jockey.JockeyStatus status);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByUsernameAndIdNot(String username, Integer id);

    @Query("SELECT j FROM Jockey j WHERE j.jockeyStatus = :status " +
           "AND (:keyword IS NULL OR :keyword = '' OR LOWER(j.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:gender IS NULL OR :gender = '' OR j.gender = :gender) " +
           "AND (:minExperience IS NULL OR j.experienceYears >= :minExperience) " +
           "AND (:maxWeight IS NULL OR j.weight <= :maxWeight)")
    Page<Jockey> findAvailableJockeysWithFilters(
            @Param("status") Jockey.JockeyStatus status,
            @Param("keyword") String keyword,
            @Param("gender") String gender,
            @Param("minExperience") Integer minExperience,
            @Param("maxWeight") Float maxWeight,
            Pageable pageable);
}
