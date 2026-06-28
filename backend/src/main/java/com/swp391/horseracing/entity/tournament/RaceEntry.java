package com.swp391.horseracing.entity.tournament;

import com.swp391.horseracing.entity.betting.Bet;
import com.swp391.horseracing.entity.betting.BetOdds;
import com.swp391.horseracing.entity.horse.Horse;
import com.swp391.horseracing.entity.profile.Jockey;
import com.swp391.horseracing.entity.result.RaceResult;
import com.swp391.horseracing.entity.result.Violation;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(
        name = "race_entries",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_race_horse",   columnNames = {"race_id", "horse_id"}),
                @UniqueConstraint(name = "uq_race_jockey",  columnNames = {"race_id", "jockey_id"}),
                @UniqueConstraint(name = "uq_race_lane", columnNames = {"race_id", "lane_number"})
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RaceEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "race_id", nullable = false)
    private Race race;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "horse_id", nullable = false)
    private Horse horse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jockey_id")
    private Jockey jockey;

    @Column(name = "lane_number")
    private Integer laneNumber;


    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EntryStatus status = EntryStatus.approved;

    @OneToOne(mappedBy = "entry", cascade = CascadeType.ALL)
    private RaceResult result;

    @OneToOne(mappedBy = "entry", cascade = CascadeType.ALL)
    private BetOdds betOdds;

    @OneToMany(mappedBy = "entry")
    private List<Bet> bets;

    @OneToMany(mappedBy = "entry")
    private List<Violation> violations;

    public enum EntryStatus {
         approved, rejected
    }
}

