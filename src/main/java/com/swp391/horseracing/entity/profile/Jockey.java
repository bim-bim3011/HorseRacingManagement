package com.swp391.horseracing.entity.profile;

import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.tournament.JockeyInvitation;
import com.swp391.horseracing.entity.tournament.RaceEntry;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "jockeys")
@PrimaryKeyJoinColumn(name = "user_id")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@SuperBuilder
public class Jockey extends User {



    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column
    private Float weight;

    @Column(name = "experience_years")
    private Integer experienceYears = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JockeyStatus jockeyStatus = JockeyStatus.pending_certification;

    @OneToMany(mappedBy = "jockey")
    private List<RaceEntry> raceEntries;

    @OneToMany(mappedBy = "jockey")
    private List<JockeyInvitation> invitations;

    @Column(name = "certificate_url", length = 500)
    private String certificateUrl;

    public enum JockeyStatus {
       pending_certification,approval
    }
}
