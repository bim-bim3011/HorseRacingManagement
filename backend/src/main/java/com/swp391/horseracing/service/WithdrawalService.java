package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.WithdrawalCreationRequest;
import com.swp391.horseracing.dto.request.WithdrawalReviewRequest;
import com.swp391.horseracing.dto.response.WithdrawalResponse;

import java.util.List;

public interface WithdrawalService {
    WithdrawalResponse createRequest(WithdrawalCreationRequest request);
    List<WithdrawalResponse> getMyRequests();
    List<WithdrawalResponse> getAllRequests();
    void approve(Integer id, WithdrawalReviewRequest request);
    void reject(Integer id, WithdrawalReviewRequest request);
    void markAsTransferred(Integer id);
}
