package com.swp391.horseracing.module.common.repository;

import com.swp391.horseracing.module.common.entity.betting.PayosDeposit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PayosDepositRepository extends JpaRepository<PayosDeposit, Integer> {

    Optional<PayosDeposit> findByOrderCode(Long orderCode);
}
