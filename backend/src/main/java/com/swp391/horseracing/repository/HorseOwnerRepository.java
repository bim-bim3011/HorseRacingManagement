package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.profile.HorseOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface HorseOwnerRepository extends JpaRepository<HorseOwner, Integer>{

    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmailAndIdNot(String email, Integer id);
    boolean existsByUsernameAndIdNot(String username, Integer id);
}
