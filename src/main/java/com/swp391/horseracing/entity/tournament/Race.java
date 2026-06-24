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

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;



    @Column(name = "round_order")
    private Integer roundOrder;           // thứ tự vòng: 1=vòng loại, 2=tứ kết...

    @Column(name = "is_final")
    @Builder.Default
    private Boolean isFinal = false;       // vòng chung kết hay không

    @Column(name = "max_entries")
    private Integer maxEntries;            // tối đa bao nhiêu ngựa

    @Column(name = "qualify_count")
    private Integer qualifyCount;          // lấy bao nhiêu ngựa vào vòng tiếp



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

