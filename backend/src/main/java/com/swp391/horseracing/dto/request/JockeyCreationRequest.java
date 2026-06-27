package com.swp391.horseracing.dto.request;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JockeyCreationRequest {



    @NotBlank(message = "Username is required")
    String username;

    @NotBlank(message = "Email is required")
    @Email(message = "please enter valid email")
    String email;

    @NotBlank(message = "Password is required")
    String password;

    @NotBlank(message = "Full name is required")
    String fullName;

    @NotBlank(message = "First name is required")
    String firstName;

    @NotBlank(message = "Last name is required")
    String lastName;

    @NotNull(message = "Height is required")
    BigDecimal height;

    @NotNull(message = "Weight is required")
    Float weight;

    @NotBlank(message = "Gender is required")
    String gender;

    LocalDate dob;
}
