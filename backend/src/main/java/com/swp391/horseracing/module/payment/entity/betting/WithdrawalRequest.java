package com.swp391.horseracing.module.payment.entity.betting;

import com.swp391.horseracing.module.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "withdrawal_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class WithdrawalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "bank_name", nullable = false, length = 100)
    private String bankName;

    @Column(name = "bank_account", nullable = false, length = 50)
    private String bankAccount;

    @Column(name = "account_holder", nullable = false, length = 100)
    private String accountHolder;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private WithdrawalStatus status = WithdrawalStatus.pending;

    /** Admin phê duyệt – null nếu chưa xử lý */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User admin;

    @Column(name = "admin_note", length = 255)
    private String adminNote;

    @CreationTimestamp
    @Column(name = "requested_at", updatable = false)
    private LocalDateTime requestedAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    public enum WithdrawalStatus {
        pending, approved, rejected, transferred
    }
}
