package com.swp391.horseracing.module.race.entity.tournament;

import com.swp391.horseracing.module.common.entity.result.Violation;
import com.swp391.horseracing.module.tournament.entity.tournament.Tournament;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "penalty_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PenaltyRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @Column(name = "violation_type", nullable = false, length = 100)
    private String violationType;

    @Column(name = "point_deduction")
    @Builder.Default
    private Integer pointDeduction = 0;

    @Column(name = "fine_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal fineAmount = BigDecimal.ZERO;

    @Column(name = "ban_days")
    @Builder.Default
    private Integer banDays = 0;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "penaltyRule")
    private List<Violation> violations;
}
