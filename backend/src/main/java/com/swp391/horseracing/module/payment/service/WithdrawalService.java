package com.swp391.horseracing.module.payment.service;

import com.swp391.horseracing.module.payment.dto.request.WithdrawalCreationRequest;
import com.swp391.horseracing.module.payment.dto.request.WithdrawalReviewRequest;
import com.swp391.horseracing.module.payment.dto.response.WithdrawalResponse;

import java.util.List;

public interface WithdrawalService {
    WithdrawalResponse createRequest(WithdrawalCreationRequest request);
    List<WithdrawalResponse> getMyRequests();
    List<WithdrawalResponse> getAllRequests();
    void approve(Integer id, WithdrawalReviewRequest request);
    void reject(Integer id, WithdrawalReviewRequest request);
    void markAsTransferred(Integer id);
}
