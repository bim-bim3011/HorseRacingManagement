package com.swp391.horseracing.module.jockey.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JockeyResponse {
    private Integer id;
    String username;
    String email;
    String fullName;
    Float weight;
    Integer experienceYears;
    String certificateUrl;
    String jockeyStatus;
    String rank;
    String firstName;
    String lastName;
    BigDecimal height;
    String gender;
    LocalDate dob;
}
