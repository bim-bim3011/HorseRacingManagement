package com.swp391.horseracing.dto.request;


import jakarta.validation.constraints.Email;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HorseOwnerCreationRequest {


         String username;
         @Email(message = "please enter valid email")
         String email;
         String password;
         String fullName;
         String phone;


}
