package com.swp391.horseracing.entity.betting;

import com.swp391.horseracing.entity.tournament.RaceEntry;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bet_odds" ,
        uniqueConstraints = @UniqueConstraint(name = "uq_entry_bettype", columnNames = {"entry_id", "bet_type"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BetOdds {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_id", nullable = false)
    private RaceEntry entry;

    /** VD: 3.50 */
    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal odds;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "bet_type", nullable = false)
    private BetType betType;

    public enum BetType {
        win, place, show
    }
}
