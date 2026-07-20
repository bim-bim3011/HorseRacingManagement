package com.swp391.horseracing.module.admin.controller;

import com.swp391.horseracing.module.admin.dto.response.AttentionRequiredResponse;
import com.swp391.horseracing.module.admin.dto.response.DashboardMetricsResponse;
import com.swp391.horseracing.module.admin.dto.response.RoleDistributionResponse;
import com.swp391.horseracing.module.admin.service.AdminDashboardService;
import com.swp391.horseracing.module.common.dto.ApiResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminDashboardController {

    AdminDashboardService adminDashboardService;

    @GetMapping("/metrics")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<DashboardMetricsResponse> getMetrics() {
        return ApiResponse.success(adminDashboardService.getMetrics());
    }

    @GetMapping("/user-roles-chart")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<List<RoleDistributionResponse>> getUserRolesChart() {
        return ApiResponse.success(adminDashboardService.getRoleDistribution());
    }

    @GetMapping("/attention-required")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<List<AttentionRequiredResponse>> getAttentionRequired() {
        return ApiResponse.success(adminDashboardService.getAttentionRequired());
    }
}
