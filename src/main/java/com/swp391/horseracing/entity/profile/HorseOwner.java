package com.swp391.horseracing.entity.profile;

import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.horse.Horse;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "horse_owners")
@PrimaryKeyJoinColumn(name = "user_id")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class HorseOwner extends User {

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @OneToMany(mappedBy = "owner")
    private List<Horse> horses;
}

