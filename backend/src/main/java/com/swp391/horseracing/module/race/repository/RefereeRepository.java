package com.swp391.horseracing.module.race.repository;

import com.swp391.horseracing.module.user.entity.User;
import com.swp391.horseracing.module.race.entity.profile.Referee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RefereeRepository extends JpaRepository<Referee, Integer> {
    List<Referee> findByStatus(User.UserStatus status);

    boolean existsByLicenseNumber(String licenseNumber);

    boolean existsByLicenseNumberAndIdNot(String licenseNumber, Integer id);
    
    java.util.Optional<Referee> findByUsername(String username);
}
