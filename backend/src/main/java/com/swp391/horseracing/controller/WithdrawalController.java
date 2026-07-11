package com.swp391.horseracing.controller;


import com.swp391.horseracing.dto.ApiResponse;
import com.swp391.horseracing.dto.request.WithdrawalCreationRequest;
import com.swp391.horseracing.dto.request.WithdrawalReviewRequest;
import com.swp391.horseracing.dto.response.WithdrawalResponse;
import com.swp391.horseracing.service.WithdrawalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/withdrawals")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Withdrawal",
        description = "Withdrawal request management API")
public class WithdrawalController {
    WithdrawalService withdrawalService;

    @PostMapping
    @Operation(summary = "Create Withdrawal Request",
            description = "User creates a withdrawal request, amount is deducted from wallet immediately")
    public ApiResponse<WithdrawalResponse> createRequest(@RequestBody WithdrawalCreationRequest request) {
        return ApiResponse.success(withdrawalService.createRequest(request));
    }

    @GetMapping("/my-requests")
    @Operation(summary = "Get My Requests",
            description = "User views their own withdrawal request history")
    public ApiResponse<List<WithdrawalResponse>> getMyRequests() {
        return ApiResponse.success(withdrawalService.getMyRequests());
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Get All Requests",
            description = "Only ADMIN can view all withdrawal requests")
    public ApiResponse<List<WithdrawalResponse>> getAllRequests() {
        return ApiResponse.success(withdrawalService.getAllRequests());
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Approve Request",
            description = "Only ADMIN can approve a withdrawal request")
    public ApiResponse<String> approve(@PathVariable Integer id, @RequestBody WithdrawalReviewRequest request) {
        withdrawalService.approve(id, request);
        return ApiResponse.success("Withdrawal approved!");
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Reject Request",
            description = "Only ADMIN can reject a withdrawal request, amount is refunded to wallet")
    public ApiResponse<String> reject(@PathVariable Integer id, @RequestBody WithdrawalReviewRequest request) {
        withdrawalService.reject(id, request);
        return ApiResponse.success("Withdrawal rejected, amount refunded!");
    }

    @PatchMapping("/{id}/mark-transferred")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Mark as Transferred",
            description = "Only ADMIN can mark an approved withdrawal as transferred after sending money externally")
    public ApiResponse<String> markAsTransferred(@PathVariable Integer id) {
        withdrawalService.markAsTransferred(id);
        return ApiResponse.success("Marked as transferred!");
    }
}
