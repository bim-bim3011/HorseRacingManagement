package com.swp391.horseracing.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HorseOwnerResponse {

    Integer horseId;
    String fullName;
    String phone;
    String email;


}
