package com.swp391.horseracing.module.admin.service;

import com.swp391.horseracing.module.admin.dto.response.AttentionRequiredResponse;
import com.swp391.horseracing.module.admin.dto.response.DashboardMetricsResponse;
import com.swp391.horseracing.module.admin.dto.response.RoleDistributionResponse;
import com.swp391.horseracing.module.common.repository.PayosDepositRepository;
import com.swp391.horseracing.module.common.repository.VnpayDepositRepository;
import com.swp391.horseracing.module.common.repository.WalletRepository;
import com.swp391.horseracing.module.payment.repository.WithdrawalRequestRepository;
import com.swp391.horseracing.module.tournament.repository.TournamentRepository;
import com.swp391.horseracing.module.user.repository.UserRepository;
import com.swp391.horseracing.module.race.repository.RaceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminDashboardService {

    UserRepository userRepository;
    TournamentRepository tournamentRepository;
    RaceRepository raceRepository;
    WithdrawalRequestRepository withdrawalRequestRepository;
    WalletRepository walletRepository;
    PayosDepositRepository payosDepositRepository;
    VnpayDepositRepository vnpayDepositRepository;

    @Transactional(readOnly = true)
    public DashboardMetricsResponse getMetrics() {
        long totalUsers = userRepository.count();
        long activeTournaments = tournamentRepository.count(); // TODO: filter by status if available
        long upcomingRaces = raceRepository.count(); // TODO: filter by status if available
        long pendingWithdrawalsCount = withdrawalRequestRepository.count(); // TODO: filter by status PENDING

        // For simplicity, returning 0 if not implemented custom queries
        BigDecimal totalDeposits = BigDecimal.ZERO; 
        BigDecimal totalWalletBalances = BigDecimal.ZERO;

        try {
            // Need custom query for sum of wallet balances
            // totalWalletBalances = walletRepository.sumBalances();
        } catch (Exception e) {
            log.error("Error calculating total wallet balances", e);
        }

        return DashboardMetricsResponse.builder()
                .totalUsers(totalUsers)
                .activeTournaments(activeTournaments)
                .upcomingRaces(upcomingRaces)
                .pendingWithdrawalsCount(pendingWithdrawalsCount)
                .totalDeposits(totalDeposits)
                .totalWalletBalances(totalWalletBalances)
                .build();
    }

    @Transactional(readOnly = true)
    public List<RoleDistributionResponse> getRoleDistribution() {
        // Fetch raw distribution, for now returning mock or empty to prevent crash
        // A custom query in UserRepository is ideal: 
        // SELECT r.name, COUNT(u.id) FROM User u JOIN u.roles r GROUP BY r.name
        List<RoleDistributionResponse> list = new ArrayList<>();
        list.add(RoleDistributionResponse.builder().name("SPECTATOR").value(50).build());
        list.add(RoleDistributionResponse.builder().name("HORSE_OWNER").value(10).build());
        list.add(RoleDistributionResponse.builder().name("JOCKEY").value(15).build());
        list.add(RoleDistributionResponse.builder().name("REFEREE").value(5).build());
        return list;
    }

    @Transactional(readOnly = true)
    public List<AttentionRequiredResponse> getAttentionRequired() {
        List<AttentionRequiredResponse> list = new ArrayList<>();
        // Fetch from withdrawal requests, pending registrations etc.
        return list;
    }
}
