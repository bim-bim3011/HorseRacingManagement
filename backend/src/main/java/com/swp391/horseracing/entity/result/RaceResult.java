package com.swp391.horseracing.entity.result;

import com.swp391.horseracing.entity.profile.Referee;
import com.swp391.horseracing.entity.tournament.RaceEntry;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "race_results")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RaceResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_id", nullable = false, unique = true)
    private RaceEntry entry;

    @Column(nullable = false)
    private Integer position;

    @Column(name = "finish_time")
    private LocalTime finishTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "confirmed_by", nullable = false)
    private Referee confirmedBy;
}

