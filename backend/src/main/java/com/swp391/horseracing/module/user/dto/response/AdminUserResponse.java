package com.swp391.horseracing.module.user.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminUserResponse {
    Integer id;
    String username;
    String email;
    String status;
    BigDecimal walletBalance;
    List<String> roles;
    String createdAt;
    String userType; // To differentiate between HorseOwner, Jockey, Referee, Spectator
}
