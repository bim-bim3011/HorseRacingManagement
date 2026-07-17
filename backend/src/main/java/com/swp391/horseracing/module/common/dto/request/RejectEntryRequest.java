package com.swp391.horseracing.module.common.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RejectEntryRequest {
    @NotBlank(message = "Rejection reason is required")
    private String rejectionReason;
}
