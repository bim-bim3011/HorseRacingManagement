package com.swp391.horseracing.module.auth.dto;

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
