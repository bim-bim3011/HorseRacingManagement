package com.swp391.horseracing.module.race.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RaceReportRequest {
    
    @NotBlank(message = "Report content cannot be blank")
    String content;
}
