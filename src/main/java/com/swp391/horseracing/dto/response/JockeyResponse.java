package com.swp391.horseracing.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter @Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JockeyResponse {
    String username;
    String email;
    String fullName;
    Double weight;
    Integer experience_years;
    String certificate_url;
}
