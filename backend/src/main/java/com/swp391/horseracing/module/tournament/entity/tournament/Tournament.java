package com.swp391.horseracing.module.tournament.entity.tournament;

import com.swp391.horseracing.core.common.entity.BaseEntity;
import com.swp391.horseracing.module.common.entity.result.Ranking;
import com.swp391.horseracing.module.race.entity.tournament.PenaltyRule;
import com.swp391.horseracing.module.race.entity.tournament.Race;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "tournaments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Tournament extends BaseEntity {



    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TournamentStatus status = TournamentStatus.upcoming;


    @Column(name = "weight_limit")
    private Float weightLimit;

    @Column(name = "min_horse_age")
    private Integer minHorseAge;

    @Column(name = "max_horse_age")
    private Integer maxHorseAge;

    @Column(name = "allowed_breed", length = 100)
    private String allowedBreed;




    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL)
    private List<PenaltyRule> penaltyRules;

    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL)
    private List<Race> races;

    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL)
    private List<Ranking> rankings;

    @Column(name = "registration_start")
    private LocalDate registrationStart;

    @Column(name = "registration_end")
    private LocalDate registrationEnd;

    @Column(name = "prize_pool", precision = 15, scale = 2)
    private BigDecimal prizePool;

    @Column(name = "registration_fee", precision = 15, scale = 2)
    private BigDecimal registrationFee;

    @Column(name = "max_participants")
    private Integer maxParticipants;

    @Column(name = "banner_url")
    private String bannerUrl;

    public enum TournamentStatus {
        upcoming, ongoing, completed
    }
}
