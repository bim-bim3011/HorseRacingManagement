package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.betting.PayosDeposit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PayosDepositRepository extends JpaRepository<PayosDeposit, Integer> {

    Optional<PayosDeposit> findByOrderCode(Long orderCode);
}
