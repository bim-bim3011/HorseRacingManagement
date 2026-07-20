package com.swp391.horseracing.module.admin.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardMetricsResponse {
    long totalUsers;
    long activeTournaments;
    long upcomingRaces;
    long pendingWithdrawalsCount;
    BigDecimal totalDeposits;
    BigDecimal totalWalletBalances;
}
