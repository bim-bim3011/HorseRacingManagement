package com.swp391.horseracing.module.common.repository;

import com.swp391.horseracing.module.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role,Integer>{
    boolean existsByRoleName(String roleName);

    Optional<Role> findByRoleName(String roleName);

}
