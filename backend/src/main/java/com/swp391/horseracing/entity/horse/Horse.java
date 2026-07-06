package com.swp391.horseracing.entity.horse;

import com.swp391.horseracing.entity.profile.HorseOwner;
import com.swp391.horseracing.entity.tournament.JockeyInvitation;
import com.swp391.horseracing.entity.tournament.RaceEntry;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import com.swp391.horseracing.entity.BaseEntity;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "horses")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@SuperBuilder
public class Horse extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private HorseOwner owner;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String breed;

    @Column(name = "health_status", length = 100)
    private String healthStatus;

    @Column(name = "health_certificate_url", length = 500)
    private String healthCertificateUrl; // lưu url của giấy khám sk

    @Column(name = "horse_code", length = 50)
    private String horseCode;

    @Column(length = 20)
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column
    private Double height;

    @Column
    private Double weight;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private HorseStatus status = HorseStatus.inactive;

    @OneToMany(mappedBy = "horse")
    private List<RaceEntry> raceEntries;

    @OneToMany(mappedBy = "horse")
    private List<JockeyInvitation> invitations;

    public enum HorseStatus {
        active, inactive,rejected, banned
    }
}
