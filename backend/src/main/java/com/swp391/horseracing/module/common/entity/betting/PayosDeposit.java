package com.swp391.horseracing.module.common.entity.betting;

import com.swp391.horseracing.module.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payos_deposits")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PayosDeposit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** 
     * Mã đơn hàng - PayOS yêu cầu bắt buộc là số nguyên dương (tối đa 53 bit). 
     * Khác với VNPAY có thể dùng String. 
     */
    @Column(name = "order_code", nullable = false, unique = true)
    private Long orderCode;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DepositStatus status = DepositStatus.PENDING;

    /** ID của link thanh toán do PayOS tạo ra để có thể tra cứu hoặc hủy sau này */
    @Column(name = "payment_link_id", length = 100)
    private String paymentLinkId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public enum DepositStatus {
        PENDING, SUCCESS, CANCELLED
    }
}
