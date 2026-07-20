package com.swp391.horseracing.module.common.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class SpectatorResponse {

    Integer spectatorId;
    String username;
    String email;
    String status;

}
