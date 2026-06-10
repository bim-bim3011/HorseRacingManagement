package com.swp391.horseracing.entity.betting;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.tournament.RaceEntry;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bets")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Bet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_id", nullable = false)
    private RaceEntry entry;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    /** Tỷ lệ tại thời điểm đặt cược */
    @Column(name = "odds_snapshot", nullable = false, precision = 6, scale = 2)
    private BigDecimal oddsSnapshot;

    /** amount × odds_snapshot */
    @Column(name = "potential_payout", nullable = false, precision = 15, scale = 2)
    private BigDecimal potentialPayout;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BetStatus status = BetStatus.pending;

    @Column(name = "actual_payout", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal actualPayout = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "placed_at", updatable = false)
    private LocalDateTime placedAt;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    public enum BetStatus {
        pending, won, lost, refunded, cancelled
    }
}
