package com.swp391.horseracing.dto.request;

import jakarta.validation.constraints.NotBlank;
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
    private Integer age;
    private String healthStatus;
}
