package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.betting.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Integer> {

    Optional<Wallet> findByUser(User user);
}
