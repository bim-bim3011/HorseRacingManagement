package com.swp391.horseracing.module.user.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateUserProfileRequest {
    String username;
    
    // For Spectator / General
    // General users might not have specific profile fields, but we include them here 
    // to keep a unified request object.

    // For HorseOwner
    String fullName;
    String phone;

    // For Jockey
    String firstName;
    String lastName;
    Integer experienceYears;
    BigDecimal height;
    Float weight;
    String gender;
    LocalDate dob;
}
