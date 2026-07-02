package com.swp391.horseracing.dto;


import lombok.*;

import java.util.Date;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtInfo {

    String jwtId;
    Date issueTime;
    Date expirationTime;
}
