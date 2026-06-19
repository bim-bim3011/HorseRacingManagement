package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.horse.Horse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HorseRepository extends JpaRepository<Horse , Integer> {
    boolean existsByNameAndOwnerId(String name, Integer ownerId);
    List<Horse> findByOwnerId(Integer ownerId);


    List<Horse> findByStatus(Horse.HorseStatus status);
}
