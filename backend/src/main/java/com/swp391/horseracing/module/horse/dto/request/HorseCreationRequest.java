package com.swp391.horseracing.module.horse.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HorseCreationRequest {
    @NotBlank(message = "Name is required")
    private String name;
    private String breed;
    private String horseCode;
    private String gender;
    private LocalDate dateOfBirth;
    private Double height;
    private Double weight;
    private String healthStatus;
}
