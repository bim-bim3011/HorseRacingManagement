package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.betting.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface WalletRepository  extends JpaRepository<Wallet, Integer> {
    Optional<Wallet> findByUserId(Integer userId);
     Optional<Wallet> findByUser(User user);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.user.id = :userId")
    Optional<Wallet> findByUserIdForUpdate(@Param("userId") Integer userId);
}

