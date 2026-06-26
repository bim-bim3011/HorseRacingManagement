package com.swp391.horseracing.entity.profile;

import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.result.RaceReport;
import com.swp391.horseracing.entity.result.RaceResult;
import com.swp391.horseracing.entity.result.Violation;
import com.swp391.horseracing.entity.tournament.RefereeAssignment;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "referees")
@PrimaryKeyJoinColumn(name = "user_id")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@SuperBuilder
public class Referee extends User {



    @Column(name = "full_name", nullable = false,length = 100)
    private String fullName;

    @Column(name = "license_number", nullable = false, unique = true, length = 50)
    private String licenseNumber;

    @OneToMany(mappedBy = "referee")
    private List<RefereeAssignment> assignments;

    @OneToMany(mappedBy = "confirmedBy")
    private List<RaceResult> confirmedResults;

    @OneToMany(mappedBy = "referee")
    private List<Violation> violations;

    @OneToMany(mappedBy = "referee")
    private List<RaceReport> reports;
}

