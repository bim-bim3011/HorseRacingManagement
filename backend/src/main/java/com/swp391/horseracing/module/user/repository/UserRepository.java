package com.swp391.horseracing.module.user.repository;

import com.swp391.horseracing.module.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UserRepository extends JpaRepository<User, Integer>, JpaSpecificationExecutor<User> {
    User findByEmail(String email);
    Optional<User> findByUsername(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmailAndIdNot(String email, Integer id);
    boolean existsByUsernameAndIdNot(String username, Integer id);



}
