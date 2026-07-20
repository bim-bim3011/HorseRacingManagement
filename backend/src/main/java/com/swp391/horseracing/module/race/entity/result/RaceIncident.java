package com.swp391.horseracing.module.race.entity.result;

import com.swp391.horseracing.module.race.entity.tournament.RaceEntry;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "race_incidents")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RaceIncident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_id", nullable = false)
    private RaceEntry entry;

    @Column(name = "referee_username", nullable = false)
    private String refereeUsername;

    @Column(name = "flag_timestamp", nullable = false)
    private Long timestamp;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
