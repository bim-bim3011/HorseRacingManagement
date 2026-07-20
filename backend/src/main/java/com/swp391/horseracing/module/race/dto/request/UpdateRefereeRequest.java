package com.swp391.horseracing.module.race.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateRefereeRequest {
    private String username;

    @Email(message = "please enter valid email")
    private String email;

    private String password;
    private String fullName;
    private String licenseNumber;
    private String status;
}
