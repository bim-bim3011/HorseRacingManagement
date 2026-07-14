package com.swp391.horseracing.service.impl;


import com.swp391.horseracing.dto.request.WithdrawalCreationRequest;
import com.swp391.horseracing.dto.request.WithdrawalReviewRequest;
import com.swp391.horseracing.dto.response.WithdrawalResponse;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.betting.Wallet;
import com.swp391.horseracing.entity.betting.WalletTransaction;
import com.swp391.horseracing.entity.betting.WithdrawalRequest;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.UserRepository;
import com.swp391.horseracing.repository.WithdrawalRequestRepository;
import com.swp391.horseracing.service.WalletService;
import com.swp391.horseracing.service.WithdrawalService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WithdrawalServiceImpl implements WithdrawalService {

    WithdrawalRequestRepository withdrawalRequestRepository;
    UserRepository userRepository;
    WalletService walletService;
    @Override
    @Transactional
    public WithdrawalResponse createRequest(WithdrawalCreationRequest request) {
        User user = getCurrentUser();

        Wallet wallet = walletService.getWalletByUserId(user.getId());
        if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);
        }

        WithdrawalRequest withdrawal = WithdrawalRequest.builder()
                .user(user)
                .amount(request.getAmount())
                .bankName(request.getBankName())
                .bankAccount(request.getBankAccount())
                .accountHolder(request.getAccountHolder())
                .build();

        withdrawalRequestRepository.save(withdrawal);
        walletService.deduct(user.getId(), request.getAmount(), WalletTransaction.TransactionType.withdrawal,
                "withdrawal", withdrawal.getId(), "Withdrawal request");
        return mapToResponse(withdrawal);
    }

    @Override
    public List<WithdrawalResponse> getMyRequests() {
        User user = getCurrentUser();
        return withdrawalRequestRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<WithdrawalResponse> getAllRequests() {
        return withdrawalRequestRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void approve(Integer id, WithdrawalReviewRequest request) {
        WithdrawalRequest withdrawal = findById(id);
        User admin = getCurrentUser();


        withdrawal.setStatus(WithdrawalRequest.WithdrawalStatus.approved);
        withdrawal.setAdmin(admin);
        withdrawal.setAdminNote(request.getAdminNote());
        withdrawal.setProcessedAt(LocalDateTime.now());

        withdrawalRequestRepository.save(withdrawal);
    }

    @Override
    @Transactional
    public void reject(Integer id, WithdrawalReviewRequest request) {
        WithdrawalRequest withdrawal = findById(id);
        User admin = getCurrentUser();

        walletService.credit(withdrawal.getUser().getId(), withdrawal.getAmount(),
                WalletTransaction.TransactionType.bet_refund,
                "withdrawal", withdrawal.getId(), "Refund due to rejected withdrawal request");
        withdrawal.setStatus(WithdrawalRequest.WithdrawalStatus.rejected);
        withdrawal.setAdmin(admin);
        withdrawal.setAdminNote(request.getAdminNote());
        withdrawal.setProcessedAt(LocalDateTime.now());

        withdrawalRequestRepository.save(withdrawal);
    }

    @Override
    public void markAsTransferred(Integer id) {
        WithdrawalRequest withdrawal = findById(id);

        if (withdrawal.getStatus() != WithdrawalRequest.WithdrawalStatus.approved) {
            throw new AppException(ErrorCode.WITHDRAWAL_NOT_APPROVED);
        }

        withdrawal.setStatus(WithdrawalRequest.WithdrawalStatus.transferred);
        withdrawal.setProcessedAt(LocalDateTime.now());
        withdrawalRequestRepository.save(withdrawal);
    }

    private WithdrawalRequest findById(Integer id) {
        return withdrawalRequestRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.WITHDRAWAL_NOT_FOUND));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private WithdrawalResponse mapToResponse(WithdrawalRequest withdrawal) {
        return WithdrawalResponse.builder()
                .id(withdrawal.getId())
                .username(withdrawal.getUser().getUsername())
                .amount(withdrawal.getAmount())
                .bankName(withdrawal.getBankName())
                .bankAccount(withdrawal.getBankAccount())
                .accountHolder(withdrawal.getAccountHolder())
                .status(withdrawal.getStatus().name())
                .adminNote(withdrawal.getAdminNote())
                .requestedAt(withdrawal.getRequestedAt())
                .processedAt(withdrawal.getProcessedAt())
                .build();
    }
}
