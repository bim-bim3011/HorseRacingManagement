package com.swp391.horseracing.module.horse.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ViolationDto {
    private String raceName;
    private String tournamentName;
    private String description;
    private String penaltyRuleType;
}
