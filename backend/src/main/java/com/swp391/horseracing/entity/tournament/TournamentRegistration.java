package com.swp391.horseracing.entity.tournament;


import com.swp391.horseracing.entity.horse.Horse;
import com.swp391.horseracing.entity.profile.HorseOwner;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tournament_registrations",
        uniqueConstraints = @UniqueConstraint(name = "uq_tournament_horse", columnNames = {"tournament_id", "horse_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TournamentRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private HorseOwner owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "horse_id", nullable = false)
    private Horse horse;

    @Column(name = "is_reserve")
    @Builder.Default
    private Boolean isReserve = false;

    @Column(name = "reserve_order")
    private Integer reserveOrder;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RegistrationStatus status = RegistrationStatus.pending;

    public enum RegistrationStatus {
        pending, approved, rejected, cancelled
    }
}
