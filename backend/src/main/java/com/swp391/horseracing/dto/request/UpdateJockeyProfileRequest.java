package com.swp391.horseracing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateJockeyProfileRequest {
    private String username;
    private String fullName;
    private Integer experience_year;

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
    private MultipartFile file;
}
