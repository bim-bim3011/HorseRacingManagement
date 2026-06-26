package com.swp391.horseracing.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

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
    Float  weight;
    Integer experienceYears;
    String certificateUrl;
    String jockeyStatus;
    String rank;
}
