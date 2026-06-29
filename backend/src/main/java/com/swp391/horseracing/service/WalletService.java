package com.swp391.horseracing.service;

import com.swp391.horseracing.entity.betting.Wallet;
import com.swp391.horseracing.entity.betting.WalletTransaction;

import java.math.BigDecimal;

public interface WalletService {
    Wallet getWalletByUserId(Integer userId);
    void deduct(Integer userId, BigDecimal amount, WalletTransaction.TransactionType type, String refType, Integer refId, String note);
    void credit(Integer userId, BigDecimal amount, WalletTransaction.TransactionType type, String refType, Integer refId, String note);
}
