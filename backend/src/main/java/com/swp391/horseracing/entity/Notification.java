package com.swp391.horseracing.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NotificationType type = NotificationType.SYSTEM;

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {
        HORSE_APPROVED,
        HORSE_REJECTED,
        TOURNAMENT_REGISTRATION_APPROVED,
        TOURNAMENT_REGISTRATION_REJECTED,
        JOCKEY_INVITATION_RECEIVED,
        JOCKEY_INVITATION_ACCEPTED,
        JOCKEY_INVITATION_DECLINED,
        RACE_SCHEDULE_CHANGED,
        RACE_STARTING_SOON,
        RACE_RESULT_PUBLISHED,
        WITHDRAW_REQUEST_APPROVED,
        WITHDRAW_REQUEST_REJECTED,
        
        // Cũ (giữ lại và viết hoa)
        PREDICTION_WON,
        PREDICTION_LOST,
        SYSTEM
    }
}


