package com.swp391.horseracing.module.horse.repository;

import com.swp391.horseracing.module.horse.entity.horse.Horse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HorseRepository extends JpaRepository<Horse , Integer> {
    boolean existsByNameAndOwnerId(String name, Integer ownerId);
    List<Horse> findByOwnerId(Integer ownerId);

    List<Horse> findByStatus(Horse.HorseStatus status);

    @Query("SELECT h FROM Horse h WHERE h.owner.id = :ownerId " +
           "AND (:keyword IS NULL OR :keyword = '' OR LOWER(h.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:status IS NULL OR h.status = :status) " +
           "AND (:gender IS NULL OR :gender = '' OR h.gender = :gender)")
    Page<Horse> findMyHorsesWithFilters(
           @Param("ownerId") Integer ownerId, 
           @Param("keyword") String keyword, 
           @Param("status") Horse.HorseStatus status, 
           @Param("gender") String gender, 
           Pageable pageable);
}
