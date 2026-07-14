package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.response.NotificationResponse;
import com.swp391.horseracing.entity.Notification;
import com.swp391.horseracing.entity.User;

public interface NotificationService {
    
    /**
     * Tạo và gửi thông báo realtime cho user
     * @param user Người nhận thông báo
     * @param type Loại thông báo
     * @param title Tiêu đề
     * @param content Nội dung chi tiết
     */
    void sendNotification(User user, Notification.NotificationType type, String title, String content);

    // Dành cho REST API
    org.springframework.data.domain.Page<NotificationResponse> getUserNotifications(Integer userId, int page, int size);
    
    void markAsRead(Integer notificationId, Integer userId);
    
    void markAllAsRead(Integer userId);
    
    long getUnreadCount(Integer userId);
}
