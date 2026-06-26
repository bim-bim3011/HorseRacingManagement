package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.profile.Referee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RefereeRepository extends JpaRepository<Referee, Integer> {
    List<Referee> findByStatus(User.UserStatus status);

    boolean existsByLicenseNumber(String licenseNumber);

    boolean existsByLicenseNumberAndIdNot(String licenseNumber, Integer id);
}
