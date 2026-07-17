package com.swp391.horseracing.module.common.service.impl;

import com.swp391.horseracing.module.common.entity.betting.Wallet;
import com.swp391.horseracing.module.payment.entity.betting.WalletTransaction;
import com.swp391.horseracing.core.exception.AppException;
import com.swp391.horseracing.core.exception.ErrorCode;
import com.swp391.horseracing.module.common.repository.WalletRepository;
import com.swp391.horseracing.module.payment.repository.WalletTransactionRepository;
import com.swp391.horseracing.module.common.service.WalletService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WalletServiceImpl implements WalletService {
    WalletRepository walletRepository;
    WalletTransactionRepository walletTransactionRepository;
    @Override
    public Wallet getWalletByUserId(Integer userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_FOUND));
    }

    @Override
    @Transactional
    public void deduct(Integer userId, BigDecimal amount, WalletTransaction.TransactionType type, String refType, Integer refId, String note) {
        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_FOUND));

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);
        }

        BigDecimal newBalance = wallet.getBalance().subtract(amount);
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        WalletTransaction transaction = WalletTransaction.builder()
                .wallet(wallet)
                .type(type)
                .amount(amount.negate())//negate (-)
                .balanceAfter(newBalance)
                .refType(refType)
                .refId(refId)
                .note(note)
                .build();
        walletTransactionRepository.save(transaction);
    }

    @Override
    @Transactional
    public void credit(Integer userId, BigDecimal amount, WalletTransaction.TransactionType type, String refType, Integer refId, String note) {
        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_FOUND));

        BigDecimal newBalance = wallet.getBalance().add(amount);
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        WalletTransaction transaction = WalletTransaction.builder()
                .wallet(wallet)
                .type(type)
                .amount(amount)
                .balanceAfter(newBalance)
                .refType(refType)
                .refId(refId)
                .note(note)
                .build();
        walletTransactionRepository.save(transaction);
    }
}
