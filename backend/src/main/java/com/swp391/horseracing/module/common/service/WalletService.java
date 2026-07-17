package com.swp391.horseracing.module.common.service;

import com.swp391.horseracing.module.common.entity.betting.Wallet;
import com.swp391.horseracing.module.payment.entity.betting.WalletTransaction;

import java.math.BigDecimal;

public interface WalletService {
    Wallet getWalletByUserId(Integer userId);
    void deduct(Integer userId, BigDecimal amount, WalletTransaction.TransactionType type, String refType, Integer refId, String note);
    void credit(Integer userId, BigDecimal amount, WalletTransaction.TransactionType type, String refType, Integer refId, String note);
}
