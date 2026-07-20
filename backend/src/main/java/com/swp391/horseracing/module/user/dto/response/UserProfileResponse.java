package com.swp391.horseracing.module.user.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserProfileResponse {
    Integer id;
    String username;
    String email;
    String status;
    List<String> roles;
    
    // Wallet info
    BigDecimal walletBalance;

    // Specific to HorseOwner & Jockey
    String fullName;

    // Specific to HorseOwner
    String phone;

    // Specific to Jockey
    Float weight;
    Integer experienceYears;
    String certificateUrl;
    String jockeyStatus;
    String firstName;
    String lastName;
    BigDecimal height;
    String gender;
    LocalDate dob;
}
