package com.swp391.horseracing.dto;

import lombok.*;

import java.util.Date;
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenPayLoad {
    String Token;
    String jwtId;
    Date expirationTime;
}
