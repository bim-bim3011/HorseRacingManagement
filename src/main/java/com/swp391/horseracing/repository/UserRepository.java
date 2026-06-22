package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface  UserRepository extends JpaRepository<User,Integer> {
    User findByEmail(String email);
    Optional<User> findByUsername(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmailAndIdNot(String email, Integer id);
    boolean existsByUsernameAndIdNot(String username, Integer id);



}
