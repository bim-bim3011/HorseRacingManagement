package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.betting.VnpayDeposit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VnpayDepositRepository extends JpaRepository<VnpayDeposit, Integer> {

    Optional<VnpayDeposit> findByTxnRef(String txnRef);
}
