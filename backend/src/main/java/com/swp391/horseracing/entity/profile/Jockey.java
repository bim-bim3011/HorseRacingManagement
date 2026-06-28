package com.swp391.horseracing.entity.profile;

import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.tournament.JockeyInvitation;
import com.swp391.horseracing.entity.tournament.RaceEntry;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    @Size(max = 255)
    @NotNull
    @Column(name = "first_name", nullable = false)
    private String firstName;
    @Size(max = 255)
    @NotNull
    @Column(name = "last_name", nullable = false)
    private String lastName;
    @NotNull
    @Column(name = "height", nullable = false, precision = 3, scale = 2)
    private BigDecimal height;
    @Size(max = 255)
    @NotNull
    @Column(name = "gender", nullable = false)
    private String gender;
    @Column(name = "dob")
    private LocalDate dob;

    public enum JockeyStatus {
        pending_certification, approval,rejected
    }
//    @Enumerated(EnumType.STRING)
//    @Column(name = "rank")
//    private Rank rank;
//
//    public enum Rank {
//        A, B, C
//    }
}
