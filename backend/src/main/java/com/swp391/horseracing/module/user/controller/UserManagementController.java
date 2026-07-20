package com.swp391.horseracing.module.user.controller;

import com.swp391.horseracing.module.common.dto.ApiResponse;
import com.swp391.horseracing.module.user.dto.request.UserFilterRequest;
import com.swp391.horseracing.module.user.dto.request.UserRoleUpdateRequest;
import com.swp391.horseracing.module.user.dto.request.UserStatusUpdateRequest;
import com.swp391.horseracing.module.user.entity.User;
import com.swp391.horseracing.module.common.dto.PaginationResponse;
import com.swp391.horseracing.module.user.dto.response.AdminUserResponse;
import com.swp391.horseracing.module.user.service.UserManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<PaginationResponse<AdminUserResponse>> searchAndFilterUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer roleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        UserFilterRequest filterRequest = UserFilterRequest.builder()
                .keyword(keyword)
                .status(status)
                .roleId(roleId)
                .page(page)
                .size(size)
                .build();
        
        return ApiResponse.success(userManagementService.searchAndFilterUsers(filterRequest));
    }

    @GetMapping("/test")
    public ApiResponse<PaginationResponse<AdminUserResponse>> testPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UserFilterRequest filterRequest = UserFilterRequest.builder()
                .page(page)
                .size(size)
                .build();
        long totalUsersInDb = userManagementService.getTotalUsersCount();
        ApiResponse<PaginationResponse<AdminUserResponse>> response = ApiResponse.success(userManagementService.searchAndFilterUsers(filterRequest));
        response.setMessage("Total users in DB (unfiltered): " + totalUsersInDb);
        return response;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<AdminUserResponse> getUserDetail(@PathVariable Integer id) {
        return ApiResponse.success(userManagementService.getUserDetail(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<String> changeUserStatus(@PathVariable Integer id, @Valid @RequestBody UserStatusUpdateRequest request) {
        userManagementService.changeUserStatus(id, request.getStatus());
        return ApiResponse.success("Status updated successfully");
    }

    @PatchMapping("/{id}/roles")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<String> assignUserRoles(@PathVariable Integer id, @RequestBody UserRoleUpdateRequest request) {
        userManagementService.assignUserRoles(id, request.getRoleIds());
        return ApiResponse.success("Roles updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<String> deleteUser(@PathVariable Integer id) {
        userManagementService.deleteUser(id);
        return ApiResponse.success("User deleted successfully");
    }
}
