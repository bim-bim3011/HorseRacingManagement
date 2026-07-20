package com.swp391.horseracing.module.user.service;

import com.swp391.horseracing.core.exception.AppException;
import com.swp391.horseracing.core.exception.ErrorCode;
import com.swp391.horseracing.module.auth.entity.Role;
import com.swp391.horseracing.module.common.repository.RoleRepository;
import com.swp391.horseracing.module.user.dto.request.UserFilterRequest;
import com.swp391.horseracing.module.common.dto.PaginationResponse;
import com.swp391.horseracing.module.user.dto.response.AdminUserResponse;
import com.swp391.horseracing.module.user.entity.User;
import com.swp391.horseracing.module.user.repository.UserRepository;
import com.swp391.horseracing.module.user.repository.UserSpecification;
import com.swp391.horseracing.module.horse.entity.profile.HorseOwner;
import com.swp391.horseracing.module.jockey.entity.profile.Jockey;
import com.swp391.horseracing.module.race.entity.profile.Referee;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public PaginationResponse<AdminUserResponse> searchAndFilterUsers(UserFilterRequest request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Specification<User> spec = UserSpecification.filterUsers(request.getKeyword(), request.getStatus(), request.getRoleId());
        
        Page<AdminUserResponse> page = userRepository.findAll(spec, pageable).map(this::mapToAdminUserResponse);
        return PaginationResponse.of(page);
    }

    public long getTotalUsersCount() {
        return userRepository.count();
    }

    public AdminUserResponse getUserDetail(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return mapToAdminUserResponse(user);
    }

    @Transactional
    public void changeUserStatus(Integer userId, User.UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setStatus(status);
        userRepository.save(user);
    }

    @Transactional
    public void assignUserRoles(Integer userId, Set<Integer> roleIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        List<Role> roles = roleRepository.findAllById(roleIds);
        if (roles.isEmpty()) {
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }
        
        user.setRoles(new HashSet<>(roles));
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Soft delete: update status to inactive or banned.
        // Assuming inactive for deleted user
        user.setStatus(User.UserStatus.inactive);
        userRepository.save(user);
    }

    private AdminUserResponse mapToAdminUserResponse(User user) {
        String userType = "General";
        if (user instanceof Jockey) {
            userType = "Jockey";
        } else if (user instanceof HorseOwner) {
            userType = "Horse Owner";
        } else if (user instanceof Referee) {
            userType = "Referee";
        }

        return AdminUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .status(user.getStatus().name())
                .walletBalance(user.getWallet() != null ? user.getWallet().getBalance() : null)
                .roles(user.getRoles().stream().map(Role::getRoleName).collect(Collectors.toList()))
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .userType(userType)
                .build();
    }
}
