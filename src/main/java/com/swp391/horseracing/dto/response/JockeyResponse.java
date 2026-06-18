package com.swp391.horseracing.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter @Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JockeyResponse {

    Integer id;
    String username;
    String email;
    String fullName;
    String status;
    Float weight;
    String certificate_url;
    String jockeyStatus;
    Integer experienceYears ;


}
