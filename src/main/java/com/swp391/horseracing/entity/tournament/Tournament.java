package com.swp391.horseracing.entity.tournament;

import com.swp391.horseracing.entity.result.Ranking;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "tournaments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TournamentStatus status = TournamentStatus.upcoming;

    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL)
    private List<Race> races;

    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL)
    private List<Ranking> rankings;

    public enum TournamentStatus {
        upcoming, ongoing, completed
    }
}
