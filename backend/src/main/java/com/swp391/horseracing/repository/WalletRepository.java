package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.betting.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WalletRepository  extends JpaRepository<Wallet, Integer> {
    Optional<Wallet> findByUserId(Integer userId);

}
