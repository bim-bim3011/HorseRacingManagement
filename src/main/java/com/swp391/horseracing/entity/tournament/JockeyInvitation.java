package com.swp391.horseracing.entity.tournament;

import com.swp391.horseracing.entity.horse.Horse;
import com.swp391.horseracing.entity.profile.Jockey;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "jockey_invitations",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_invitation", columnNames = {"race_id", "horse_id", "jockey_id"})
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class JockeyInvitation {

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
    @JoinColumn(name = "jockey_id", nullable = false)
    private Jockey jockey;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private InvitationStatus status = InvitationStatus.pending;

    public enum InvitationStatus {
        pending, accepted, declined
    }
}
