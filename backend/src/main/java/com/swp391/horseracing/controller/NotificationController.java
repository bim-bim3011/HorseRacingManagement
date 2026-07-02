package com.swp391.horseracing.controller;

import com.swp391.horseracing.dto.response.ApiResponse;
import com.swp391.horseracing.entity.Notification;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.service.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {

    NotificationService notificationService;
    com.swp391.horseracing.repository.UserRepository userRepository;

    private Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.swp391.horseracing.exception.AppException(com.swp391.horseracing.exception.ErrorCode.USER_NOT_FOUND));
        return user.getId();
    }

    @GetMapping
    public ApiResponse<Page<Notification>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
            
        Integer userId = getCurrentUserId();
        Page<Notification> notifications = notificationService.getUserNotifications(userId, page, size);
        return ApiResponse.<Page<Notification>>builder()
                .result(notifications)
                .build();
    }

    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount() {
        Integer userId = getCurrentUserId();
        return ApiResponse.<Long>builder()
                .result(notificationService.getUnreadCount(userId))
                .build();
    }

    @PutMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable Integer id) {
        Integer userId = getCurrentUserId();
        notificationService.markAsRead(id, userId);
        return ApiResponse.<Void>builder().build();
    }

    @PutMapping("/read-all")
    public ApiResponse<Void> markAllAsRead() {
        Integer userId = getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ApiResponse.<Void>builder().build();
    }
}
