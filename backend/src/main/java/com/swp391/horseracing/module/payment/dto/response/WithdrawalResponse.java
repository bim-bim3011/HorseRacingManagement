package com.swp391.horseracing.module.payment.dto.response;


import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class WithdrawalResponse {

    private Integer id;
    private String username;
    private BigDecimal amount;
    private String bankName;
    private String bankAccount;
    private String accountHolder;
    private String status;
    private String adminNote;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
}
