package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    
    // Lấy danh sách thông báo của 1 user, sắp xếp mới nhất lên đầu
    List<Notification> findByUserIdOrderByCreatedAtDesc(Integer userId);

    // Hỗ trợ phân trang nếu cần
    Page<Notification> findByUserId(Integer userId, Pageable pageable);

    // Đếm số thông báo chưa đọc
    long countByUserIdAndIsReadFalse(Integer userId);
}
