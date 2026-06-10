package com.swp391.horseracing.entity.tournament;

import com.swp391.horseracing.entity.result.RaceReport;
import com.swp391.horseracing.entity.result.Violation;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "races")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Race {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "race_datetime", nullable = false)
    private LocalDateTime raceDatetime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RaceStatus status = RaceStatus.scheduled;

    @OneToMany(mappedBy = "race", cascade = CascadeType.ALL)
    private List<RaceEntry> entries;

    @OneToMany(mappedBy = "race", cascade = CascadeType.ALL)
    private List<JockeyInvitation> invitations;

    @OneToMany(mappedBy = "race", cascade = CascadeType.ALL)
    private List<RefereeAssignment> refereeAssignments;

    @OneToMany(mappedBy = "race", cascade = CascadeType.ALL)
    private List<Violation> violations;

    @OneToOne(mappedBy = "race", cascade = CascadeType.ALL)
    private RaceReport report;

    public enum RaceStatus {
        scheduled, checking, racing, finished, cancelled
    }
}

