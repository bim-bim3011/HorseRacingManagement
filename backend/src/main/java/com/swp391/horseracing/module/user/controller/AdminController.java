package com.swp391.horseracing.module.user.controller;


import com.swp391.horseracing.module.common.dto.ApiResponse;
import com.swp391.horseracing.module.jockey.dto.response.JockeyResponse;
import com.swp391.horseracing.module.jockey.service.JockeyService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
@RequiredArgsConstructor
public class AdminController {
    JockeyService jockeyService;

    @GetMapping("/jockey-certification-requests")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<List<JockeyResponse>> getPendingJockeyCertificationRequests() {
        return ApiResponse.success(jockeyService.getPendingCertificationRequests());
    }

    @PatchMapping("/jockeys/{jockeyId}/approve-certification")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<JockeyResponse> approveJockeyCertification(@PathVariable Integer jockeyId) {
        return ApiResponse.success(jockeyService.approveCertification(jockeyId));
    }

    @PatchMapping("/jockeys/{jockeyId}/reject-certification")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<JockeyResponse> rejectJockeyCertification(@PathVariable Integer jockeyId) {
        return ApiResponse.success(jockeyService.rejectCertification(jockeyId));
    }
}
