package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.betting.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Integer> {

    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Integer walletId);

}
