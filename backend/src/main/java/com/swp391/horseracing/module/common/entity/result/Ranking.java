package com.swp391.horseracing.module.common.entity.result;

import com.swp391.horseracing.module.tournament.entity.tournament.Tournament;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "rankings",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_tournament_entity", columnNames = {"tournament_id", "entity_type", "entity_id"})
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Ranking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false)
    private EntityType entityType;

    /*
     * Trỏ tới horse.id / jockey.id / horse_owner.id tuỳ entity_type.
     * Không dùng FK vì trỏ về 3 bảng khác nhau.
     */
    @Column(name = "entity_id", nullable = false)
    private Integer entityId;

    @Column(name = "total_points")
    @Builder.Default
    private Integer totalPoints = 0;

    @Column(name = "rank_position")
    private Integer rankPosition;

    public enum EntityType {
        horse, jockey, owner
    }
}

