package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.betting.WithdrawalRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, Integer> {

    List<WithdrawalRequest> findByUserId(Integer userId);
    List<WithdrawalRequest> findByStatus(WithdrawalRequest.WithdrawalStatus status);
}
