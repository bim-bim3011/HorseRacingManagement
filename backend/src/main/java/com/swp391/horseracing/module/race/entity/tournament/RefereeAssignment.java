package com.swp391.horseracing.module.race.entity.tournament;

import com.swp391.horseracing.module.race.entity.profile.Referee;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "referee_assignments",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_race_referee", columnNames = {"race_id", "referee_id"})
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RefereeAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "race_id", nullable = false)
    private Race race;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referee_id", nullable = false)
    private Referee referee;
}
