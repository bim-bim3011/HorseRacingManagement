package com.swp391.horseracing.entity.horse;

import com.swp391.horseracing.entity.profile.HorseOwner;
import com.swp391.horseracing.entity.tournament.JockeyInvitation;
import com.swp391.horseracing.entity.tournament.RaceEntry;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "horses")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Horse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private HorseOwner owner;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String breed;

    @Column(name = "health_status", length = 100)
    private String healthStatus;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private HorseStatus status = HorseStatus.active;

    @OneToMany(mappedBy = "horse")
    private List<RaceEntry> raceEntries;

    @OneToMany(mappedBy = "horse")
    private List<JockeyInvitation> invitations;

    public enum HorseStatus {
        active, inactive, banned
    }
}
