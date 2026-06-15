package com.swp391.horseracing.entity.betting;

import com.swp391.horseracing.entity.tournament.RaceEntry;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bet_odds")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BetOdds {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_id", nullable = false, unique = true)
    private RaceEntry entry;

    /** VD: 3.50 */
    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal odds;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
