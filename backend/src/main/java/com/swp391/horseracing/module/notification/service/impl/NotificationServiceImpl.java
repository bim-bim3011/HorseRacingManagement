package com.swp391.horseracing.module.notification.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp391.horseracing.core.exception.AppException;
import com.swp391.horseracing.core.exception.ErrorCode;
import com.swp391.horseracing.module.notification.dto.response.NotificationResponse;
import com.swp391.horseracing.module.notification.entity.Notification;
import com.swp391.horseracing.module.user.entity.User;
import com.swp391.horseracing.module.notification.repository.NotificationRepository;
import com.swp391.horseracing.module.notification.service.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationServiceImpl implements NotificationService {

    NotificationRepository notificationRepository;
    RedisTemplate<String, Object> redisTemplate;
    ObjectMapper objectMapper;

    @Override
    public void sendNotification(User user, Notification.NotificationType type, String title, String content) {
        // 1. Lưu vào Database
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .content(content)
                .isRead(false)
                .build();
        
        Notification savedNotification = notificationRepository.save(notification);

        // 2. Publish vào Redis Channel
        try {
            // Đóng gói dữ liệu để gửi đi
            Map<String, Object> messageMap = new HashMap<>();
            messageMap.put("userId", user.getId());
            
            // Payload gửi cho Frontend có thể chứa toàn bộ object notification
            Map<String, Object> payload = new HashMap<>();
            payload.put("id", savedNotification.getId());
            payload.put("title", savedNotification.getTitle());
            payload.put("content", savedNotification.getContent());
            payload.put("type", savedNotification.getType());
            payload.put("createdAt", savedNotification.getCreatedAt() != null ? savedNotification.getCreatedAt().toString() : null);
            payload.put("isRead", savedNotification.getIsRead());

            messageMap.put("payload", payload);

            // Chuyển thành JSON String để gửi qua Redis
            String jsonMessage = objectMapper.writeValueAsString(messageMap);
            
            // "notificationChannel" phải khớp với tên trong RedisConfig
            redisTemplate.convertAndSend("notificationChannel", jsonMessage);

        } catch (Exception e) {
            // Có thể log lỗi ra, nhưng không nên ném exception làm hỏng luồng chính (ví dụ approve horse thành công nhưng lỗi gửi thông báo thì vẫn phải approve thành công)
            System.err.println("Lỗi khi publish notification lên Redis: " + e.getMessage());
        }
    }

    @Override
    public org.springframework.data.domain.Page<NotificationResponse> getUserNotifications(Integer userId, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending());
        org.springframework.data.domain.Page<Notification> entities = notificationRepository.findByUserId(userId, pageable);
        return entities.map(n -> NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .content(n.getContent())
                .type(n.getType() != null ? n.getType().name() : null)
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build());
    }

    @Override
    public void markAsRead(Integer notificationId, Integer userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
                
        if (!notification.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(Integer userId) {
        java.util.List<Notification> unreadNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(n -> !n.getIsRead())
                .toList();
                
        unreadNotifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    @Override
    public long getUnreadCount(Integer userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}
