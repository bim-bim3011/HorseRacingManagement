package com.swp391.horseracing.entity.result;

import com.swp391.horseracing.entity.profile.Referee;
import com.swp391.horseracing.entity.tournament.PenaltyRule;
import com.swp391.horseracing.entity.tournament.Race;
import com.swp391.horseracing.entity.tournament.RaceEntry;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "violations")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Violation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "race_id", nullable = false)
    private Race race;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_id", nullable = false)
    private RaceEntry entry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referee_id", nullable = false)
    private Referee referee;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "penalty_rule_id")  // ← thêm FK
    private PenaltyRule penaltyRule;
}

